# START HERE — Rhianne Ken S. Rama

This is a real Next.js + Supabase starter project for your personal universe, supplied as source code for VS Code. No account credentials are included.

## Five setup steps

1. **Unzip**, open the `rhianne-ken-rama-website` folder in VS Code, then run `npm install`.
2. **Supabase:** create a project and run the entire `supabase/schema.sql` file in SQL Editor. Create your owner in Authentication → Users, then run `insert into public.owner_accounts(user_id) values ('YOUR_AUTH_USER_UUID');` in SQL Editor. Disable public signups.
3. **Secrets:** copy `.env.example` to `.env.local`, then fill in your Supabase URL, publishable key and server-side service-role key. Never commit `.env.local`.
4. **Local site:** run `npm run dev`, open `http://localhost:3000`, and use `/owner/login`. In Studio Settings, enroll TOTP MFA. Add a first entry and publish it.
5. **Deploy:** commit and push to GitHub; in Vercel import the repository as a Next.js project, configure the four environment variables from `.env.example` (with `NEXT_PUBLIC_SITE_URL=https://YOUR_PROJECT.vercel.app`), and deploy. Set Supabase Auth site/redirect URLs to match.

**Recommended local verification:** `npm test`, `npm run check`, `npm run build`.

For the full walkthrough, security details, troubleshooting, and feature descriptions, read `README.md`.

> The advanced AI guide, 3D environment, fully visual drag-and-drop editor, automated video processing, visitor traffic analytics, production CAPTCHA/rate limiting and offsite binary backups remain roadmap items; they are not falsely represented as finished features.

**Your photo:** After sign-in, go to Studio → Settings & Security → Website identity → **My homepage photo**, upload/select it, then Save settings. The public homepage and About page both update. No photo is included in the package.

**For databases created with the old project:** Run `supabase/UPGRADE-EXISTING-DATABASE.sql` before using the portrait selector.
