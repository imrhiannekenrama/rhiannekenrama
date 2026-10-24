import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('database schema enables row level security on every content table',()=>{const s=read('supabase/schema.sql');for(const t of ['entries','media','entry_media','entry_links','entry_revisions','site_settings','contact_messages'])assert.match(s,new RegExp(`alter table public\\.${t} enable row level security`))});
test('owner registry is limited to one row',()=>assert.match(read('supabase/schema.sql'),/unique index if not exists one_owner_only/));
test('sensitive service role key is not defined as a public environment variable',()=>assert.doesNotMatch(read('.env.example'),/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=/));
test('Supabase private archive bucket is specified',()=>assert.match(read('supabase/schema.sql'),/values \('archive','archive',false/));
test('Next and Vercel entrypoints exist',()=>{assert.equal(existsSync(new URL('../app/layout.tsx',import.meta.url)),true);assert.equal(existsSync(new URL('../app/page.tsx',import.meta.url)),true);assert.equal(existsSync(new URL('../proxy.ts',import.meta.url)),true)});
test('verified MFA factor is required by the database owner policy',()=>{
 const sql=read('supabase/schema.sql');
 assert.match(sql,/auth\.mfa_factors/);
 assert.match(sql,/auth\.jwt\(\) ->> 'aal'\) = 'aal2'/);
});
test('owner and contact write endpoints check origin',()=>{
 assert.match(read('lib/api.ts'),/Cross-origin write rejected/);
 assert.match(read('app/api/contact/route.ts'),/Invalid request origin/);
});
test('personal site name is the default throughout metadata and database seed',()=>{
 assert.match(read('lib/data.ts'),/Rhianne Ken S\. Rama/);
 assert.match(read('supabase/schema.sql'),/site_name text not null default 'Rhianne Ken S\. Rama'/);
 assert.match(read('app/page.tsx'),/Hi, I’m/);
});
test('portrait setting is protected and public assets are explicitly whitelisted',()=>{
 assert.match(read('supabase/schema.sql'),/portrait_media_id uuid references public\.media/);
 assert.match(read('app/api/media/[id]/route.ts'),/publicPortrait\?\.portrait_media_id===id/);
 assert.match(read('app/api/studio/settings/route.ts'),/Choose a valid uploaded image for your portrait/);
 assert.match(read('app/api/studio/media/route.ts'),/active profile photo/);
});
test('responsive navigation and portrait editing are present',()=>{
 assert.match(read('components/site-header.tsx'),/Photos/);
 assert.match(read('components/site-header.tsx'),/nav-mobile/);
 assert.match(read('components/site-settings.tsx'),/Choose or upload my photo/);
 assert.match(read('components/profile-portrait.tsx'),/profile-photo/);
});
