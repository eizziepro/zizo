# Zizo Surrogacy — Corrected Design Specification

**Position in document sequence:** 5 of 7. This document takes the audience routes from `userflow.md`, the page map from `seo.md`, the data/privacy constraints from `trd.md` and the user’s supplied design file as a visual reference. It replaces the Nexus Digital Studio identity with Zizo Surrogacy and applies the authoritative Charcoal Black, Warm White and Deep Teal brand system supplied by the user.

## Brand and design intent

Design a calm, confident and discreet experience for intended parents and prospective surrogate applicants in Lagos, Nigeria. The website should feel human and supportive without looking like a clinic, a generic SaaS template or a luxury fashion landing page. Use the strong hierarchy, editorial pacing, bento-style composition, repeated proof modules and restrained motion described in the design reference, but do not reuse its digital-agency positioning or service list.

No source HTML or screenshot was provided. The reference’s exact grid, focal object and motion therefore cannot be matched pixel-for-pixel. Follow the typography, spacing, radius and composition notes below, and treat a later HTML/screenshot as a visual sign-off reference if one becomes available.

## Brand Colour System

The three core HEX values below are the authoritative brand colours. Their tints and shades support the core system; they must not compete with these three values or change the overall visual identity.

### Core Brand Colours

| Colour | HEX | Role |
|---|---|---|
| Charcoal Black | `#17191A` | Primary: headings, navigation, footer backgrounds and primary text |
| Warm White | `#FAF9F6` | Secondary: main page background, spacious sections and content surfaces |
| Deep Teal | `#17645F` | Accent: primary CTAs, links, interactive states and selected highlights |

### 1. Charcoal Black Scale

**Tints:** `#2E3031`, `#454748`, `#5D5E5F`, `#747576`, `#8B8C8C`  
**Shades:** `#151617`, `#121415`, `#101212`, `#0E0F10`, `#0C0C0D`

### 2. Warm White Scale

**Tints:** `#FAFAF7`, `#FBFAF8`, `#FCFBF9`, `#FCFBFA`, `#FCFCFA`  
**Shades:** `#E1E0DD`, `#C8C7C5`, `#AFAEAC`, `#969594`, `#7D7C7B`

### 3. Deep Teal Scale

**Tints:** `#2E746F`, `#45837F`, `#5D928F`, `#74A29F`, `#8BB2AF`  
**Shades:** `#155A56`, `#12504C`, `#104642`, `#0E3C39`, `#0C3230`

### Namespaced CSS tokens

The original scale labels repeat across colour families, so implementation tokens must include the family name. Preserve the HEX values exactly.

```css
:root {
  /* Core brand colours */
  --charcoal-black: #17191A;
  --warm-white: #FAF9F6;
  --deep-teal: #17645F;

  /* Charcoal Black tints */
  --charcoal-black-tint-50: #2E3031;
  --charcoal-black-tint-100: #454748;
  --charcoal-black-tint-150: #5D5E5F;
  --charcoal-black-tint-200: #747576;
  --charcoal-black-tint-250: #8B8C8C;

  /* Charcoal Black shades */
  --charcoal-black-shade-50: #151617;
  --charcoal-black-shade-100: #121415;
  --charcoal-black-shade-150: #101212;
  --charcoal-black-shade-200: #0E0F10;
  --charcoal-black-shade-250: #0C0C0D;

  /* Warm White tints */
  --warm-white-tint-50: #FAFAF7;
  --warm-white-tint-100: #FBFAF8;
  --warm-white-tint-150: #FCFBF9;
  --warm-white-tint-200: #FCFBFA;
  --warm-white-tint-250: #FCFCFA;

  /* Warm White shades */
  --warm-white-shade-50: #E1E0DD;
  --warm-white-shade-100: #C8C7C5;
  --warm-white-shade-150: #AFAEAC;
  --warm-white-shade-200: #969594;
  --warm-white-shade-250: #7D7C7B;

  /* Deep Teal tints */
  --deep-teal-tint-50: #2E746F;
  --deep-teal-tint-100: #45837F;
  --deep-teal-tint-150: #5D928F;
  --deep-teal-tint-200: #74A29F;
  --deep-teal-tint-250: #8BB2AF;

  /* Deep Teal shades */
  --deep-teal-shade-50: #155A56;
  --deep-teal-shade-100: #12504C;
  --deep-teal-shade-150: #104642;
  --deep-teal-shade-200: #0E3C39;
  --deep-teal-shade-250: #0C3230;

  /* Semantic roles */
  --color-primary: var(--charcoal-black);
  --color-secondary: var(--warm-white);
  --color-accent: var(--deep-teal);
  --surface-page: var(--warm-white);
  --surface-content: var(--warm-white-tint-50);
  --surface-muted: var(--warm-white-shade-50);
  --surface-inverse: var(--charcoal-black);
  --text-primary: var(--charcoal-black);
  --text-secondary: var(--charcoal-black-tint-50);
  --text-inverse: var(--warm-white);
  --border-default: var(--warm-white-shade-50);
  --link-default: var(--deep-teal);
  --action-primary: var(--deep-teal);
  --action-primary-hover: var(--deep-teal-shade-50);
  --action-text: var(--warm-white);
  --accent-soft: var(--deep-teal-tint-50);
}
```

### Colour application guidelines

Use Charcoal Black for headings, navigation, footer backgrounds and primary text. Use Warm White for the main page background, spacious sections and content surfaces. Use Deep Teal for primary calls to action, links, interactive states and selected highlights. Use lighter teal tints for subtle backgrounds, icon containers and secondary visual accents. Use darker teal shades for hover states and stronger emphasis. Use darker Warm White shades as neutral borders, dividers and muted surface backgrounds.

Tints and shades are supporting colours. Keep the overall identity anchored in the three core HEX values. Do not use the teal tints and shades as a competing palette or spread them across every component.

### Accessibility notes for colour use

The primary CTA colour `#17645F` against Warm White `#FAF9F6` has a computed contrast ratio of 6.59:1. The hover colour `#155A56` against Warm White has a computed ratio of 7.59:1. Both exceed WCAG 2.2 AA’s 4.5:1 minimum for normal text. Use Warm White text on these CTA backgrounds.

The teal tint `#45837F` against Warm White is 4.15:1, so do not use it for normal-size text on that background. Charcoal tint `#747576` against Warm White is 4.38:1; reserve it for non-text decoration or choose a darker text token. Recheck every rendered combination, including overlays, focus rings, disabled states and small labels. WCAG 2.2 AA requires at least 4.5:1 for normal text and 3:1 for large text. [1]

Do not use colour alone to communicate selected state, error, required fields or audience path. Pair colour with text, icons, shape or an accessible programmatic state.

## Typography, spacing and shape

Use Dela Gothic One as the primary brand/display typeface, especially for the hero headline, page titles and selected section headings. Its distinctive, heavy letterforms work best in short, high-impact phrases. Do not set long paragraphs, navigation, form labels or small helper text in Dela Gothic One; those areas should remain easy to scan and read. Pair it with Poppins for all body and interface copy, and reserve JetBrains Mono for occasional metadata or small technical labels.

```css
:root {
  --font-display: "Dela Gothic One", "Arial Black", sans-serif;
  --font-body: "Poppins", Arial, sans-serif;
  --font-label: "JetBrains Mono", monospace;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}

h1,
h2,
.display-text {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.08;
}

.eyebrow,
.metadata {
  font-family: var(--font-label);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}
```

- **Display:** Dela Gothic One, 64px reference desktop size, weight 400, line-height about 1.08. Scale responsively; reduce size and line length on narrow phones.
- **Body and interface:** Poppins, 16px, weight 400, line-height 1.6. Use Poppins for navigation, forms, buttons and longer headings when the display font would reduce readability.
- **Labels/metadata:** JetBrains Mono, 12px, weight 600, line-height 1.2. Use sparingly; do not use tiny mono text for essential instructions.
- **Loading:** Load Dela Gothic One and Poppins through the approved font-loading method, ideally self-hosted WOFF2 files where licensing and source files permit. Define sensible fallbacks and use `font-display: swap` so text remains visible while fonts load. Avoid loading unused weights or language subsets.
- **Spacing:** 8px base unit, 16px default gap, 24px card padding and 80px desktop section padding. Reduce padding by breakpoint rather than compressing content.
- **Radii:** 8px cards and controls; full-pill radius only for intentionally pill-shaped controls.

## Page composition

### Header

Keep the Zizo mark and short primary navigation easy to see. Use links to Home, For Intended Parents, Become a Surrogate, How It Works, Agency Insights, About and Contact. Use Charcoal Black for navigation on Warm White. Style **Book a Call** as the Deep Teal primary action and **WhatsApp** as a quieter alternative. On mobile, use an accessible menu and retain a compact booking access point without obscuring page content or keyboard focus.

### Hero

Use the reference’s strong first-screen hierarchy. A Charcoal Black field with a concise Warm White headline and a Deep Teal action can create contrast while making the next step clear. Use Warm White for meaningful text on Charcoal Black; teal has insufficient contrast on Charcoal Black for small text. State the service, Lagos market and audience without guarantees. Show both intended-parent and surrogate routes and a prominent Book a Call action. Keep important meaning in text, not embedded in an image or animation.

Sample positioning direction, subject to content-owner approval: **“Support for intended parents and surrogate applicants in Lagos.”** Do not use the word “safe,” outcome statistics or medical/legal claims without approved evidence.

### Audience entry and process

Provide two balanced, clearly labeled blocks: **For Intended Parents** and **Become a Surrogate**. Each block should explain who the page is for and link to its own information. Follow with a short process sequence that identifies Zizo’s role at each stage and makes clear where clinical/legal professionals are responsible.

### Services and trust

Describe only verified, active offerings. Use a bento or editorial arrangement with varied size and pace rather than repeating identical generic cards. Trust modules may include real team profiles, approved credentials, verified partner descriptions and testimonials with explicit publication consent. Avoid anonymous claims of success, stock “client” portraits or imagery that implies clinical care Zizo does not provide.

### Testimonials and Agency Insights

The testimonial module should be reusable and readable on mobile. Show attribution only to the extent each participant has consented; protect privacy where requested. Insights should have distinct article cards and individual reading pages with author, date and sources where appropriate.

### Booking and contact

Make the booking action direct. In the scheduler, show call type, duration, fee/free status, date/time, time zone and format before final confirmation. The WhatsApp action must identify the correct audience path. Provide a clear fallback if the booking tool cannot load or no slots are available.

### Footer

Use a Charcoal Black footer background with Warm White text and clear Deep Teal focus/interactive states that still pass contrast requirements. Include current contact channels, Lagos location wording, privacy information, core navigation and official social links. Publish a street address only if it is verified and appropriate to disclose. Do not show an unsupported service-area claim or contradictory WhatsApp numbers.

## Responsive behavior

At narrow widths, stack content in the order of user priority. Keep the heading and booking CTA in the first viewport without shrinking body text excessively. Collapse bento panels into a readable vertical sequence; do not preserve desktop card widths by causing sideways scrolling. Use mobile-friendly controls with at least WCAG’s 24-by-24 CSS-pixel minimum target where applicable, with comfortable spacing for common actions. [1]

Test at 360px, 390px, 430px, tablet widths and desktop. Inspect the long-form scroll for unusually large blank gaps, delayed images and sticky controls that hide headings or form elements.

## Motion and imagery

Use restrained entrance reveals and hover lift only when they improve orientation. Honour reduced-motion preferences. Avoid requiring parallax, canvas, WebGL or particles. Use authentic, consented photography where appropriate. Do not use a real client’s identity, medical image or personal story without explicit permission. Reserve image dimensions to prevent layout shifts.

## Design handoff checks

A design is ready for implementation when the key page layouts, mobile menu, booking states, WhatsApp path, loading/error/success states, palette roles, text contrast, interaction states, image rights and responsive behavior are documented. All copy must align with the approved service scope in the PRD and SEO plan.

## References

[1]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"
