# Zizo Surrogacy — Technical Requirements Document

**Position in document sequence:** 4 of 7. This TRD converts the user journeys, SEO page plan and schema rules into implementation requirements. It precedes the visual design build and implementation schedule.

## 1. Technical scope

Build a custom-coded, responsive public website for Zizo Surrogacy, initially serving intended parents and surrogate applicants in Lagos, Nigeria. The website must support the page structure in `seo.md`, the contact paths in `userflow.md`, and the structured-data rules in `schema.md`.

The recommended reference stack is Next.js with TypeScript and static/server-rendered public content, plus CSS custom properties for the design system. This is a proposal, not a user-selected stack; confirm it against the developer’s existing environment and hosting before implementation. Keep article content maintainable through Markdown/MDX for developer-managed publishing or a lightweight CMS if nontechnical staff need to publish without code changes. The editing model remains a decision.

## 2. Routes and rendering

Implement the canonical public routes agreed in `seo.md`: Home; `/intended-parents/`; `/become-a-surrogate/`; `/how-surrogacy-works/`; `/about/`; `/book-a-call/`; `/contact/`; `/insights/`; and `/insights/{slug}/`. Add `/egg-donation/` only if the service is confirmed for launch.

Render the main copy, headings, internal links, title metadata and canonical URL in crawlable HTML. Use static generation for stable marketing pages and articles where possible. Use client-side JavaScript only for interactions that require it, such as the booking calendar or menu. The site must remain understandable if animation or nonessential JavaScript fails.

## 3. Recommended implementation structure

```text
app/
  page.tsx
  intended-parents/page.tsx
  become-a-surrogate/page.tsx
  how-surrogacy-works/page.tsx
  about/page.tsx
  book-a-call/page.tsx
  contact/page.tsx
  insights/page.tsx
  insights/[slug]/page.tsx
components/
  SiteHeader.tsx
  MobileNavigation.tsx
  AudienceRoutes.tsx
  ServiceOverview.tsx
  ProcessSteps.tsx
  TrustContent.tsx
  TestimonialSection.tsx
  BookingEntry.tsx
  BookingFallback.tsx
  WhatsAppLink.tsx
  InsightCard.tsx
  Breadcrumbs.tsx
  SiteFooter.tsx
content/insights/
lib/
  booking-provider.ts
  analytics.ts
  structured-data.ts
styles/
  tokens.css
```

The exact filenames may change to suit the selected framework. Keep repeated navigation, testimonials, CTA patterns, breadcrumbs and structured-data generation reusable. Do not combine audience paths into one generic page with indistinguishable CTAs.

## 4. Booking and contact integration

The booking system/vendor is not yet selected. Implement a small provider adapter so availability, booking creation, confirmations and rescheduling are not tightly coupled to the page layout. The provider must support the user flow or provide a documented equivalent. Prefer an accessible booking page or embed that preserves a clear fallback if it cannot load.

Required initial booking values are name, phone, intended-parent or surrogate call type, date/time and contact consent. Show Africa/Lagos time and confirm the zone before the visitor books. The appointment duration, fee/free status, availability rules, meeting format, cancellation window, confirmation channel and reminder timing must come from Zizo before the scheduler is configured.

Optional standard fields may include email for a calendar invitation, alternate time zone, meeting format, optional non-sensitive notes, and reminder preference. Configure only fields required by the chosen provider or follow-up process. Do not collect diagnoses, fertility history, health records, test results or sensitive personal stories in a marketing-site booking form. Do not pass names, phone numbers, form values or WhatsApp message content to analytics. Do not log form payloads in server or error logs.

The WhatsApp links must use an approved current Zizo number, HTTPS `wa.me` URL and audience-specific prefilled greeting. Include a telephone/contact fallback for visitors without WhatsApp. Measure outbound clicks without reading chat content.

## 5. Content and publishing

The public content model must support:

- Page title, meta description, canonical URL, H1 and social-preview image.
- Audience-specific service explanation and next action.
- Verified author/reviewer details and source links for relevant Insights content.
- Article slug, headline, summary, body, author, publication date, update date and representative image.
- Testimonial quote, attribution and permission status; do not publish an item unless approval is recorded.

A human owner must review surrogacy-related process, health, legal, screening, cost and outcome claims before publication. The site must distinguish coordination/support from clinical care and legal advice, unless Zizo verifies a different role.

## 6. SEO and structured-data implementation

For every indexable route, render a unique title and description, canonical URL, Open Graph metadata and one primary H1. Generate `sitemap.xml` from the canonical public routes and published Insights. Keep `robots.txt` permissive for public content and necessary rendering resources; no private booking data should be crawlable.

Add a single `WebSite` site-name node to the homepage and a reusable Organization node with verified identity fields. Add `Service`, `BlogPosting` and `BreadcrumbList` only where the content qualifies under `schema.md`. Add `LocalBusiness` only after Zizo supplies a real eligible physical address. Do not add FAQ rich-result markup, fake review stars, unsupported MedicalBusiness details or hidden claims. All structured data must match visible page content. Google states that structured-data implementation does not guarantee display. [1] [2]

## 7. Analytics and privacy

Use the event model from `userflow.md`: booking CTA, booking-flow start, slot selected, booking confirmed, booking error, WhatsApp click and Insight read. Record page/CTA placement and non-identifying audience category only where useful. Avoid personally identifying or health-related values in event labels, page URLs, query strings, analytics payloads and error traces.

Before launch, Zizo must approve the privacy notice, data controller/contact details, consent wording, booking provider terms, data retention and access rules. The public site should not become a medical-record intake system. Any expanded intake requires a separate privacy and security review.

## 8. Accessibility, responsiveness and performance

Target WCAG 2.2 AA for page content and interactions. Normal text should meet at least 4.5:1 contrast, large text at least 3:1, and pointer targets should meet WCAG 2.2 AA target-size criteria or an applicable exception. [3]

Test phone widths from 360 CSS pixels upward, common tablet sizes and desktop layouts. Ensure keyboard navigation, visible focus, explicit form labels, actionable error messages, semantic headings, screen-reader status announcements, adequate touch spacing and reduced-motion support.

Use Google’s good Core Web Vitals values as release targets: LCP ≤2.5 seconds, INP <200 milliseconds and CLS <0.1 at the 75th percentile of real-user data. [4] Optimize the hero asset, reserve image dimensions, lazy-load below-the-fold media and avoid heavy effects on the critical path.

## 9. Security and reliability

- Enforce HTTPS and secure handling of the booking provider’s credentials.
- Validate and sanitize all user input on the server boundary where applicable.
- Add reasonable spam protection and rate limits without blocking keyboard or assistive-technology use.
- Keep secrets in environment configuration, not source code or client bundles.
- Show clear unavailable, timeout, validation and provider-failure states with a WhatsApp or telephone fallback.
- Preserve non-sensitive field values when a recoverable booking error occurs.
- Use least-privilege access for any admin/editor or booking integration.

## 10. Testing and release criteria

Automated tests should cover route rendering, title/canonical generation, navigation, booking interactions, form validation, WhatsApp link construction, structured-data serialization and sitemap generation. End-to-end tests should verify both audience booking paths, no-availability fallback, booking confirmation, article navigation and mobile menu operation.

Before release, manually test major browsers and mobile widths, keyboard-only navigation, screen-reader labels, reduced motion, analytics event payloads, structured data and booking-provider failure behavior. Check the deployed homepage and key pages in Google Search Console URL Inspection. Run Google’s Rich Results Test for supported structured data and the Schema.org validator for semantic types without Google rich-result support.

## References

[1]: https://developers.google.com/search/docs/appearance/ai-features "Google AI Features and Website Requirements"
[2]: https://developers.google.com/search/docs/appearance/structured-data/sd-policies "Google General Structured Data Guidelines"
[3]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"
[4]: https://developers.google.com/search/docs/appearance/core-web-vitals "Google Core Web Vitals"
