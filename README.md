# Zizo Donor and Surrogacy

Multi-page static HTML + Tailwind CSS + Vanilla JavaScript ES modules application with a full-stack Node/Express runtime and production Supabase backend (`Postgres`, `Auth`, `Storage`, `RLS`, `Edge Functions`, `pg_cron`).

## Quick Start (Local Development & Preview)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build responsive WebP/AVIF assets, compile Tailwind CSS, and prerender all static HTML pages:
   ```bash
   npm run build
   ```
3. Run unit tests:
   ```bash
   npm test
   ```
4. Start the server on port 3000:
   ```bash
   npm run dev
   ```

## Staff Portal & 2FA Testing Credentials

Navigate to `/admin/` to access the Staff Portal (email + password + mandatory TOTP 2FA):

- **Owner**: `owner@zizodonorandsurrogacy.com` / `ZizoOwner2026!`
- **Coordinator**: `coordinator@zizodonorandsurrogacy.com` / `ZizoCoord2026!`
- **Editor**: `editor@zizodonorandsurrogacy.com` / `ZizoEditor2026!`

On first sign-in, TOTP enrollment displays your authenticator key and a live setup code preview so you can enroll immediately. Sessions lock automatically after 30 minutes of inactivity.

## Supabase Production Setup

1. Copy `.env.example` to `.env` and populate `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, and `DEPLOY_HOOK_URL`.
2. Apply migrations in order via Supabase CLI:
   - `supabase/migrations/001_schema.sql` (schema, `btree_gist` exclusion constraint, storage buckets, `pg_cron`)
   - `supabase/migrations/002_rls.sql` (Row Level Security across all tables)
   - `supabase/migrations/003_seed.sql` (settings, consultation types, legacy testimonials, blog categories)
3. Deploy Edge Functions (`supabase/functions/create-booking`, `send-reminders`, etc.).
4. Configure Cloudflare Pages or Netlify build command as `npm run build` with publish directory `dist`.

## Acceptance & Test Checklist

- [ ] Warm White `#FAF9F6` global background; Charcoal `#17191A` strictly for footer, reviews band, scrolled text, and overlays.
- [ ] Header has 5 nav items + 1 CTA (`Book a Consultation`), dropdowns <= 4 items, transitions after 100px scroll.
- [ ] `.reveal` transition is `700ms cubic-bezier(.22,.61,.36,1)` and only Core Services / Surrogate images scale on hover.
- [ ] Booking flow creates confirmed consultation, serves `.ics` file, supports reschedule/cancel via signed token, and returns `409 Conflict` on simultaneous slot collision.
- [ ] Reviews enter as `pending`, require moderation before public display, and verified tokens are single-use.
- [ ] Publishing a blog post prerenders `/resources/blog/{slug}/` and updates `sitemap.xml` and `rss.xml`.
- [ ] Anonymous `GET` requests to `/api/bookings`, `/api/inquiries`, `/api/applications`, `/api/subscribers` return `401`.
