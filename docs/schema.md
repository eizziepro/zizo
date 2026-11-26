# Zizo Surrogacy — Structured Data and Schema Plan

**Position in document sequence:** 3 of 7. This plan follows the audience pages and routes in `userflow.md` and `seo.md`. It defines the structured-data entities the custom implementation should add and the information that must be verified first.

## Principles

Use JSON-LD and ensure every marked-up fact is accurate, visible on the corresponding page and consistent with the organization’s public identity. Structured data may help Google understand a page or make it eligible for certain search appearances, but it does not guarantee a rich result or higher ranking. [4]

The live site currently uses both “ZIZO SURROGACY” and “Zizo Donor and Surrogacy” in visible branding. Before launch, choose one canonical public name and apply it consistently across the homepage, page titles, social profiles, booking confirmation and structured data. The examples below use “Zizo Surrogacy”; use an alternate name only if Zizo confirms it is genuinely used.

## 1. Homepage site-name entity

Add one `WebSite` node to the canonical homepage. Google uses this markup as its strongest site-name preference signal, alongside the homepage’s visible name and other signals. Use the canonical homepage URL and a concise brand name. [1]

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://zizosurrogacy.com/#website",
  "name": "Zizo Surrogacy",
  "url": "https://zizosurrogacy.com/"
}
```

Add `alternateName` only if Zizo approves it as a real, recognized alternative and it is consistent with public branding. Do not create separate WebSite nodes for the same domain or place this domain-level site-name node only on a subpage. [1]

## 2. Organization identity

Add one reusable Organization entity, preferably on the homepage or About page, and reference it by `@id` from articles and service pages. Google does not require specific Organization properties, but recommends useful identity details such as name, URL, logo and ways to contact the organization. [2]

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://zizosurrogacy.com/#organization",
  "name": "Zizo Surrogacy",
  "url": "https://zizosurrogacy.com/",
  "telephone": "+2349024944961",
  "logo": "https://zizosurrogacy.com/REPLACE-WITH-APPROVED-CRAWLABLE-LOGO-URL"
}
```

Before production, verify the canonical organization name, the current public phone number and the exact crawlable logo file URL. Add `sameAs` only for profiles controlled by Zizo and visible from the site. The current homepage links to separate general and surrogate WhatsApp contacts; if both are current and approved, add page-level `ContactPoint` entries with accurate labels rather than treating both numbers as interchangeable.

## 3. Service entities

A page may use a `Service` node to describe a service that is actually visible on that page. This is semantic markup; do not promise a Google service rich result. Keep the service name, description, service area and provider consistent with the published copy. Do not label Zizo as a clinic or healthcare provider unless that describes its real role.

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://zizosurrogacy.com/intended-parents/#service",
  "name": "REPLACE-WITH-VERIFIED-INTENDED-PARENT-SERVICE-NAME",
  "url": "https://zizosurrogacy.com/intended-parents/",
  "description": "REPLACE-WITH-A-SHORT-DESCRIPTION-VISIBLE-ON-THIS-PAGE",
  "provider": {
    "@id": "https://zizosurrogacy.com/#organization"
  },
  "areaServed": {
    "@type": "City",
    "name": "Lagos"
  }
}
```

Create a separate surrogate service node only if the surrogate page describes a distinct, active offering. Do not claim that Zizo itself provides clinical treatment, legal representation, screening or guaranteed outcomes unless that is accurate and visible.

## 4. LocalBusiness markup — conditional

Do **not** add Google LocalBusiness rich-result markup using only “Lagos, Nigeria” or an inferred address. Google lists `name` and a physical `PostalAddress` as required properties for LocalBusiness rich-result eligibility. A service area or a WhatsApp number is not a substitute for a real address. [3]

If Zizo has an eligible, real business location and elects to publish its address, confirm the exact address and the way customers can visit before adding this pattern:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://zizosurrogacy.com/#localbusiness",
  "name": "Zizo Surrogacy",
  "url": "https://zizosurrogacy.com/",
  "telephone": "+2349024944961",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "REPLACE-WITH-VERIFIED-PUBLIC-STREET-ADDRESS",
    "addressLocality": "Lagos",
    "addressRegion": "Lagos",
    "addressCountry": "NG"
  }
}
```

Keep this conditional node out of production until the address is complete, legitimate, appropriate to publish and consistent with the visible page and any Business Profile. Never fabricate a street address or use a clinic-specific type for an agency that is not a clinic.

## 5. Agency Insights articles

Each published article may use `BlogPosting` or `Article` structured data. Match the visible headline, author, image and publication dates. Use real authors, link to a genuine author bio when available, and include timezone information in ISO 8601 dates. Google recommends these article properties but does not require all of them. [5]

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://zizosurrogacy.com/insights/REPLACE-SLUG/#article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://zizosurrogacy.com/insights/REPLACE-SLUG/"
  },
  "headline": "REPLACE-WITH-VISIBLE-ARTICLE-HEADLINE",
  "image": [
    "https://zizosurrogacy.com/REPLACE-WITH-CRAWLABLE-ARTICLE-IMAGE"
  ],
  "datePublished": "2026-01-15T09:00:00+01:00",
  "dateModified": "2026-01-15T09:00:00+01:00",
  "author": {
    "@type": "Person",
    "name": "REPLACE-WITH-AUTHOR-NAME",
    "url": "https://zizosurrogacy.com/about/REPLACE-WITH-AUTHOR-BIO/"
  },
  "publisher": {
    "@id": "https://zizosurrogacy.com/#organization"
  }
}
```

The dates, article slug, image, author and bio URL above are examples/placeholders, not claims about a published article. Generate them from the article content, not as fixed global values.

## 6. BreadcrumbList

Use `BreadcrumbList` on hierarchical pages where visible breadcrumbs help navigation. The structured trail must match the user’s actual route and visible page content. Google requires at least two list items for its breadcrumb rich-result feature. [6]

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://zizosurrogacy.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "For Intended Parents"
    }
  ]
}
```

## Markup to avoid

- Do not add `FAQPage` markup to chase a Google FAQ rich result. Google removed that rich-result feature in May 2026. Keep FAQs as visible, useful page content instead. [7]
- Do not use `Review` or `AggregateRating` to turn Zizo’s own testimonials into star ratings. Only mark up reviews when the Google rules for the relevant content type genuinely apply; a testimonial carousel is not a substitute for independently eligible reviews. [3] [4]
- Do not create `MedicalBusiness`, physician or clinic entities unless Zizo is actually that kind of provider.
- Do not mark up claims, addresses, services, ratings, authors or images that are hidden, unverified or absent from the page.

## Implementation and validation

Keep Organization identity in a shared data source so it is not duplicated inconsistently. Render the `WebSite` name node on the homepage; add a page-appropriate `Service`, `BlogPosting` or `BreadcrumbList` node only on pages where the corresponding content is visible. Escape values and serialize JSON-LD through the framework rather than hand-concatenating user-entered text.

Validate JSON syntax in tests. Use Google’s Rich Results Test for Google-supported result types, then inspect deployed pages with Search Console URL Inspection to check the rendered page and crawl access. Use Schema.org’s validator for semantic types that do not have a Google rich-result report. A passing test indicates technical validity or eligibility, not guaranteed display. [3] [4] [5] [6]

## References

[1]: https://developers.google.com/search/docs/appearance/site-names "Google Site Names in Search"
[2]: https://developers.google.com/search/docs/appearance/structured-data/organization "Google Organization Structured Data"
[3]: https://developers.google.com/search/docs/appearance/structured-data/local-business "Google LocalBusiness Structured Data"
[4]: https://developers.google.com/search/docs/appearance/structured-data/sd-policies "Google General Structured Data Guidelines"
[5]: https://developers.google.com/search/docs/appearance/structured-data/article "Google Article Structured Data"
[6]: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb "Google Breadcrumb Structured Data"
[7]: https://developers.google.com/search/docs/appearance/structured-data/faqpage "Google FAQ Structured Data Documentation Changelog"
