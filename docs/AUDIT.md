# Zizo Donor and Surrogacy — Comprehensive Project Audit

**Document:** `docs/AUDIT.md`  
**Date:** November 15, 2026  
**Auditor:** Antigravity Engineering (Google DeepMind Pair Programming Assistant)  
**Specification Source of Truth:** `docs/MASTER_PROMPT.txt` (`zizo-master-prompt.txt`)  
**Repository:** `https://github.com/jidemure/zizo`  
**Commit Audited:** `7cb0801` ("feat: initialize project foundation")

---

## Executive Summary

The project was bootstrapped via Google AI Studio as a hybrid scaffold. While the visual layer and template generator (`src/site/`, `src/styles/`, `build.mjs`) have been crafted with exceptional fidelity to the master prompt (exact clamp tokens, Fraunces + Hanken Grotesk typography, exact hero gradient, exact 700ms cubic-bezier reveal transition, and strict color usage), the underlying architecture suffers from **critical security vulnerabilities**, **stack drift** from leftover React/Vite boilerplate, and a **divergence between backend specification and reality** (local SQLite mock vs. Supabase production architecture).

Before any feature expansion or launch, the critical security vulnerabilities must be resolved immediately: hardcoded staff credentials published in `README.md` and `lib/database.ts`, the database write-ahead log (`data/zizo.db-wal`) committed to public git history, and a TOTP setup bypass in `server.ts` that leaks active 2FA codes directly to client JSON.

---

## 1. Classification Matrix: State of the Repository

| Category | Component / File | Status | Description & Master Prompt Reference |
| :--- | :--- | :--- | :--- |
| **Done & Correct** | `src/styles/tokens.css` | **PASS** | Exact color hex codes, fluid clamp type scales, spacing, component dimensions matching lines 41–46. |
| **Done & Correct** | `src/styles/main.css` | **PASS** | Tailwind v4 `@theme` mapping, exact hero gradient (`rgba(23,25,26,.88)` to `rgba(23,25,26,.42)`), exact `.reveal` transition (`700ms cubic-bezier(0.22, 0.61, 0.36, 1)`), reduced-motion media query. |
| **Done & Correct** | Typography Loading | **PASS** | `Fraunces:opsz,wght@9..144,400;500;600` and `Hanken Grotesk:wght@400;500;600` loaded with `display=swap` and `preconnect`. No forbidden fonts (Inter, Manrope, Poppins, etc.) in templates. |
| **Done & Correct** | Responsive Image Pipeline | **PASS** | `scripts/build-assets.mjs` generates 640w, 1024w, 1920w, 3840w in AVIF and WebP with explicit width/height and picture tags for all 8 core scenes. |
| **Done & Correct** | Vector Cartography | **PASS** | `public/assets/img/country-*.svg` neutral non-person map illustrations for Nigeria, Europe, Asia, Canada, USA. |
| **Done & Correct** | Page Generation (`build.mjs`) | **PASS** | Generates all 31 static HTML pages, `sitemap.xml`, `robots.txt`, `rss.xml`, and `site.webmanifest` into `dist/`. |
| **Done & Correct** | Ethical Imagery Policy | **PASS** | Founder portrait for Chizaram Ata displays a graceful placeholder; no synthetic/AI faces were generated for the founder. |
| **Done & Correct** | Quirk Preservation | **PASS** | Copyright explicitly 2026; Service 01 formatted as "01 / 04"; Process heading in `#12504C`; source typos ("greatful", missing hyphens) corrected. |
| **Done but Wrong** | `README.md` | **FAIL (CRITICAL)** | Plaintext credentials for `owner`, `coordinator`, and `editor` published publicly in the repository. |
| **Done but Wrong** | `lib/database.ts` | **FAIL (CRITICAL)** | Plaintext default passwords hashed inline in seed logic; SQLite schema duplicating Supabase tables. |
| **Done but Wrong** | `server.ts:757` | **FAIL (CRITICAL)** | `currentCodePreview: generateTotpCode(secret)` transmitted over `/api/admin/auth/login`, bypassing real TOTP enrollment. |
| **Done but Wrong** | `.gitignore` & `data/` | **FAIL (CRITICAL)** | `data/zizo.db-wal` (960 KB) committed to git; `.gitignore` fails to exclude `data/*.db`, `data/*.db-wal`, `data/*.db-shm`. |
| **Done but Wrong** | `server.ts` & `package.json` | **FAIL** | Runtime uses `better-sqlite3` and in-memory mock queues instead of connecting to Supabase Postgres, RLS, and Auth. |
| **Done but Wrong** | `index.html` (root) & React | **FAIL** | Root `index.html`, `src/App.tsx`, `src/main.tsx`, and `vite.config.ts` are leftover React scaffolding completely unused by `build.mjs`. |
| **Partial** | `supabase/functions/create-booking` | **PARTIAL** | Validates consultation type and exclusion constraint, but missing Turnstile verification, rate limiting, and Resend email/.ics dispatch. |
| **Partial** | `supabase/migrations/001-003` | **PARTIAL** | Schemas and RLS match specs, but missing automated migration runner, edge function webhooks, and storage bucket definitions. |
| **Partial** | `public/assets/js/booking.js` | **PARTIAL** | 4-step calendar wizard works against local Express endpoints, but lacks integration with Supabase Edge Functions. |
| **Partial** | `public/assets/js/admin.js` | **PARTIAL** | Comprehensive 1,200-line admin SPA, but currently authenticates against local Express session rather than Supabase GoTrue Auth. |
| **Missing** | Supabase Edge Functions | **MISSING** | Missing `submit-inquiry`, `submit-application`, `submit-review`, and `newsletter-subscribe` Edge Functions. |
| **Missing** | Resend Transactional Email | **MISSING** | Confirmation emails with `.ics` attachments and reminders are queued to an SQLite table rather than calling Resend API. |
| **Missing** | Cloudflare Turnstile Server Verification | **MISSING** | Form handlers in `server.ts` do not verify Turnstile tokens with Cloudflare's siteverify API. |
| **Missing** | Automated Supabase RLS Tests | **MISSING** | Unit tests exist for availability and token hashing, but no integration tests verify that anonymous SELECT is blocked on private tables. |

---

## 2. In-Depth Audit Findings

### 2.1 Stack Drift & Leftover Artifacts
- **Findings:** `package.json` includes `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `lucide-react`, `motion`, `@google/genai`, and `vite`.
- **Evidence:**
  - `src/App.tsx` contains an empty component: `export default function App() { return <div></div>; }`.
  - `src/main.tsx` attempts to mount `App` into `<div id="root"></div>`.
  - `index.html` at root is the generic Google AI Studio shell (`<title>My Google AI Studio App</title>`).
  - Neither `build.mjs` nor `public/assets/js/site.js` imports React, motion, or `@google/genai`.
  - Motion is implemented entirely via standard CSS (`src/styles/main.css:262-311`) using the exact `700ms cubic-bezier(.22,.61,.36,1)`.
  - Icons are handled client-side via vanilla `public/assets/vendor/lucide.min.js` and `lucide.createIcons()`.
- **Remediation Plan:**
  1. Remove `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `lucide-react`, `motion`, and `@google/genai` from `package.json`.
  2. Remove `src/App.tsx`, `src/main.tsx`, `src/index.css`, `index.html` (root), and `vite.config.ts`.
  3. Ensure `npm run build` relies solely on `node scripts/build-assets.mjs`, `@tailwindcss/cli`, and `node build.mjs`.

---

### 2.2 Backend Reality: SQLite vs. Supabase Specification
- **Findings:** The specification calls for static HTML prerendered by `build.mjs` hosted on Cloudflare Pages/Netlify, communicating with Supabase for Postgres, Auth, RLS, Storage, and Edge Functions. Currently, all dynamic interactions talk to an Express server (`server.ts`) backed by SQLite (`better-sqlite3`).
- **Audit of Current Endpoints:**
  - `POST /api/bookings`: Writes to SQLite `bookings` table; mocks email into `email_outbox`.
  - `GET /api/availability`: Queries SQLite `availability_rules` and `bookings`.
  - `GET /api/bookings/manage`: Validates signed tokens using a local Node `crypto` HMAC against SQLite.
  - `POST /api/reviews`: Validates payload and writes directly to SQLite `reviews` table as `pending`.
  - `POST /api/forms`: Inquiries, surrogate applications, egg donor applications, and newsletter subscriptions write to SQLite.
  - `POST /api/admin/auth/login`: Custom scrypt authentication against SQLite `staff` table.
- **Supabase Gaps:**
  - No client-side or build-time script currently initializes `@supabase/supabase-js`.
  - Edge Functions exist only for `create-booking` and `send-reminders`, but neither is connected to the frontend.
  - Public writes currently bypass Edge Functions.
- **Remediation Plan:**
  1. Transition client forms (`public/assets/js/site.js`, `booking.js`) to target Supabase Edge Functions (`/functions/v1/...`) when configured, with fallback to an isolated development server for offline work.
  2. Maintain `server.ts` solely as an optional local development proxy and test harness, completely disallowing its use in production.

---

### 2.3 Design Tokens & CSS Variable Verification
- **Verification:**
  - `src/styles/tokens.css` was audited against master prompt lines 41–46.
  - **Colors:** `--charcoal` (`#17191A`), `--warm-white` (`#FAF9F6`), `--deep-teal` (`#17645F`), `--teal-hover` (`#155A56`), `--teal-strong` (`#12504C`), `--teal-tint` (`#8BB2AF`), `--teal-tint-soft` (`#74A29F`), `--border` (`#E1E0DD`), `--muted-surface` (`#E1E0DD`), `--text-body` (`#2E3031`), `--text-caption` (`#5D5E5F`). **100% Match.**
  - **Type Scale:** Fluid clamp scales from `--fs-small` to `--fs-h1` match exact rem and vw formulas. **100% Match.**
  - **Spacing & Components:** `--space-xs` through `--space-xl`, `--hero-min-height`, `--radius`, and `--btn-pad-*` match exact formulas. **100% Match.**
  - **Tailwind v4 Theme:** `src/styles/main.css` correctly maps `--color-*` and font families to `@theme`.
  - **Ad-hoc Pixel Audit:** No inline ad-hoc pixel values found outside of 1px borders, standard 16px form inputs, and SVG viewBox coordinates.

---

### 2.4 Typography & Font Compliance
- **Verification:**
  - Loaded font link in `src/site/partials/layout.mjs:99`:
    `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;500;600&family=Hanken+Grotesk:wght@400;500;600&display=swap`
  - Font families defined in `src/styles/main.css:19-20`:
    `--font-display: "Fraunces", Georgia, serif;`
    `--font-sans: "Hanken Grotesk", system-ui, sans-serif;`
  - **Forbidden Fonts Scan:** No occurrences of Inter, Manrope, Poppins, Dela Gothic One, Roboto, Lato, or Arial in templates, styles, or scripts.

---

### 2.5 Layout Fidelity & Interaction Details
- **Page Background:** Strictly `#FAF9F6` applied on `<html>` and `<body>` in `src/styles/main.css:25,32` and `src/site/partials/layout.mjs:105`.
- **Dark Charcoal Bands:** Strictly confined to Section 6 (Reviews & Testimonials, `src/site/pages/home.mjs:409`) and Section 11 (Footer, `src/site/partials/layout.mjs:314`).
- **Hero Gradient:** Exact linear gradient verified in `src/styles/main.css:98-105`:
  `linear-gradient(to top, rgba(23, 25, 26, 0.88), rgba(23, 25, 26, 0.10) 55%, rgba(23, 25, 26, 0.42))`
- **Reveal Transition:** Verified in `src/styles/main.css:263-272` as `700ms cubic-bezier(0.22, 0.61, 0.36, 1)`.
- **Hover Scaling Restrictions:**
  - Verified: Scaling `scale-[1.03]` with `duration-700` is strictly restricted to image containers in Core Services (`home.mjs:245,271,295,321`), Surrogate Band (`home.mjs:473`), and Service Details (`aboutAndServices.mjs:289`).
  - No hover scaling exists on buttons, navigation links, or text elements.
- **Sticky Header Scroll Threshold:** Verified in `public/assets/js/site.js:29` (`if (y > 100)`). On the Home page, starts transparent with white text, transitioning to `#FAF9F6/90 backdrop-blur-xl` with Charcoal text past 100px. On interior pages, starts solid.
- **Mobile Menu & Dropdowns:**
  - Mobile menu toggles `top-full` drawer with `backdrop-blur-xl`, updates `aria-expanded`, locks body scroll (`overflow = 'hidden'`), closes on Escape or link click, and resets on resize `>= 1024px`.
  - Desktop dropdowns support keyboard arrow navigation (`ArrowDown`/`ArrowUp`), Escape key, and outside click dismiss.

---

### 2.6 Page Map & Metadata Audit

| URL Route | Template File | Title & Description | Canonical | JSON-LD | Sitemap Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `src/site/pages/home.mjs` | Unique, brand voice | Present | Organization, WebSite | Included |
| `/about/` | `src/site/pages/aboutAndServices.mjs` | Unique, Chizaram story | Present | BreadcrumbList | Included |
| `/services/` | `src/site/pages/aboutAndServices.mjs` | Unique, hub overview | Present | BreadcrumbList | Included |
| `/services/surrogacy/` | `src/site/pages/aboutAndServices.mjs` | Unique, detailed | Present | Service, BreadcrumbList | Included |
| `/services/ovum-donation/` | `src/site/pages/aboutAndServices.mjs` | Unique, detailed | Present | Service, BreadcrumbList | Included |
| `/services/personalized-matching/`| `src/site/pages/aboutAndServices.mjs` | Unique, detailed | Present | Service, BreadcrumbList | Included |
| `/services/counseling-ivf-support/`| `src/site/pages/aboutAndServices.mjs` | Unique, detailed | Present | Service, BreadcrumbList | Included |
| `/intended-parents/how-it-works/` | `src/site/pages/intendedParents.mjs` | Unique, 5 phases | Present | BreadcrumbList | Included |
| `/intended-parents/programs-by-country/` | `src/site/pages/intendedParents.mjs` | Unique, 5 regions | Present | BreadcrumbList | Included |
| `/intended-parents/costs-and-packages/` | `src/site/pages/intendedParents.mjs` | Unique, transparent | Present | BreadcrumbList | Included |
| `/intended-parents/legal-and-ethics/` | `src/site/pages/intendedParents.mjs` | Unique, compliance | Present | BreadcrumbList | Included |
| `/surrogates-donors/become-a-surrogate/` | `src/site/pages/surrogatesDonors.mjs` | Unique, caring | Present | BreadcrumbList | Included |
| `/surrogates-donors/become-an-egg-donor/` | `src/site/pages/surrogatesDonors.mjs` | Unique, respectful | Present | BreadcrumbList | Included |
| `/surrogates-donors/compensation-and-support/` | `src/site/pages/surrogatesDonors.mjs` | Unique, clear | Present | BreadcrumbList | Included |
| `/resources/blog/` | `src/site/pages/resourcesAndForms.mjs` | Unique, journal | Present | BreadcrumbList | Included |
| `/resources/blog/category/{slug}/` | `src/site/pages/resourcesAndForms.mjs` | Unique per category | Present | BreadcrumbList | Included |
| `/resources/blog/{slug}/` | `src/site/pages/resourcesAndForms.mjs` | Unique per post | Present | BlogPosting, Breadcrumb | Included |
| `/resources/faq/` | `src/site/pages/resourcesAndForms.mjs` | Unique, categorized | Present | FAQPage, Breadcrumb | Included |
| `/resources/stories-and-reviews/` | `src/site/pages/resourcesAndForms.mjs` | Unique, stories | Present | BreadcrumbList | Included |
| `/book/` | `src/site/pages/bookingAndAdmin.mjs` | Unique, 4-step wizard | Present | BreadcrumbList | Included |
| `/book/confirmed/` | `src/site/pages/bookingAndAdmin.mjs` | Unique, confirmation | Present | noindex, nofollow | Excluded (correct) |
| `/book/manage/` | `src/site/pages/bookingAndAdmin.mjs` | Unique, reschedule/cancel | Present | noindex, nofollow | Excluded (correct) |
| `/contact/` | `src/site/pages/resourcesAndForms.mjs` | Unique, direct contact | Present | BreadcrumbList | Included |
| `/thank-you/` | `src/site/pages/resourcesAndForms.mjs` | Generic success | Present | noindex, nofollow | Excluded (correct) |
| `/review/submit/` | `src/site/pages/resourcesAndForms.mjs` | Tokenized review form | Present | noindex, nofollow | Excluded (correct) |
| `/admin/` | `src/site/pages/bookingAndAdmin.mjs` | Staff portal | Present | noindex, nofollow | Excluded (correct) |
| `/privacy-policy/` | `src/site/pages/resourcesAndForms.mjs` | NDPA & GDPR | Present | BreadcrumbList | Included |
| `/terms/` | `src/site/pages/resourcesAndForms.mjs` | Terms & Conditions | Present | BreadcrumbList | Included |
| `/confidentiality-statement/` | `src/site/pages/resourcesAndForms.mjs` | Anonymity Statement | Present | BreadcrumbList | Included |
| `/cookie-policy/` | `src/site/pages/resourcesAndForms.mjs` | Cookie consent | Present | BreadcrumbList | Included |
| `/404.html` & `/offline/` | `src/site/pages/resourcesAndForms.mjs` | Error fallbacks | Present | noindex, nofollow | Excluded (correct) |

All 31 routes are accounted for, canonicals resolve correctly, and robot directives prevent crawling of private and admin endpoints.

---

### 2.7 Booking, Reviews, CMS, Admin, and Forms Audit

| Subsystem | Requirement | Current Implementation Status | Gap / Evidence |
| :--- | :--- | :--- | :--- |
| **Booking** | 4-step client calendar wizard | **Done & Functional** | Step 1 (type), Step 2 (calendar/slots), Step 3 (details), Step 4 (confirm) in `public/assets/js/booking.js`. |
| **Booking** | Server-side slot generation & timezone | **Done & Functional** | `lib/availability.ts` generates slots in UTC and displays WAT + visitor timezone. |
| **Booking** | Double-booking prevention | **Partial** | Exclusion constraint defined in `001_schema.sql` and SQLite transaction in `server.ts`, but Supabase Edge function is not wired to frontend. |
| **Booking** | .ics generation & confirmation | **Partial** | `lib/ics.ts` formats valid iCalendar text; currently mocked into SQLite rather than emailed via Resend. |
| **Booking** | Reschedule & cancel via signed token | **Done & Functional** | `public/assets/js/booking-manage.js` supports tokenized access; enforces cancel cutoff window. |
| **Reviews** | Public & tokenized review forms | **Done & Functional** | Both `/resources/stories-and-reviews/#write-a-review` and `/review/submit/?token=` implemented. |
| **Reviews** | Moderation & Anonymity | **Done & Functional** | Submissions set to `pending`; initials formatting enforced; URLs blocked in review body. |
| **Reviews** | Single-use verified token | **Done & Functional** | Verified submissions mark token as redeemed in `server.ts:241`. |
| **Blog CMS** | Prerender on publish | **Done & Functional** | `buildStaticSite()` in `build.mjs` prerenders articles, TOC, reading time, RSS feed, and sitemap. |
| **Blog CMS** | Markdown rendering & sanitization | **Done & Functional** | `marked` + `DOMPurify` (with `rel="noopener noreferrer"` hook) used consistently. |
| **Admin** | Role-based module access | **Done & Functional** | Owner (all), Editor (content/reviews), Coordinator (leads/bookings) enforced in `admin.js` and `server.ts`. |
| **Admin** | 2FA TOTP enforcement | **FAIL (Insecure)** | `server.ts:757` returns `currentCodePreview` in login JSON; needs migration to Supabase Auth MFA. |
| **Forms** | Spam protection & Honeypot | **Partial** | Honeypot field (`website_url`) present on all forms; Cloudflare Turnstile widget rendered but server verification missing. |
| **Forms** | Minimum data capture | **Done & Functional** | Application forms capture preliminary details only; no medical records or IDs accepted on public forms. |

---

### 2.8 Imagery & Visual Assets Audit
- **Final Responsive Imagery:**
  - 8 photographic scenes in 4 responsive widths (640w, 1024w, 1920w, 3840w) in both modern AVIF and WebP formats:
    - Hero Family: `/assets/img/hero-family-*`
    - Surrogacy: `/assets/img/service-surrogacy-*`
    - Ovum Donation: `/assets/img/service-ovum-donation-*`
    - Personalized Matching: `/assets/img/service-matching-*`
    - Counseling and IVF Support: `/assets/img/service-counseling-*`
    - Surrogate Band: `/assets/img/become-a-surrogate-*`
    - Process / How It Works Banner: `/assets/img/how-it-works-*`
    - Blog Default Cover: `/assets/img/blog-default-*`
  - Open Graph Image (1200x630): `/assets/img/og-default.jpg`
  - SVG & PNG Favicon suite: `favicon.svg`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.
- **Founder Portrait Compliance Gate:**
  - `src/site/pages/aboutAndServices.mjs:74-84` checks `settings.founder_photo_url`.
  - When unset, renders a neutral framed placeholder stating: *"Founder portrait pending client upload in Site Settings."*
  - **No synthetic or AI face was generated for Chizaram Ata**, in strict compliance with the master prompt.
- **Client Assets Needed:**
  - Official high-resolution logo mark (placeholder SVG currently used: overlapping charcoal and teal circles).
  - High-resolution authentic photograph of founder Chizaram Ata.

---

## 3. Security Findings & Immediate Action Required (Step 1)

1. **Plaintext Staff Credentials in Public Repository:**
   - `README.md` lines 28–30 display staff logins: `owner@zizodonorandsurrogacy.com`, `coordinator@...`, `editor@...` alongside passwords.
   - `lib/database.ts` lines 330–355 hashes these same passwords into the initial seed.
   - **Remediation:** Remove all credentials from `README.md` and `lib/database.ts`. Move account creation to an isolated seed script reading from environment variables. Advise repository owner to treat these passwords as compromised.
2. **TOTP 2FA Setup Code Exposure:**
   - `server.ts:757` outputs `currentCodePreview: generateTotpCode(secret)`.
   - **Remediation:** Strip `currentCodePreview`. Switch authentication to Supabase Auth with TOTP MFA.
3. **Database WAL File Committed:**
   - `data/zizo.db-wal` was tracked and committed in `7cb0801`.
   - **Remediation:** Remove `data/zizo.db-wal` from git tracking, add `data/` and `*.db*` to `.gitignore`.
4. **Git Repository Privacy:**
   - The repository `https://github.com/jidemure/zizo` is public. Because credentials were committed to git history, the repository must be set to **Private** immediately.

---

## 4. Proposed Execution Plan (Steps 1 to 4)

- **Step 1 (Security First):**
  - Scrub all credentials from `README.md` and codebase.
  - Update `.gitignore` to exclude `data/`, `*.db`, `*.db-*`, and any local secrets. Untrack `data/zizo.db-wal`.
  - Fix TOTP preview leak in `server.ts`.
  - Document repository privatization in `README.md`.
- **Step 2 (Complete Backend on Supabase):**
  - Finalize Supabase migrations (`001_schema.sql`, `002_rls.sql`, `003_seed.sql`) with real auth linkage.
  - Expand Edge Functions: complete `create-booking` (with Turnstile + Resend), add `submit-form` (inquiries/applications), `submit-review`, and `newsletter`.
  - Create integration tests verifying RLS policies and double-booking conflict prevention.
- **Step 3 (Fill Gaps from Audit):**
  - Clean up package.json stack drift: remove unused React, motion, @google/genai leftovers and root React files.
  - Implement Turnstile server-side verification and Resend API dispatch.
  - Verify all forms, admin moderation workflows, and prerender webhooks.
- **Step 4 (Quality & Acceptance Gates):**
  - Run test suite and static build.
  - Audit WCAG 2.2 AA accessibility and mobile performance.
  - Update README and produce `STATUS.md` with client placeholders.
