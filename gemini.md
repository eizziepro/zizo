# Gemini Project Instructions — Zizo Surrogacy

Use this file as project-level context when planning or implementing the Zizo Surrogacy website. The website is for intended parents and prospective surrogate applicants in Lagos, Nigeria. The uploaded Nexus Digital Studio design file is only a visual/layout reference; do not carry its agency identity, service copy or old colors into the Zizo product.

## Read the project documents first

Before proposing architecture, changing files or writing code, read these documents in order:

1. `../prd.md` — product scope and decisions.
2. `userflow.md` — intended-parent, surrogate, booking and WhatsApp flows.
3. `seo.md` — page architecture, SEO, local search and AI visibility.
4. `schema.md` — structured-data entities, conditions and prohibited shortcuts.
5. `trd.md` — technical requirements, privacy, security, testing and proposed stack.
6. `design.md` — corrected visual system and exact palette.
7. `design-build.md` — component and interaction build specification.
8. `implementation-plan.md` — phases, dependencies and release gates.

These documents are a linked specification. Preserve their order and consistency. The user’s explicit decisions and this corrected Zizo scope take precedence over the Nexus source file’s digital-studio content. If two project documents conflict, identify the conflict and ask for clarification rather than inventing a new requirement.

## Product goals

Build a responsive, custom-coded website that helps the two priority audiences understand Zizo’s verified services and choose one of two primary actions: schedule a call or start a WhatsApp chat. Agency Insights is part of the launch scope. Use the approved pages and routes in `seo.md`; do not add thin location pages or unconfirmed services.

Do not represent Zizo as a fertility clinic, medical provider or law firm unless the organization confirms that is accurate. Do not promise pregnancy, a child, eligibility, medical outcomes, legal outcomes, safety, timelines, success rates or international coverage without substantiated and approved evidence. Distinguish Zizo’s own role from any work done by clinics, clinicians, lawyers or partners.

## Design and palette rules

`design.md` is the single source of truth for visual tokens. Use namespaced CSS custom properties for the user’s exact values; do not retain the former Nexus values such as `#191C21`, `#111827`, `#4B5563` or `#A1A1AA` as new design tokens.

```css
:root {
  --black-base: #000000;
  --black-tint-50: #333333;
  --black-tint-100: #575757;
  --black-tint-150: #7a7a7a;
  --black-tint-200: #9e9e9e;
  --black-tint-250: #c2c2c2;
  --black-shade-50: #0e0e0e;
  --black-shade-100: #0d0d0d;
  --black-shade-150: #0b0b0b;
  --black-shade-200: #0a0a0a;
  --black-shade-250: #090909;

  --white-base: #ffffff;
  --white-tint-50: #f9f9f9;
  --white-tint-100: #f9f9f9;
  --white-tint-150: #f9f9f9;
  --white-tint-200: #f9f9f9;
  --white-tint-250: #f9f9f9;
  --white-shade-50: #d2d2d2;
  --white-shade-100: #adadad;
  --white-shade-150: #888888;
  --white-shade-200: #636363;
  --white-shade-250: #3e3e3e;

  --skin-tint-50: #e8b498;
  --skin-tint-100: #ecbfa7;
  --skin-tint-150: #efcab5;
  --skin-tint-200: #f2d4c4;
  --skin-tint-250: #f5dfd2;
  --skin-shade-50: #dc8a5f;
  --skin-shade-100: #d26b33;
  --skin-shade-150: #ab5426;
  --skin-shade-200: #803f1c;
  --skin-shade-250: #552a13;
}
```

Use the semantic mappings in `design.md`. In particular, the primary CTA may use `#ab5426` with white text and the hover state `#803f1c` with white text. Do not use normal-size white text on `#d26b33` or `#dc8a5f`; use dark text on these brighter shades. Verify actual contrast for all text, focus, disabled and error states. Do not communicate meaning with color alone.

Keep the reference’s editorial hierarchy, deliberate section rhythm, bento-style composition and restrained motion where suitable. Do not flatten every section into identical cards. Respect `prefers-reduced-motion` and ensure content remains available without animation.

## Booking and WhatsApp

Implement the booking flow from `userflow.md` and `trd.md`. Required initial booking information is name, phone number, visitor/call type, selected date/time and contact consent. Display the Africa/Lagos time zone and any confirmed call duration, fee/free status and meeting format before confirmation. Optional standard scheduler fields may include email, time zone confirmation, meeting method, non-sensitive notes and reminder preferences. Do not add fields just because a booking vendor supports them.

Do not collect medical records, diagnoses, fertility history, test results or sensitive family stories through the public booking form. Do not put names, phone numbers, form values, notes or WhatsApp message contents into URLs, analytics, logs or error traces. If the booking integration fails or no suitable time is available, offer a clear WhatsApp or phone fallback.

Use only WhatsApp numbers approved by Zizo. Links must use HTTPS and a tested `wa.me` URL. Prefilled greetings may identify the audience or topic, but must not include personal or medical details. Track an outbound click only; never read or transmit the chat contents.

## SEO and structured data

Follow `seo.md` and `schema.md`. Render meaningful headings, copy, links and metadata in crawlable HTML. Generate canonical URLs and a sitemap from approved public routes and published Insights. Do not fabricate addresses, authors, credentials, partner relationships, reviews or ratings.

Use WebSite and Organization markup with verified identity information. Add Service, BlogPosting and BreadcrumbList markup only when the visible page supports it. Do not add FAQPage markup to pursue Google FAQ rich results. Do not add LocalBusiness markup until Zizo supplies an accurate eligible physical address and approves its use. Structured data does not guarantee a rich result or ranking.

Write clear, useful content for people. Do not add hidden AI text, keyword stuffing, auto-generated thin location pages or claims that AI-specific files/schema will guarantee AEO/GEO visibility.

## Technical working rules

- Inspect the existing repository and environment before changing code. Preserve working architecture and dependencies unless the TRD and project owner approve a change.
- The TRD’s Next.js/TypeScript stack is a recommendation, not a confirmed platform. If a stack already exists, adapt to it. If the repository is empty, surface material framework/hosting decisions before locking in a costly or difficult-to-reverse choice.
- Reuse components for navigation, audience routes, testimonials, booking entry, WhatsApp, breadcrumbs and content cards.
- Keep article content editable according to the approved publishing model; do not silently assume a CMS or external booking vendor.
- Use real, approved Zizo content and assets only. Do not invent testimonials, client photos, clinical imagery, performance numbers or case-study results.
- Keep secrets out of source code. Validate form input, use HTTPS, apply appropriate spam protection and keep booking data access limited.
- Target WCAG 2.2 AA and the Core Web Vitals goals in `trd.md`.
- Do not deploy, purchase, publish, send messages, or connect external accounts unless the user explicitly authorizes that action.

## Implementation workflow

Follow the phase gates in `implementation-plan.md`. Start by checking confirmed content, phone numbers, service scope, booking provider/settings, article publishing method and privacy wording. Then implement the route shell and design tokens, audience pages, booking/WhatsApp flows, Insights, metadata/schema, analytics and QA in the documented order.

After each coherent change, run the relevant tests and report what changed, what passed, and any blocker. Before considering work complete, run a production build, route/link checks, mobile/responsive checks, keyboard and reduced-motion checks, booking and WhatsApp end-to-end checks, sitemap/canonical validation, structured-data validation and privacy-safe analytics checks.

## Unresolved decisions — do not guess

The project documents identify these decisions as pending:

- Booking vendor or custom calendar implementation.
- Call duration, free/paid status, actual availability, format, reminders and cancellation rules.
- Which current public WhatsApp number serves each audience and who monitors it.
- Approved canonical organization name and whether “Zizo Donor and Surrogacy” is an alternate brand name.
- Whether a complete physical address is eligible and appropriate to publish.
- Which exact services are active for launch, including whether egg donation has a separate page.
- Whether Insights are edited as Markdown/MDX or in a CMS.
- Hosting/framework choice if no existing codebase decides it.
- Approved privacy notice, retention rules and consent wording.

If a task depends on one of these, use a clearly labeled placeholder in development or ask the project owner. Never silently substitute made-up business data.
