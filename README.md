# Rhianne Ken S. Rama 🌌

**A futuristic personal website + private, single-owner Creator Studio.**

Made for **Next.js 16 / React 19 / Supabase / GitHub / Vercel**. Unzip into VS Code, connect your own Supabase project, run locally, push to GitHub, and import the repo into Vercel to receive a `your-project.vercel.app` URL.

**Important:** This repository contains the actual application source, not a static image or Figma mockup. The content and authentication features require *your* Supabase project. The website is personalized with the name Rhianne Ken S. Rama; no owner passwords or credentials are included. The project is not already deployed.

## 1. What is included

**Public:** responsive cosmic homepage, interactive Universe Explorer, pages for books, research, photos, courses, journal, projects, ideas and achievements, individual article/book/research pages, image galleries through content blocks, PDFs through file blocks, related-content links, timeline, public search, biography, contact form, SEO metadata, sitemap and robots settings, mobile navigation, accessible list navigation, reduced-motion support.

**Private:** one authorized owner login; Studio dashboard; rich block-based content editor (text, headings, quotes, lists, images, documents); drafts, scheduled publishing, public/private/unlisted visibility; preview, publish, archive, soft-delete and restore; revision history; tags, metadata, media vault with direct secure Supabase uploads; content relationships; homepage section organizer; site identity/about settings; private contact inbox; internal content statistics; JSON export.

**Security:** row-level security (RLS) on data; a single-row owner registry; server-verification of every management API; private storage bucket; time-limited media download URLs; server-protected unlisted share links; same-origin API mutations. No public account registration UI.

### Important scope limits

The app is a **substantial, extensible v1**, not a claim that every advanced idea from the master concept is production-finished. These require future work: automatic AI guide, full no-code visual page builder, animated 3D worlds, exhaustive knowledge visualization, drag-and-drop site editing, public visitor traffic analytics, comprehensive media/video streaming, contact spam rate-limiting/CAPTCHA, automatic offsite binary backups, rich PDF reading annotations, admin MFA enrollment UI, and verified production load/security testing.

The existing Universe Explorer uses interactive SVG nodes (not an expensive 3D engine), and Site Designer can reorder/hide homepage sections. Both can be expanded.

## 2. Prerequisites

- **Node.js 22.13+** and npm
- **VS Code** (optional but convenient)
- A **Supabase** project at https://supabase.com
- A **GitHub** account at https://github.com
- A **Vercel** account at https://vercel.com

## 3. Unzip and open locally

```bash
# In the unzipped project folder:
code .
npm install
cp .env.example .env.local
```

On Windows PowerShell, replace `cp` with:

```powershell
Copy-Item .env.example .env.local
```

Leave the dev server stopped until Supabase is configured.

## 4. Create your Supabase database

1. In Supabase, create a new project, choose a region, and save its database password in a password manager.
2. Open **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this project, paste all of it into the query, and **Run it once**. This creates tables, RLS rules, owner verification, and a private Storage bucket named `archive`.
4. Open **Authentication → Users**. Create your owner user manually with an email you control and a strong password. Confirm the account if necessary. **Do not send your password into source code.**
5. Copy the user's **UUID** from the Auth Users list.
6. In Supabase SQL Editor, run (replace the sample UUID with your actual Auth user's ID):

```sql
insert into public.owner_accounts(user_id)
values ('00000000-0000-0000-0000-000000000000');
```

**This is the sole authorized account.** The table has a unique index that permits only one row. Do not insert a second owner.

7. In Supabase Authentication settings, **disable new user signups** (the label may be “Allow new users to sign up”). A person creating another Auth account would not be an owner regardless, but closing signups is preferable for a single-user site.
8. After your first successful sign-in, open **Studio → Settings → Multifactor Authentication** and enroll a TOTP authenticator. Scan the QR code and verify a six-digit code. Future sign-ins require an authenticator challenge; owner database permissions also require AAL2 once a verified factor exists. Ensure MFA is enabled in the Supabase dashboard. Keep secure recovery options.
9. In Supabase **Project Settings / Connect / API Keys**, locate your project URL and **publishable key** (older projects may call it an anon key). You will also need a **secret/service-role key**, which must never appear in browser code or GitHub.

### RLS and privacy

The SQL policy grants anonymous reads **only** to already-due, published content with `visibility='public'`. Scheduled entries become public as soon as the timestamp is due, without a cron job. Private content is accessible only by the owner; unlisted entries are served by a server-only share-token route `/view/<token>`.

The file bucket is private. Public assets are served through the `/api/media/<id>` route, which checks whether a file is the selected public portrait or is referenced by permitted published content before issuing a short-lived signed URL.

## 5. Configure environment variables

Edit `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_VALUE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_SERVICE_ROLE_VALUE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Never commit `.env.local`, service-role secrets, passwords, access tokens, or personal private files.** It is already covered by `.gitignore`.

The service-role key is intentionally server-only: used for secure media signing, the public unlisted-share endpoint, and visitor message submission. The publishable key is intended for browser usage with RLS.

## 6. Start the local website

```bash
npm run dev
```

Open **http://localhost:3000**. The public site works even if there are zero published entries, showing appropriate empty states.

Visit **http://localhost:3000/owner/login**, sign in using your *manually created owner Auth account*, and start at **Creator Studio**.

Suggested first steps:

1. Open **Studio → Settings**, review your name, add your homepage portrait using **Choose or upload my photo**, fill in your introduction and biography, then save.
2. Open **Studio → Media Vault** and upload your book covers, photographs or PDF files.
3. Open **Studio → Content Library → New Entry**, pick a type (book, paper, album, course, journal, etc.), add content blocks and optional cover media.
4. Save as **Draft**. Use **Preview** to check the entry.
5. Choose **Public**, **Unlisted**, or **Private**. Select **Publish now** when ready.
6. Return to the public site to see your first entry. Links to related items can be added through **Studio → Connections**.

### How editing works

- **Save draft** updates the entry and withdraws it from public display if it was previously public. This is intentional and prevents unfinished changes from leaking. The old version is retained in revisions.
- **Publish now** releases the current entry immediately to its chosen audience.
- **Schedule publication** takes a future date and time. `status='scheduled'` and the scheduled UTC time are saved; RLS uses that time to make the entry discoverable when it is due. There is no scheduled background job.
- **Public** items appear in lists/search. **Unlisted** items are accessed via `/view/<share_token>` and are not indexed in lists. **Private** items require your account.
- The editor warns about unsaved changes. Full autosave is not implemented in this version; use Save draft.
- The **Revision History** button lets you recover earlier versions as private drafts.
- Soft-deleted items can be restored using Content Library → Trash/Restore.

### Uploads

Media Vault uploads files **directly from your authenticated browser to the private Supabase Storage bucket**, avoiding Vercel's serverless body-size limits. Current allowed formats are JPG/JPEG, PNG, GIF, WEBP, and PDF, up to 15MB per file; the SQL bucket restrictions enforce these limits. The `/api/studio/upload` endpoint exists as an alternative small-file server route but is not used by the primary interface.

Use an **image** block for image assets and a **file** block for downloadable PDFs. Linking a file to an entry updates its media access index so readers can view or download it after publication.

## 7. Test locally

```bash
npm test
npm run check
npm run build
npm run start
```

`npm test` runs the included content validation / schema safety tests. `npm run check` checks TypeScript. `npm run build` produces the production build. **Test the complete sign-in, uploads, private access, publish/unpublish, recovery and sharing workflows against your own real Supabase project before launch.**

## 8. Push to GitHub

From the extracted project folder:

```bash
git init
git add .
git commit -m "Build Rhianne Ken S. Rama personal universe"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Create an empty repository in GitHub first, and replace the URL with the real one. A `package-lock.json` file will be generated by `npm install`; commit it too for reproducible installs.

GitHub Actions in `.github/workflows/ci.yml` runs dependency installation, TypeScript checking, and unit tests on push.

## 9. Deploy to Vercel (`.vercel.app`)

1. In Vercel choose **Add New → Project**.
2. **Import your GitHub repository**.
3. Framework should be detected as **Next.js**. Root directory: project root. Install: `npm install`. Build: `npm run build` (defaults are usually fine).
4. In **Environment Variables**, add these values exactly (for the relevant environments):

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **server-only secret**
   - `NEXT_PUBLIC_SITE_URL` — `https://YOUR_PROJECT.vercel.app`

5. Set runtime to **Node.js 22** if available.
6. Click **Deploy**. Vercel gives you a subdomain like **`the-human-os.vercel.app`** (actual name depends on availability and project name).
7. Visit your deployment URL and verify public pages, owner sign-in, upload, draft, publication, private access, and contact messages.
8. In Supabase Authentication **URL Configuration**, update the **Site URL** and permitted redirect URLs to your real Vercel domain, especially if you later add email-based recovery or OAuth.

Environment changes require a **new deployment** to become active. Every new push to your GitHub main branch can trigger another production deployment.

## 10. Post-launch security checklist

- [ ] Supabase SQL schema executed successfully and RLS confirmed enabled.
- [ ] Exactly one owner row exists; public registration disabled.
- [ ] A strong owner password is used and TOTP MFA enrollment/challenge have been configured and tested.
- [ ] No real keys are present in the GitHub repository or public browser bundles.
- [ ] Owner routes and APIs reject anonymous access.
- [ ] Private and unlisted posts/files cannot be enumerated through public Supabase REST calls.
- [ ] Direct media links cannot expose unpublished uploads.
- [ ] Scheduled entry stays private until its specified time.
- [ ] Contact form has production anti-spam throttling / CAPTCHA (not yet included).
- [ ] Offsite database and binary storage backups are enabled and restore-tested.
- [ ] Mobile, keyboard navigation, and reduced-motion behavior are tested.
- [ ] The Vercel deployment passes `npm run build` and integration tests.

## 11. Project structure

```text
app/
  page.tsx                   Public homepage
  explore/                   Universe explorer
  [collection]/[slug]/       Dynamic content worlds and detail pages
  timeline/, search/, about/, contact/
  owner/login/               Owner-only login
  studio/                    Protected Creator Studio
  api/studio/                Owner-authorized endpoints
  api/media/[id]/            Permission-checked media delivery
  view/[token]/              Unlisted sharing
components/                  Reusable UI and editorial tools
lib/supabase/                Browser, server and privileged server clients
lib/auth.ts                  Owner validation
lib/data.ts                  Public data fetches
lib/validation.ts            Input validation
supabase/schema.sql          Database, RLS, storage and bootstrap instructions
public/                      Favicons and social card
.github/workflows/ci.yml     Source verification
.env.example                 Required environment variables
```

## 12. Extend next

Highest-value next iterations after a successful deployment:

1. **Custom section blocks** with drag-and-drop page builder, reusable layouts and real-time draft previews.
2. **Video support** via direct Supabase Storage upload or a video hosting service.
3. **Research viewer** with formatted DOI/BibTeX citations and structured bibliographies.
4. **Knowledge Galaxy v2** with actual content nodes, link filters, zoom, and keyboard navigation.
5. **Better owner UX**: autosave-to-private-revisions, multi-step publishing review, robust undo and redo.
6. **Production security**: verified MFA flow, CAPTCHA and rate limits, automated backups, audit log and stricter file/content validation.
7. **AI discovery guide** only after implementing a retrieval system restricted to permitted public content.

### Support / troubleshooting

- **Blank content pages:** check that you published an item as `Public`; `Private` and `Unlisted` items are deliberately omitted from public lists.
- **Cannot sign in:** verify the Auth user exists and the user's exact UUID was inserted in `owner_accounts`.
- **Missing permissions:** rerun inspection queries in Supabase, not the whole schema blindly. Verify row-level security and that you are signed in as the owner.
- **Uploads fail:** confirm the private `archive` bucket exists, file type/size is allowed, and storage object RLS policies were created.
- **Vercel builds fail:** run `npm install`, `npm run check`, and `npm run build` locally, then review Vercel's Build Logs.
- **Media thumbnails fail:** images are served through short-lived signed links and need a valid public reference or an owner session.
- **Share link not working:** make sure the item is Unlisted, published (or its scheduled time has arrived), and use its `/view/<token>` URL.
- **Content not updating:** redeploy after environment edits and refresh the page; public page fetches use dynamic server rendering.

---

Built as an extensible foundation for your lifelong digital universe. **You own the code, your Supabase data, and your deployment.**

## Personal portrait and navigation (Rhianne edition)

The homepage and About page display **Rhianne Ken S. Rama** and reserve a prominent portrait area. Until you upload an image, a designed RR monogram placeholder appears. **No example person/photo has been inserted.**

Once Supabase and owner sign-in are configured:

1. Open **Studio → Settings & Security → Website identity → My homepage photo**.
2. Click **Choose or upload my photo**. Upload your JPG, PNG, WEBP, or GIF photo (up to 15 MB) or choose one already in the Media Vault.
3. Click **Select**, then **Save website settings**.
4. Refresh the public homepage. Your photo appears automatically in the hero and About page.

The original file remains inside private Supabase Storage. The server permits public delivery of **only the exact image selected for the public profile**, plus media belonging to explicitly published entries; selecting a photo intentionally makes it public. To replace or remove it, return to Settings.

**Easy navigation:** The desktop header has Home, About, Books, Research, Photos, Updates, Explore, a More menu, and Search. Mobile visitors have a complete expandable menu. The homepage also has large quick links to Books, Research, Photos, Courses, and Life Updates.

### Existing Supabase database upgrade

If you have already run an earlier version of `supabase/schema.sql`, run **`supabase/UPGRADE-EXISTING-DATABASE.sql`** once in Supabase SQL Editor. This adds the optional portrait column and rebrands the old default website name without overwriting other customized names. New installations run `supabase/schema.sql` as usual.

## Design system and motion kit

This repository now includes the `design-kit/` folder: the reusable design language (tokens, palettes, motion components) packaged for any future project.

- `app/motion.css` — the animation layer, ported from the kit. One dial controls everything: `--speed` in `:root` (1 = current feel, 0.6 snappier, 1.6 slow and cinematic).
- `components/motion.tsx` — `KitMotion` (mounts in the root layout; scans for effects on every route change) and `SplitHeading` (headline words rise out of a mask).
- Effects opt in with attributes on any element: `data-reveal` (blur-in on scroll), `data-reveal="clip"` (wipe), `data-tilt="5"` (3D tilt following the cursor), `data-glow` (accent glow follows the cursor), `data-delay="0.2"` (stagger).
- All effects respect `prefers-reduced-motion`: motion is disabled and content settles instantly.
- `design-kit/demo/index.html` — open in a browser (double-click or VS Code Live Server) to browse the full kit: palettes (ocean, forest, ember, rose, mono), the speed slider, the page curtain, book covers, forms and more.

Where the effects are currently used: the homepage hero (word-reveal headline + cursor glow), homepage sections, world and story cards (staggered blur-in, 3D tilt on covers) and every page header. To animate another element, just add the attribute — no JavaScript needed.

## Verification performed on this build

- `npx tsc --noEmit` — no type errors.
- `npm run build` — production build succeeds with all routes compiled.
- `npm test` — all 15 tests pass.
- The design-kit demo was opened in a real (headless) Chrome: `kit.js` runs, headline splitting, scroll reveals, palette and speed controls all functional.
#   r h i a n n e k e n r a m a  
 