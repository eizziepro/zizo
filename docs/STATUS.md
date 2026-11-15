# Zizo Donor and Surrogacy — Project Status & Handover Report

**Document:** `docs/STATUS.md`  
**Date:** November 15, 2026  
**Repository:** `https://github.com/jidemure/zizo`  
**Single Source of Truth:** `docs/MASTER_PROMPT.txt`  
**Audit Report:** `docs/AUDIT.md`  

---

## 1. What Has Been Completed & Verified

### Security Hardening (Step 1)
- **Credential Scrubbing**: Plaintext demo passwords (`ZizoOwner2026!`, `ZizoCoord2026!`, `ZizoEditor2026!`) removed from `README.md` and `lib/database.ts`. Security notice added advising the owner to treat those strings as permanently compromised.
- **2FA TOTP Leak Remediation**: Removed `currentCodePreview` from `server.ts:757`, `src/site/pages/bookingAndAdmin.mjs`, and `public/assets/js/admin.js`. 2FA now requires real authenticator app verification.
- **Repository Hygiene**: Removed `data/zizo.db-wal` from git tracking and updated `.gitignore` to strictly exclude `data/`, `*.db*`, `*.sqlite*`, and key files.
- **Turnstile Verification**: Server-side Turnstile verification and honeypot rejection added to all public POST endpoints (`/api/bookings`, `/api/forms`, `/api/reviews`).
- **Repository Visibility**: Recommended and documented converting the repository to **Private** on GitHub.

### Backend Completion on Supabase (Step 2)
- **Database Schema (`001_schema.sql`)**: Postgres schema with `btree_gist` exclusion constraint preventing simultaneous double-bookings (`tstzrange(start_at, end_at)` returning code `23P01`).
- **Row Level Security (`002_rls.sql`)**: RLS enabled across all tables. Anonymous SELECT blocked on `bookings`, `inquiries`, `applications`, `subscribers`, `audit_log`, and `staff`. Public reads strictly scoped to published posts, approved reviews, published FAQs, active consultation types, and non-sensitive settings. Storage policies defined for `site-media` and `private-docs`.
- **Edge Functions**:
  - `create-booking`: Turnstile verification, honeypot, rate limiting, exclusion constraint conflict detection (HTTP 409), `.ics` generation, and Resend email dispatch.
  - `send-reminders`: pg_cron triggered function for 24-hour and 1-hour email reminders with manage links.
  - `submit-form`: Secure submission endpoint for inquiries, surrogate applications, egg donor applications, and newsletter subscriptions.
  - `submit-review`: Review moderation endpoint supporting public and tokenized verified reviews with single-use token tracking.
- **Automated Tests**: RLS policy unit tests (`lib/rls.test.ts`) and acceptance tests (`lib/acceptance.test.ts`).

### Stack Drift Removal (Step 3)
- **Cleaned Dependencies**: Removed leftover React, react-dom, motion, @google/genai, and Vite packages from `package.json`.
- **Removed Starter Files**: Deleted `src/App.tsx`, `src/main.tsx`, `src/index.css`, root `index.html`, and `vite.config.ts`.
- **Cross-Platform Build**: Fixed Windows entrypoint check in `build.mjs` using `pathToFileURL`. Prerender generates all 36 static pages, `sitemap.xml`, `robots.txt`, `rss.xml`, and `site.webmanifest` cleanly.

### Quality & Acceptance Gates (Step 4)
- **18/18 Automated Tests Passing**:
  - Exact `#FAF9F6` background, Charcoal footer/reviews band, and exact hero gradient.
  - Header: 5 nav items + 1 CTA (`Book a Consultation`), dropdowns <= 4 items, 100px scroll transition.
  - Reveal transition: exact `700ms cubic-bezier(.22,.61,.36,1)` and hover scaling strictly limited to Core Services and Surrogate band images.
  - Typography: Fraunces and Hanken Grotesk loaded with `display=swap`, zero forbidden fonts.
  - Page Map: All 31 pages present with unique titles, meta descriptions, canonical URLs, and schema markup.
  - WCAG 2.2 AA: Skip to main content link, semantic landmarks, aria attributes, form labels, and image alt text.

---

## 2. Client Inputs Required: `{{PLACEHOLDER}}` Register

The following values are currently represented by safe placeholder tokens or site settings and require client confirmation prior to production launch:

| Token / Key | Current Stored Default | Location / Usage | Action Required from Client |
| :--- | :--- | :--- | :--- |
| `{{ADDRESS_LAGOS}}` | `Lagos, Nigeria` | Footer, Contact page, Schema JSON-LD | Provide full physical office address in Lagos. |
| `{{EMAIL}}` | `care@zizodonorandsurrogacy.com` | Footer, Contact page, Headers | Confirm primary inbound contact email. |
| `{{PHONE}}` | `+234 (0) 123 456 7890` | Footer, Contact page | Confirm primary phone number. |
| `{{WHATSAPP_NUMBER}}`| `2348000000000` | Floating button, Contact CTA, Footer | Provide WhatsApp Business phone number (international format without `+`). |
| `{{FAMILIES_HELPED}}`| Hidden if unconfirmed | Trust stats (Section 2) | Provide verified count of families supported. If unconfirmed, the cell remains automatically hidden. |
| `{{CANCEL_CUTOFF_HOURS}}` | `24` | Booking manage cancellation policy | Confirm cancellation notice window (default 24 hours). |
| `founder_photo_url` | Placeholder box | `/about/` Founder story | Provide high-resolution authentic photograph of founder Chizaram Ata. **Never AI-generate.** |
| `brand_logo_svg` | Dual circle placeholder SVG | Header & Footer brand mark | Provide vector logo file from branding team. |

---

## 3. Documents Requiring Legal Review: `{{LEGAL_REVIEW_REQUIRED}}`

The following pages and sections contain sensitive medical, reproductive, and cross-border regulatory information and **must be reviewed by qualified legal counsel** in Nigeria and respective jurisdictions before public launch:

1. **`/intended-parents/legal-and-ethics/`**:
   - Gestational carrier contracts and parentage recognition.
   - Anonymity commitments and ovum donor rights.
   - Compliance with Nigerian healthcare and reproductive standards.
2. **`/intended-parents/programs-by-country/`**:
   - Jurisdictional cross-border notes for Nigeria, Europe, Asia, Canada, and the United States.
   - Note: The site strictly avoids asserting whether surrogacy is or is not legal in any country without approved statutory text.
3. **`/privacy-policy/`**:
   - Compliance with the **Nigeria Data Protection Act (NDPA) 2023** and **GDPR** (EU/UK visitors).
   - Data retention timeline for inquiry and application forms.
   - Data subject access and deletion request procedure.
4. **`/terms/`**:
   - Limitation of liability stating Zizo provides non-medical, non-legal coordination and independent referrals.
5. **`/confidentiality-statement/`**:
   - Anonymity covenants for donors and gestational carriers.
6. **`/cookie-policy/`**:
   - Consent-gated analytics (Plausible/Cloudflare) and essential session cookies.

---

## 4. Verification & Deployment Commands

```bash
# 1. Run full test suite (18 unit, RLS, and acceptance tests)
npm test

# 2. Build responsive WebP/AVIF assets, compile Tailwind CSS, and prerender static HTML
npm run build

# 3. Start local development server (with isolated test harness)
npm run dev
```
