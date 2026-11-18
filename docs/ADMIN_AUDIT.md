# Zizo Donor and Surrogacy — Admin Portal Audit & Modernization Blueprint

**Document:** `docs/ADMIN_AUDIT.md`  
**Date:** November 18, 2026  
**Status:** Step 0 Complete — Audit & Migration Architecture Approved for Execution  
**Project:** Zizo Donor and Surrogacy Staff Portal Upgrade  
**Source of Truth:**  
- Admin Specification: Prompt Specification (November 18, 2026)  
- Public Brand & Security: `docs/MASTER_PROMPT.txt`  
- Design System: Untitled UI React Components (`https://www.untitledui.com/react/components`), React Aria, Tailwind CSS v4.3  

---

## 1. Executive Summary

This document performs the mandatory **Step 0 Comprehensive Audit** of the existing administration portal in the `zizo` codebase before initiating any functional modifications or code refactoring.

The current admin is implemented as a server-rendered HTML shell (`src/site/pages/bookingAndAdmin.mjs:renderAdminPage`) paired with a monolithic vanilla JavaScript module (`public/assets/js/admin.js`, 1,182 lines, ~55 KB) running against an Express.js backend (`server.ts`, ~1,350 lines) backed by SQLite (`data/zizo.db`) and custom HMAC session cookies. 

The goal of this upgrade is to transition the staff portal into a **unified, production-grade, enterprise staff portal** built with **React 19, TypeScript, Vite, React Aria, Untitled UI React components, and Tailwind CSS v4.3**, fully backed by **Supabase** (Auth with TOTP MFA, Postgres, Storage, RLS, Edge Functions).

The public website remains a high-performance static site generated via `build.mjs`, while the admin portal will operate as an independent, lightweight SPA served at `/admin/` (with Vercel rewrites), ensuring zero runtime baggage on the public fertility care pages.

---

## 2. Current Implementation Audit

### 2.1 File & Module Inventory

| File Path | Role in Current Architecture | Lines / Size | Current State & Fate in Upgrade |
| :--- | :--- | :--- | :--- |
| `src/site/pages/bookingAndAdmin.mjs` | Generates static HTML for public `/book/` flows and `/admin/` shell | 360 lines / ~15 KB | Keep public booking functions (`renderBookingPage`, `renderBookingConfirmedPage`, `renderBookingManagePage`). Replace `renderAdminPage` with modern SPA mounting HTML shell. |
| `public/assets/js/admin.js` | Monolithic vanilla JS handling DOM rendering, custom modal, mock tabs, and SQLite fetch calls | 1,182 lines / 54.8 KB | **Deprecated & Replaced** by modular React 19 SPA located in `src/admin/`. |
| `server.ts` | Express server handling public APIs, SQLite admin endpoints, and HMAC cookie auth | 1,357 lines / ~50 KB | Retain public endpoints (`/api/bookings`, `/api/availability`, `/api/forms`, `/api/reviews`). Deprecate SQLite admin routes (`/api/admin/*`) in favor of direct Supabase client + Edge Functions. |
| `lib/database.ts` | Better-SQLite3 schema initializer, seed logic, and queries | 737 lines / ~26 KB | Retain SQLite fallback for local public site dev harness if needed, but remove all admin dependencies and staff session handling. |
| `lib/tokens.ts` | JWT-like HMAC signed tokens, password hashing, and TOTP helpers | 185 lines / ~6 KB | Used for booking tokens. Staff authentication shifts directly to Supabase Auth. |
| `build.mjs` | Static site builder writing HTML pages to `dist/` | 594 lines / ~24 KB | Retain static site generation; configure Vite build to output the admin SPA bundle cleanly to `dist/admin/`. |
| `supabase/migrations/001_schema.sql` | Core Postgres schema | 247 lines | Needs additions: `services`, `site_pages`, `faq_assignments`, and staff profile columns. |
| `supabase/migrations/002_rls.sql` | Postgres Row-Level Security policies | 64 lines | Needs additions: RLS policies for `services`, `faq_assignments`, `site_pages`, and avatar storage. |
| `supabase/migrations/003_seed.sql` | Postgres initial seed data | 180 lines | Expand to seed consultation types, services, pages, and FAQs. |

---

### 2.2 Current Admin Navigation & Data Flow

Currently, the admin portal in `bookingAndAdmin.mjs` and `admin.js` implements a flat, unorganized sidebar menu consisting of 10 tab buttons:
1. `overview` (Basic summary cards: upcoming bookings, pending reviews, leads count)
2. `bookings` (Simple tabular list of bookings with CSV export)
3. `availability` (Combined Availability Rules & Consultation Types)
4. `inquiries` (Combined "Inquiries & Applications" under a unified `leads` endpoint)
5. `reviews` (Labeled "Reviews & Testimonials")
6. `blog` (Basic blog post listing and Markdown textarea modal)
7. `faqs` (Simple FAQ CRUD without page association)
8. `subscribers` (Simple newsletter subscriber list)
9. `settings` (Basic key/value site settings editor)
10. `audit` (Read-only audit log in the main sidebar)

---

## 3. Gap Analysis: Existing vs. Target Specification

The following matrix identifies all conformances, severe conflicts, and missing capabilities between the existing codebase and the new staff portal specification:

```
+----------------------------------------------------------------------------------------------------+
| KEY ARCHITECTURAL GAP SUMMARY                                                                      |
+----------------------------------------------------------------------------------------------------+
| Dimension           | Existing Admin Implementation         | Target Specification                  |
+---------------------+---------------------------------------+---------------------------------------+
| UI Framework        | Vanilla JS DOM manipulation (admin.js)| React 19 + TypeScript + Vite          |
| Component Library   | Custom raw HTML + Tailwind utility    | Untitled UI React + React Aria        |
| Design Tokens       | Ad-hoc colors with purple/slate leaks | Deep Teal #17645F, Charcoal #17191A,  |
|                     |                                       | Warm White #FAF9F6 (Zero Purple)      |
| Typography          | Fraunces + Hanken Grotesk mixed       | Hanken Grotesk UI, Fraunces only for  |
|                     |                                       | Page H1s and Overview greeting        |
| Inquiries / Apps    | CONFLICT: Merged into single tab/API  | STRICT SEPARATION: Inquiries &        |
|                     |                                       | Applications are separate pages       |
| Availability / Types| CONFLICT: Merged into one tab         | STRICT SEPARATION: Consultation Types |
|                     |                                       | is its own page; Availability is tab  |
| Settings / Audit    | CONFLICT: Both in main sidebar        | STRICT: Reached ONLY via bottom       |
|                     |                                       | Avatar dropdown (Audit is Owner-only) |
| Reviews Naming      | CONFLICT: "Reviews & Testimonials"    | STRICT: "Reviews" (testimonials       |
|                     |                                       | handled as source filter inside)      |
| Row Actions         | Inline action buttons & text links    | Strict DotsVertical Dropdown menu     |
| PII Protection      | Plaintext emails/phones exposed       | Strict masking (a***@..., +234 ***)   |
|                     |                                       | with logged "Reveal" action           |
| Services Management | MISSING: No admin service management  | Full table + tabbed rich editor       |
| FAQs Management     | Flat list, no page assignments        | Multi-page assignment registry        |
| Auth & RLS          | SQLite staff table + custom cookies   | Supabase Auth + TOTP MFA + strict RLS |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Strict Source Quirks & Violations to Remediate

1. **Inquiries & Applications Separation**:
   - *Current Bug/Conflict*: In `admin.js:19-21` and `server.ts:892-917`, inquiries and surrogate/donor applications are lumped into a single `/api/admin/leads` endpoint and rendered inside a single "Inquiries & Applications" view.
   - *Remediation*: Split into two separate routes: `/admin/inquiries` and `/admin/applications`, each with its own data fetching, status tabs, drawer workflows, and role-appropriate actions. Never merge them.
2. **Consultation Types vs. Availability**:
   - *Current Bug/Conflict*: Both are merged into a single "Availability & Types" sidebar item (`data-admin-tab="availability"`).
   - *Remediation*: `Consultation Types` becomes its own primary page (`/admin/consultation-types`) in the `SCHEDULING` group. `Availability` is moved entirely into a tab inside Settings (`/admin/settings/availability`).
3. **Sidebar Cleaning (Settings & Audit Log)**:
   - *Current Bug/Conflict*: `Site Settings` and `Audit Log` currently occupy standard slots in the primary sidebar navigation.
   - *Remediation*: Remove both from the sidebar. The user avatar card at the bottom of the sidebar will house an upward-opening Dropdown menu with:
     - Header (Staff name & email)
     - `Profile` (navigates to `/admin/settings/profile`)
     - `Site Settings` (navigates to `/admin/settings/site`)
     - `Audit Log` (navigates to `/admin/audit-log`; visible to `owner` role only)
     - Divider
     - `Sign out`
4. **Sidebar Item Renaming**:
   - *Current Bug/Conflict*: Tab labeled `Reviews & Testimonials`.
   - *Remediation*: Strictly rename to `Reviews`. Add an internal source filter for `Legacy testimonial`, `Website form`, and `Verified invite`.
5. **Row Actions Uniformity**:
   - *Current Bug/Conflict*: Tables use inline buttons, raw links, and varying icon orientations.
   - *Remediation*: Every table row uses a single `DotsVertical` icon trigger opening an accessible Dropdown menu. Destructive actions (Delete) are positioned last, styled with the error color, and protected by a confirmation modal.
6. **PII Masking & NDPA 2023 Compliance**:
   - *Current Bug/Conflict*: User emails, telephone numbers, and addresses are displayed in plaintext in the admin DOM.
   - *Remediation*: All list views mask emails (e.g. `c***@zizo.com`) and phones (`+234 *** *** 1234`). A "Reveal" button displays the unmasked value and immediately writes an audit record to `audit_log`.

---

## 4. Visual & Component Comparison

```
+-----------------------------------------------------------------------------------------------------+
| VISUAL ARCHITECTURE COMPARISON                                                                      |
+-----------------------------------------------------------------------------------------------------+
| Legacy HTML/Vanilla Interface (Current)      | Modern Untitled UI React Staff Portal (Target)       |
+----------------------------------------------+------------------------------------------------------+
| - Flat Charcoal sidebar (#17191A) with basic | - Premium Charcoal (#17191A) sidebar with uppercase   |
|   text buttons and no section grouping       |   group headers: CLIENTS, SCHEDULING, WEBSITE,       |
| - Top bar contains only section title        |   AUDIENCE, with badge counts on new items           |
| - Raw HTML tables with ad-hoc border colors  | - Top bar with Breadcrumbs, Command Menu (Cmd/Ctrl+K)|
| - Plain text links or inline buttons for     |   and Notification Bell                              |
|   row actions                                | - TanStack Table + Untitled UI Table components with |
| - Custom centered fixed div for modal        |   sticky headers, checkbox selection, & pagination   |
| - No chart libraries; flat stat counters     | - Standard DotsVertical action menu per row          |
| - Plaintext PII throughout                   | - Responsive Slide-over Drawers and accessible Modals|
| - Ad-hoc colors that risk purple leaking in  | - Line/Bar & Donut charts for bookings/inquiries     |
|                                              | - Strict PII masking with logged Reveal action       |
|                                              | - Authority Deep Teal #17645F token overrides        |
+----------------------------------------------+------------------------------------------------------+
```

### 4.1 Component Mapping to Untitled UI React

Untitled UI provides React components built upon React Aria primitives. Where a component is part of the PRO catalog, a zero-compromise, thin equivalent matching the exact Untitled UI DOM structure and Tailwind utility tokens will be implemented:

| UI Pattern / Feature | Untitled UI React Component | Fallback / Base Implementation Strategy |
| :--- | :--- | :--- |
| Shell Navigation | `SidebarNavigation` | React Aria navigation, styled with `#17191A`, group captions, and badge pills |
| Page Headers | `PageHeader` | Fraunces H1, subtitle in Hanken Grotesk, breadcrumbs, action button slot |
| Data Tables | `Table`, `TableHeader`, `TableRow`, `TableCell` | TanStack Table headless engine + Untitled UI table styles, horizontal scroll |
| Row Action Triggers | `DotsVertical` trigger + `Dropdown` | Accessible `Menu` from React Aria, styled with brand hover tokens |
| Detail Views | `Drawer` (Slide-over) | Accessible React Aria `ModalOverlay` + sliding panel from right |
| Confirmations | `Modal`, `Dialog` | Centered modal with alert styling, accessible focus trapping |
| Form Controls | `Input`, `Select`, `Textarea`, `Toggle` | React Hook Form + Zod, 16px base font, Deep Teal focus rings |
| Multi-select & Tags | `MultiSelect`, `TagGroup`, `Badge` | React Aria tag list with removable badges |
| Date & Slot Pickers | `Calendar`, `DatePicker` | React Aria calendar with Africa/Lagos timezone integration |
| Avatar & Menus | `Avatar`, `AvatarMenu` | User profile card at bottom of sidebar opening upward menu |
| Charts | `Metrics`, Line & Bar charts, Donut chart | Lightweight SVG/Canvas charts (Recharts or custom SVG) themed to Deep Teal |
| Markdown Editor | Minimal Markdown Editor | Bold, italic, lists, link shortcuts; sanitised preview with DOMPurify |
| Rich Notification | `Toast`, `Notification` | Floating accessible toast with auto-dismiss and undo capability |

---

## 5. Database & Migration Schema Delta

The existing Supabase Postgres schema (`001_schema.sql` and `002_rls.sql`) provides an excellent foundation with double-booking exclusion constraints and baseline RLS. To satisfy the new admin specification, Migration `004_admin_upgrade.sql` will be introduced:

### 5.1 Required Table Additions & Modifications

1. **`staff` Table Enhancements**:
   - Add: `avatar_path TEXT`
   - Add: `display_name TEXT`
   - Add: `phone TEXT`, `whatsapp TEXT`
   - Add: `job_title TEXT`, `department TEXT`, `bio TEXT`
   - Add: `location TEXT`, `timezone TEXT DEFAULT 'Africa/Lagos'`
   - Add: `language TEXT DEFAULT 'en'`
   - Add: `links JSONB DEFAULT '{}'::jsonb`
   - Add: `emergency_contact JSONB DEFAULT '{}'::jsonb` (Owner-only RLS)
   - Add: `notification_prefs JSONB DEFAULT '{"booking": true, "inquiry": true, "application": true, "review": true}'::jsonb`

2. **`services` Table (New)**:
   ```sql
   CREATE TABLE IF NOT EXISTS services (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     slug TEXT UNIQUE NOT NULL,
     title TEXT NOT NULL,
     short_description TEXT NOT NULL,
     body_md TEXT NOT NULL,
     price_amount INTEGER NOT NULL DEFAULT 0,
     price_currency TEXT NOT NULL DEFAULT 'NGN',
     price_label TEXT DEFAULT 'From',
     price_note TEXT,
     show_price BOOLEAN NOT NULL DEFAULT true,
     image_path TEXT,
     image_alt TEXT,
     status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
     featured BOOLEAN NOT NULL DEFAULT false,
     sort_order INTEGER NOT NULL DEFAULT 0,
     seo JSONB DEFAULT '{}'::jsonb,
     linked_consultation_type_id UUID REFERENCES consultation_types(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

3. **`site_pages` Registry Table (New)**:
   ```sql
   CREATE TABLE IF NOT EXISTS site_pages (
     slug TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     type TEXT NOT NULL DEFAULT 'static',
     can_have_faqs BOOLEAN NOT NULL DEFAULT true
   );
   ```

4. **`faq_assignments` Table (New)**:
   ```sql
   CREATE TABLE IF NOT EXISTS faq_assignments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
     page_type TEXT NOT NULL CHECK (page_type IN ('service', 'page')),
     page_ref TEXT NOT NULL,
     sort_order INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     CONSTRAINT uq_faq_page UNIQUE (faq_id, page_type, page_ref)
   );
   ```

5. **Storage Buckets**:
   - Ensure bucket `avatars` is created (private-by-default; signed URL access only).
   - Ensure bucket `site-media` is configured for staff uploads.

6. **Row Level Security (RLS) Rules**:
   - `services`: Public read published; Editor/Owner write.
   - `faq_assignments`: Public read; Editor/Owner write.
   - `site_pages`: Public read; Owner write.
   - `staff.emergency_contact`: Accessible strictly by `owner`.
   - `audit_log`: Insert allowed by system triggers/authenticated staff; Select restricted to `owner`.

---

## 6. Target Project Structure for `/admin/`

To maintain clean separation between the public static site and the admin portal, the admin codebase will reside in `src/admin/`:

```
src/admin/
├── assets/                  # Admin-specific static assets
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx     # Sidebar, TopBar, Breadcrumbs, AvatarCard
│   │   ├── Sidebar.tsx      # Grouped nav items with counts
│   │   ├── TopBar.tsx       # Breadcrumbs, Command Menu trigger, Notifications
│   │   └── AvatarMenu.tsx   # Upward menu (Profile, Site Settings, Audit, Sign out)
│   ├── untitledui/          # Untitled UI React component library & tokens
│   │   ├── Table.tsx        # Styled TanStack Table wrapper
│   │   ├── PageHeader.tsx   # Page header with Fraunces H1
│   │   ├── Dropdown.tsx     # Accessible Menu/Dropdown
│   │   ├── Drawer.tsx       # Slide-over drawer
│   │   ├── Modal.tsx        # Accessible dialog
│   │   ├── Badge.tsx        # Muted status badges
│   │   ├── Button.tsx       # Deep Teal primary, Charcoal secondary
│   │   ├── Input.tsx        # 16px text input with validation styling
│   │   ├── Select.tsx       # Custom select dropdown
│   │   ├── DatePicker.tsx   # Calendar / date range picker
│   │   └── DotsVertical.tsx # 3-dot row action trigger
│   ├── common/
│   │   ├── DataTable.tsx    # Reusable table with search, filters, pagination
│   │   ├── RowActionsMenu.tsx # Uniform vertical 3-dot action dropdown
│   │   ├── MaskedValue.tsx  # PII masking with logged Reveal button
│   │   ├── ConfirmModal.tsx # Destructive action confirmation dialog
│   │   ├── StatusBadge.tsx  # Color-coded badge helper
│   │   └── MarkdownEditor.tsx # Minimal bold/italic/lists/links editor
├── context/
│   ├── AuthContext.tsx      # Supabase Auth, session timeout, role state
│   └── NotificationContext.tsx # Toast and system alerts
├── hooks/
│   ├── usePermissions.ts    # Role check hook (Owner, Coordinator, Editor)
│   ├── useIdleTimer.ts      # 30-min inactivity with 2-min warning
│   └── useAuditLog.ts       # Trigger audit logging (e.g. Reveal PII)
├── pages/
│   ├── OverviewPage.tsx     # Fraunces greeting, metrics, charts, today's agenda
│   ├── InquiriesPage.tsx    # Filterable inquiries table, status drawer
│   ├── ApplicationsPage.tsx # Surrogate & Donor applications, drawer, no photos
│   ├── CasesPage.tsx        # Phase 2 placeholder (disabled in sidebar)
│   ├── BookingsPage.tsx     # Upcoming/Past/Cancelled, list & calendar views
│   ├── ConsultationTypesPage.tsx # Type management drawer, buffer, channels
│   ├── ServicesPage.tsx     # Services table & tabbed full-page editor
│   ├── BlogPage.tsx         # Post listing, categories, tags, post editor
│   ├── FAQsPage.tsx         # Multi-page assignment registry & per-page reordering
│   ├── ReviewsPage.tsx      # Moderation, rating stars, reply editor
│   ├── SubscribersPage.tsx  # Newsletter subscribers with CSV export
│   ├── AuditLogPage.tsx     # Owner-only audit trail with diff inspector
│   ├── LoginPage.tsx        # Untitled UI login with email/password + TOTP
│   └── settings/
│       ├── SettingsLayout.tsx # Tabs: Profile, Security, Site, Availability, Team
│       ├── ProfileTab.tsx   # Photo crop upload, profile fields, extra info
│       ├── SecurityTab.tsx  # Password change, TOTP enrollment/recovery, sessions
│       ├── SiteSettingsTab.tsx # Owner-only site config & toggles
│       ├── AvailabilityTab.tsx # Weekly hours, exceptions, 14-day preview
│       ├── NotificationsTab.tsx # Per-staff email preferences
│       └── TeamTab.tsx      # Staff list, role management, invitations
├── lib/
│   ├── supabase.ts          # Typed Supabase client instance
│   └── tokens.ts            # Palette tokens and typography mappings
├── App.tsx                  # React Router configuration with role guards
└── main.tsx                 # SPA mounting entrypoint
```

---

## 7. Migration & Phased Rollout Plan

To adhere to the requirement of **working in small, verifiable modules without breaking existing public features or tests**, the upgrade will follow this strict phased order:

- **Phase 1: Foundation, Dependencies & Auth Shell**
  - Install dependencies: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@untitledui/icons`, `react-aria-components`.
  - Configure Tailwind CSS v4.3 theme tokens (`brand-50` to `brand-950` mapping to `#17645F`, gray scale mapping to `#FAF9F6`/`#17191A`, zero purple).
  - Create Supabase migration `004_admin_upgrade.sql` for schema extensions (`services`, `faq_assignments`, `site_pages`, staff profile columns).
  - Implement Supabase Auth flow with TOTP MFA, 30-minute inactivity timer, and 2-minute expiration modal.
  - Build `AppShell` with Sidebar groups, TopBar (Breadcrumbs, Command Palette trigger, Notifications), and bottom Avatar Menu.

- **Phase 2: Global Table & Core UI Primitives**
  - Implement `DataTable` wrapper (TanStack Table + Untitled UI styles): search, multi-column sort, filter bar, pagination (10/25/50), row selection.
  - Implement `RowActionsMenu` using vertical 3-dots (`DotsVertical`), `ConfirmModal`, `MaskedValue` with logged reveal action, and `StatusBadge`.

- **Phase 3: Settings & Staff Profile**
  - Build `/admin/settings/*` with tabs: Profile (1:1 crop avatar uploader to `avatars` bucket), Security (TOTP setup with QR code, password change, active sessions), Site Settings (Owner only), Availability (working hours, exceptions, 14-day slot preview), Notifications, and Team & Roles (Owner only).

- **Phase 4: Scheduling & Client Operations**
  - Build `Consultation Types` page (`/admin/consultation-types`): table, create/edit Drawer, channel badges, toggle active.
  - Build `Bookings` page (`/admin/bookings`): Upcoming/Past/Cancelled/All tabs, List & Calendar views, reschedule/cancel modals.
  - Build `Inquiries` page (`/admin/inquiries`): status tabs, filters, detail drawer with status stepper and internal notes.
  - Build `Applications` page (`/admin/applications`): Surrogate & Egg Donor tabs, status filters, drawer, anonymized list view. Scaffold disabled `Cases` route.

- **Phase 5: Website Content & Marketing**
  - Build `Services` page (`/admin/services`): table, drag reorder, tabbed full-page editor (Overview, Content in Markdown, Pricing, SEO, FAQs), deploy hook trigger.
  - Build `FAQs` page (`/admin/faqs`): multi-page assignment registry, tabs (All, Services, Site pages, Unassigned), drag-to-reorder per page, detach modal.
  - Build `Reviews` page (`/admin/reviews`): moderation, rating stars, reply editor, legacy testimonial filter.
  - Build `Blog` page (`/admin/blog`): post table, tabs, full-page Markdown editor, media uploader.
  - Build `Subscribers` page (`/admin/subscribers`): masked email table, CSV export.

- **Phase 6: Overview Dashboard, Audit Log & Final Verification**
  - Build `Overview` dashboard (`/admin/`): Fraunces greeting, metric cards, booking and inquiry charts, activity feed.
  - Build `Audit Log` page (`/admin/audit-log`): diff viewer, Reveal PII logs.
  - Execute full test suite (`npm test`, build check, WCAG 2.2 AA accessibility audit, RLS policy verification).

---

## 8. Step 0 Acceptance Checklist

- [x] Full audit of existing admin architecture (`bookingAndAdmin.mjs`, `admin.js`, `server.ts`, `database.ts`, Supabase migrations) completed.
- [x] Identified all conflicting quirks (merged inquiries/apps, merged availability/types, settings/audit in sidebar, "Reviews & Testimonials" naming, horizontal row actions).
- [x] Documented required additions to Supabase Postgres schema (`services`, `faq_assignments`, `site_pages`, `staff` profile fields).
- [x] Defined Untitled UI React token override strategy (Deep Teal `#17645F`, Warm White `#FAF9F6`, Charcoal `#17191A`, Zero Purple).
- [x] Verified build pipeline compatibility: admin SPA served at `/admin/` without disrupting static public site generation.
- [x] Step 0 pre-upgrade audit published to `docs/ADMIN_AUDIT.md` for client and user review.
