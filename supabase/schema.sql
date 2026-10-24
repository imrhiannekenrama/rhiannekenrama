-- Rhianne Ken S. Rama personal website — RUN THIS ONCE in Supabase SQL Editor.
-- Then create exactly ONE Auth user manually and INSERT their UUID into owner_accounts.
create extension if not exists pgcrypto;

create table if not exists public.owner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
-- Prevent more than one owner even if an insertion is attempted later.
create unique index if not exists one_owner_only on public.owner_accounts ((true));
alter table public.owner_accounts enable row level security;

create or replace function public.is_owner() returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.owner_accounts where user_id = (select auth.uid())
  ) and (
    -- Allow initial owner setup before MFA enrollment. Once any verified MFA factor exists,
    -- all owner database actions require an AAL2-authenticated JWT.
    not exists (select 1 from auth.mfa_factors mf where mf.user_id = (select auth.uid()) and mf.status = 'verified')
    or (auth.jwt() ->> 'aal') = 'aal2'
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;
create policy "owners read owner registry" on public.owner_accounts for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('book','research','album','course','journal','project','idea','achievement','page')),
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 180),
  summary text not null default '',
  body jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  cover_media_id uuid,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  published_at timestamptz,
  share_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint public_has_pub_date check (status not in ('scheduled','published') or published_at is not null)
);
create index if not exists idx_entries_list on public.entries(visibility,status,published_at desc);
create index if not exists idx_entries_type on public.entries(type);
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  filename text not null,
  mime text not null,
  bytes bigint not null check (bytes >= 0),
  alt_text text not null default '',
  caption text not null default '',
  created_at timestamptz not null default now()
);
alter table public.entries add constraint fk_cover_media foreign key(cover_media_id) references public.media(id) on delete set null;
create table if not exists public.entry_media (
  entry_id uuid not null references public.entries(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete cascade,
  primary key(entry_id,media_id)
);
create table if not exists public.entry_links (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.entries(id) on delete cascade,
  target_id uuid not null references public.entries(id) on delete cascade,
  label text not null default 'related to',
  check(source_id <> target_id),
  unique(source_id,target_id,label)
);
create table if not exists public.entry_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  id int primary key default 1 check(id=1),
  site_name text not null default 'Rhianne Ken S. Rama',
  tagline text not null default 'Writer, researcher, lifelong learner — and everything in between.',
  intro text not null default 'Welcome to my personal space. Discover my books, research, photographs, learning, and life stories.',
  about text not null default '',
  contact_email text not null default '',
  accent text not null default 'lavender' check(accent in ('lavender','cyan','amber')),
  show_contact boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(1) on conflict (id) do nothing;
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.entries enable row level security;
alter table public.media enable row level security;
alter table public.entry_media enable row level security;
alter table public.entry_links enable row level security;
alter table public.entry_revisions enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- Anonymous listing can see ONLY published public content. Scheduled content automatically
-- goes live at the specified instant without depending on a cron job.
create policy "read public entries or owner" on public.entries for select to anon,authenticated using (
  (deleted_at is null and visibility='public' and status in ('published','scheduled') and published_at <= now())
  or (select public.is_owner())
);
create policy "owner writes entries" on public.entries for all to authenticated
  using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner reads media records" on public.media for select to authenticated using ((select public.is_owner()));
create policy "owner writes media records" on public.media for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner link media" on public.entry_media for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner manage links" on public.entry_links for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "public reads links only between published items" on public.entry_links for select to anon,authenticated using (
  exists(select 1 from public.entries e where e.id=source_id and e.visibility='public' and e.deleted_at is null and e.status in ('published','scheduled') and e.published_at<=now())
  and exists(select 1 from public.entries e where e.id=target_id and e.visibility='public' and e.deleted_at is null and e.status in ('published','scheduled') and e.published_at<=now())
);
create policy "owner reads revisions" on public.entry_revisions for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "public reads site settings" on public.site_settings for select to anon,authenticated using (true);
create policy "owner edits site settings" on public.site_settings for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "owner reads messages" on public.contact_messages for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

-- Private storage bucket. Files are accessed via short-lived URLs minted by a protected server route.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('archive','archive',false,15728640,array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict(id) do update set public=false;
create policy "owner upload archive" on storage.objects for insert to authenticated
  with check (bucket_id='archive' and (select public.is_owner()));
create policy "owner read archive" on storage.objects for select to authenticated
  using (bucket_id='archive' and (select public.is_owner()));
create policy "owner delete archive" on storage.objects for delete to authenticated
  using (bucket_id='archive' and (select public.is_owner()));

-- FINAL OWNER BOOTSTRAP (perform manually after creating an Auth user):
-- insert into public.owner_accounts(user_id) values ('YOUR_AUTH_USER_UUID');
-- Disable "Allow new users to sign up" in Supabase Authentication settings.

-- Page Designer: ordered, configurable sections for the homepage.
alter table public.site_settings add column if not exists home_sections text[] not null default array['worlds','latest','timeline'];

-- Public profile photo selected by the owner. Image bytes stay in the private archive
-- and are served through /api/media/[id] only while selected for this setting.
alter table public.site_settings add column if not exists portrait_media_id uuid references public.media(id) on delete set null;
-- Safely rebrand installations that still have the old uncustomized site name.
update public.site_settings set site_name='Rhianne Ken S. Rama' where id=1 and site_name='THE HUMAN OS';
