-- Run ONLY if you previously initialized the original Human OS schema.
-- Safe to re-run. Does not replace a customized website name.
alter table public.site_settings add column if not exists portrait_media_id uuid references public.media(id) on delete set null;
update public.site_settings set site_name='Rhianne Ken S. Rama' where id=1 and site_name='THE HUMAN OS';
