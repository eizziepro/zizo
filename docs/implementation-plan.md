# Zizo Surrogacy — Implementation Plan

**Position in document sequence:** 7 of 7. This is the final execution plan. It builds on the user journeys, SEO page architecture, schema rules, TRD, corrected design and design-build handoff. Complete each phase’s gate before depending on it in the next phase.

## Project principles

Build the agreed Lagos-focused Zizo Surrogacy website, not a Nexus Digital Studio site. Treat the original Nexus document only as a layout and interaction reference. Use `design.md` as the palette source of truth. Keep the initial booking flow low-friction and privacy-aware; do not request health history through the public booking system. Do not promise search rankings or AI citations.

## Phase 0 — Confirm launch decisions and content

**Inputs:** existing PRD and user decisions.  
**Owner:** Zizo product owner, with developer/content lead.

Confirm the canonical public organization name, which services are active, where Zizo can actually serve visitors, which WhatsApp numbers are current, who answers enquiries, and the reliable response-time promise. Confirm the booking provider, call type, duration, fee/free status, available slots, format, reminder channel and cancellation/rescheduling rules. Decide whether Insights will be edited as Markdown/MDX or through a CMS.

Collect and approve the logo, team descriptions, testimonials, photos, author/reviewer bios, process details and article copy. Record permission for each identifiable client story, quote or image. Review surrogacy, medical, legal, safety, affordability and outcomes claims with the appropriate qualified owner. Confirm whether Zizo has a real public-facing address before considering LocalBusiness schema.

**Gate:** do not finalize service claims, booking configuration, public contact details or local-business address markup until these facts are approved. If no street address is approved, continue with Organization markup only.

## Phase 1 — Lock user journeys and information architecture

**Inputs:** `userflow.md` and `seo.md`.

Approve the intended-parent and surrogate paths, the Book a Call and WhatsApp actions, no-slot fallback, article-to-service route and the required/optional booking fields. Finalize the routes: Home, Intended Parents, Become a Surrogate, How It Works, About, Book a Call, Contact, Insights listing and article pages. Add Egg Donation only if it is a confirmed launch service.

Write a brief for each route: audience, intent, primary question answered, primary action and required content. Map old live URLs to new canonical URLs before any URL changes so redirects can be planned.

**Gate:** every proposed page has an owner, approved purpose and next step; no page is included only to target an unserved city or duplicate another page.

## Phase 2 — Complete technical and search specifications

**Inputs:** `schema.md` and `trd.md`.

Approve the framework/hosting approach, booking integration, content-authoring method, analytics platform, consent and privacy handling. Confirm the canonical domain and organization/site name. Finalize page titles, metadata, sitemap routes and canonical behavior. Decide whether a public address is eligible and appropriate before implementing LocalBusiness.

Create the shared Organization and WebSite identity data, Article data model and BreadcrumbList rules. Do not add FAQPage for a Google FAQ rich result or ratings markup for Zizo’s own testimonials.

**Gate:** contact details, public claims, booking data fields, SEO routes and structured-data facts are internally consistent and reviewed.

## Phase 3 — Apply the approved design system

**Inputs:** `design.md` and `design-build.md`.

Create CSS custom properties for every supplied Black, White and Skin tint/shade, using the exact namespaced values. Create semantic color aliases and verify the specified action contrast. Build responsive type and spacing tokens based on the supplied Inter, JetBrains Mono, 8px spacing and 8px radius language.

Review desktop and mobile layouts for the hero, audience paths, process, service/trust modules, testimonials, Insights, booking and footer. Confirm labels, interaction states, reduced-motion behavior, image rights and menu/scheduler accessibility.

**Gate:** Zizo approves the visual direction, palette mapping and first-screen CTA hierarchy. No Nexus digital-agency copy or palette remains.

## Phase 4 — Build the site foundation

Set up the repository, development/staging environments, type checking, linting, automated tests, build pipeline and secure configuration. Implement the global header/footer, semantic page shell, design tokens, typography, responsive grid, link/button styles and reusable content components. Add route-level metadata support, canonical URLs and sitemap/robots generation.

**Gate:** core routes build reliably; global navigation, design tokens, responsive behavior and deploy preview are testable.

## Phase 5 — Build audience and content pages

Implement Home, Intended Parents, Become a Surrogate, How It Works, About and Contact from approved copy. Add contextual Book a Call and WhatsApp links. Build the testimonial module with consent/permission gating. Add the Insights listing and article template using the approved publishing method, and publish the approved launch articles. Keep images optimized and content available as text in rendered HTML.

**Gate:** every service statement and trust element has an owner approval; every CTA leads to the correct audience route.

## Phase 6 — Implement scheduling and WhatsApp

Integrate the approved booking provider through the adapter described in `trd.md`. Configure appointment types, Africa/Lagos time, call duration, fees if any, meeting method, availability, confirmations, reminders and rescheduling. Make required and optional fields explicit. Test unavailable-slot and provider-outage fallbacks.

Replace old `http://` WhatsApp links with validated HTTPS `wa.me` links. Use the approved number for each audience path and a short prefilled greeting with no personal or medical information. Add approved phone/contact fallbacks.

**Gate:** an intended parent and a surrogate applicant can each schedule a call and reach the correct WhatsApp contact in end-to-end tests.

## Phase 7 — Add technical SEO, schema and measurement

Generate unique page titles and descriptions, canonical tags, Open Graph metadata, sitemap and crawlable robots policy. Add WebSite/Organization markup and content-specific Service, BlogPosting and BreadcrumbList markup only when the page and data support them. Validate all structured data against visible content. Add LocalBusiness only if the address and eligibility conditions are met.

Verify Search Console and analytics access. Implement the safe event set from `userflow.md`, ensuring names, phone numbers, notes and message text never enter analytics or URLs. Submit the sitemap and inspect core routes after deployment.

**Gate:** no critical crawl/indexing blocks, broken canonicals, invalid sitemap entries, structured-data mismatches or personal data in analytics.

## Phase 8 — Quality assurance and release

Run functional, unit, integration and end-to-end tests. Test both audience routes, booking success and failure, no available slots, WhatsApp links, article navigation, mobile menu, consent and footer contacts. Test responsive widths, keyboard use, screen readers, 200% zoom, reduced motion, contrast, image failure and analytics payloads.

Check Core Web Vitals against Google’s good thresholds using field data when available. Confirm there are no unsupported claims, fake reviews, unapproved imagery, placeholder content or broken links. Compare the release against `design.md` and `design-build.md` rather than the missing HTML reference.

**Release gate:** product owner approves copy, contact details, booking operation, privacy language, visual QA and launch checklist.

## Phase 9 — Launch and improve

Deploy to the approved production host, test production booking and WhatsApp links, verify HTTPS, submit the sitemap and inspect the homepage and key routes in Search Console. Record the launch date and baseline impressions, clicks, CTR, queries, landing pages, device mix, booking starts/completions and WhatsApp clicks.

Review indexing and errors within the first weeks. After enough traffic has accumulated, identify pages with meaningful impressions but weak clicks, user journeys with booking abandonment, and content gaps from genuine questions. Update content and technical issues in controlled releases. Review AI citation signals in Bing Webmaster Tools if the preview is available to the account, but treat them as a secondary observational measure.

## Definition of done

The website is done when its audience paths match `userflow.md`, its indexable pages match `seo.md`, structured data follows `schema.md`, technical acceptance criteria in `trd.md` pass, visual tokens and states match `design.md` and `design-build.md`, booking and WhatsApp function for both audiences, and launch QA has no unresolved critical privacy, accessibility, SEO or conversion defects.
