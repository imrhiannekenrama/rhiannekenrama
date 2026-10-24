# Rhianne Ken S. Rama — DEVELOPMENT ROADMAP

## Implemented v1 foundation

- Public website, animated-feeling SVG galaxy, editorial reading pages, galleries, timeline, search and responsive interface
- Creator Studio with owner-only access, content types, block editor, previews, drafts, publishing and scheduling
- Media uploads directly to private Supabase Storage, permission-checked access, image/file content blocks
- Public, unlisted and private visibility; shared-token unlisted pages; content revisions, archive and restoration
- Homepage section order/visibility, personal settings and biography, content connections, contact inbox, basic content statistics and JSON metadata export
- Security baseline: Supabase RLS, one-owner registry, MFA with TOTP and AAL2 owner protection, origin checks, short-lived media URLs
- GitHub CI skeleton, sitemap, metadata, robots, theme, mobile and reduced-motion support

## Priority A — Production hardening

1. Real Supabase end-to-end testing in local/staging environment
2. CAPTCHA / Turnstile and rate limits on public contact form
3. Automated database and binary object offsite backups plus restore drills
4. Centralized observability, alerts, audit events and anomaly detection
5. Accessibility testing and keyboard/screen-reader audits
6. Security review of file ingestion, share-token lifecycle and MFA recovery
7. Upgrade repository to pin and lock production dependencies

## Priority B — Advanced creation workflow

1. Block editor toolbar and text formatting, drag-and-drop block ordering, undo/redo
2. Private autosave and side-by-side draft/public revisions
3. Bulk media tagging, albums, alt-text editor, replacing assets in referenced entries
4. No-code dynamic page templates, rich navigation editor, reusable design sections
5. Course tracker, publication metadata validation (ISBN/DOI), citations and BibTeX
6. More robust global search across body text and related-content ranking
7. Full import/export including private media ZIP and future migrations

## Priority C — Futuristic experience

1. Data-backed, zoomable knowledge graph rather than category-only nodes
2. More detailed life timeline with years, filters, geotag privacy and memories
3. Optional 3D orbit visuals that preserve accessible 2D/list fallbacks
4. Light/dark/focus modes and visitor-adjustable typography
5. AI assistant restricted to intentionally published, source-cited content
6. Secure video/audio support using specialized hosted streaming and transcoding
7. Annual recaps, personal dashboards, curated visitor trails and hidden rooms

## Project conventions

- `/app` contains Next.js App Router route pages and API handlers.
- `/components` contains reusable React components.
- `/lib` holds Supabase clients, security, validation and data access.
- `/supabase/schema.sql` declares database structures and RLS policies.
- Do not use client-side checks as the only authorization. Private operations must also be guarded by authenticated server handlers and RLS.
- Unlisted links are not a replacement for private access. Treat public URL shares as forwardable.
- All content editors must preserve revisions before overwriting published entries.
