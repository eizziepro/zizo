export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function pictureTag({
  base,
  alt,
  width = 1920,
  height = 1080,
  className = 'w-full h-full object-cover',
  eager = false,
  sizes = '(max-width: 768px) 100vw, 1200px',
}) {
  const widths = [640, 1024, 1920, 3840];
  const avifSrcset = widths.map((w) => `/assets/img/${base}-${w}w.avif ${w}w`).join(', ');
  const webpSrcset = widths.map((w) => `/assets/img/${base}-${w}w.webp ${w}w`).join(', ');
  const fallbackSrc = `/assets/img/${base}-1920w.webp`;

  const loadingAttr = eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"';

  return `<picture>
    <source type="image/avif" srcset="${avifSrcset}" sizes="${escapeHtml(sizes)}" />
    <source type="image/webp" srcset="${webpSrcset}" sizes="${escapeHtml(sizes)}" />
    <img src="${fallbackSrc}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" class="${escapeHtml(className)}" ${loadingAttr} />
  </picture>`;
}

export function zizoLogoSvg() {
  return `<svg viewBox="0 0 36 36" class="w-9 h-9 shrink-0" aria-hidden="true">
    <circle cx="14" cy="18" r="9" stroke="currentColor" stroke-width="2" fill="none"></circle>
    <circle cx="22" cy="18" r="9" stroke="#17645F" stroke-width="2" fill="none"></circle>
  </svg>`;
}

export function whatsappSvg(cls = 'w-5 h-5') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="${escapeHtml(cls)}" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>`;
}

export function renderHead({
  title,
  description,
  canonicalPath = '/',
  ogImage = '/assets/img/og-default.jpg',
  noindex = false,
  preloadHero = false,
  jsonLd = [],
  extraHead = '',
  siteUrl = '',
}) {
  const fullCanonical = siteUrl ? `${siteUrl}${canonicalPath}` : canonicalPath;
  const fullOgImage = siteUrl && ogImage.startsWith('/') ? `${siteUrl}${ogImage}` : ogImage;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  const ldScripts = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    .filter(Boolean)
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join('\n  ');

  const preloadTag = preloadHero
    ? `<link rel="preload" as="image" href="/assets/img/hero-family-1920w.webp" imagesrcset="/assets/img/hero-family-640w.webp 640w, /assets/img/hero-family-1024w.webp 1024w, /assets/img/hero-family-1920w.webp 1920w" imagesizes="100vw" fetchpriority="high" />`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robotsContent}" />
  <link rel="canonical" href="${escapeHtml(fullCanonical)}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Zizo Donor and Surrogacy" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(fullCanonical)}" />
  <meta property="og:image" content="${escapeHtml(fullOgImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(fullOgImage)}" />

  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#17645F" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600&display=swap" />
  ${preloadTag}
  <link rel="stylesheet" href="/assets/css/styles.css" />
  ${extraHead}
  ${ldScripts}
</head>
<body class="bg-[#FAF9F6] text-[#2E3031] selection:bg-[#17645F] selection:text-white antialiased">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:bg-[#FAF9F6] focus:text-[#17191A] focus:px-4 focus:py-2 focus:border focus:border-[#17645F] focus:rounded">
    Skip to main content
  </a>`;
}

export function renderHeader({ isHome = false }) {
  const initialClass = isHome ? 'header-transparent' : 'header-scrolled';
  return `<header id="site-header" data-home="${isHome ? 'true' : 'false'}" class="site-header ${initialClass} fixed top-0 left-0 right-0 z-50">
  <div class="zizo-container">
    <div class="flex items-center justify-between gap-8 h-20">
      <a href="/" class="flex items-center gap-3 whitespace-nowrap shrink-0 group" aria-label="Zizo Donor and Surrogacy Home">
        ${zizoLogoSvg()}
        <span class="flex flex-col leading-none">
          <span class="font-display text-xl font-semibold tracking-tight">Zizo</span>
          <span class="text-[0.65rem] font-medium uppercase tracking-[0.12em] opacity-85">Donor &amp; Surrogacy</span>
        </span>
      </a>

      <nav class="hidden lg:flex items-center gap-7 text-[length:var(--fs-small)] font-medium" aria-label="Primary navigation">
        <a href="/about/" class="whitespace-nowrap shrink-0 hover:underline underline-offset-4 py-2">About</a>

        <div class="relative nav-dropdown-group" data-dropdown>
          <button type="button" class="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-2 hover:underline underline-offset-4" aria-expanded="false" aria-haspopup="true">
            <span>Services</span>
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
          <div class="nav-dropdown-panel absolute left-0 top-full pt-2 w-64 z-50">
            <ul class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] p-2 shadow-sm">
              <li><a href="/services/surrogacy/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Surrogacy</a></li>
              <li><a href="/services/ovum-donation/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Ovum Donation</a></li>
              <li><a href="/services/personalized-matching/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Personalized Matching</a></li>
              <li><a href="/services/counseling-ivf-support/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Counseling and IVF Support</a></li>
            </ul>
          </div>
        </div>

        <div class="relative nav-dropdown-group" data-dropdown>
          <button type="button" class="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-2 hover:underline underline-offset-4" aria-expanded="false" aria-haspopup="true">
            <span>Intended Parents</span>
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
          <div class="nav-dropdown-panel absolute left-0 top-full pt-2 w-64 z-50">
            <ul class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] p-2 shadow-sm">
              <li><a href="/intended-parents/how-it-works/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">How It Works</a></li>
              <li><a href="/intended-parents/programs-by-country/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Programs by Country</a></li>
              <li><a href="/intended-parents/costs-and-packages/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Costs and Packages</a></li>
              <li><a href="/intended-parents/legal-and-ethics/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Legal and Ethics</a></li>
            </ul>
          </div>
        </div>

        <div class="relative nav-dropdown-group" data-dropdown>
          <button type="button" class="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-2 hover:underline underline-offset-4" aria-expanded="false" aria-haspopup="true">
            <span>Surrogates &amp; Donors</span>
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
          <div class="nav-dropdown-panel absolute left-0 top-full pt-2 w-64 z-50">
            <ul class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] p-2 shadow-sm">
              <li><a href="/surrogates-donors/become-a-surrogate/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Become a Surrogate</a></li>
              <li><a href="/surrogates-donors/become-an-egg-donor/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Become an Egg Donor</a></li>
              <li><a href="/surrogates-donors/compensation-and-support/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Compensation and Support</a></li>
            </ul>
          </div>
        </div>

        <div class="relative nav-dropdown-group" data-dropdown>
          <button type="button" class="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-2 hover:underline underline-offset-4" aria-expanded="false" aria-haspopup="true">
            <span>Resources</span>
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
          <div class="nav-dropdown-panel absolute left-0 top-full pt-2 w-60 z-50">
            <ul class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] p-2 shadow-sm">
              <li><a href="/resources/blog/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Blog</a></li>
              <li><a href="/resources/faq/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">FAQ</a></li>
              <li><a href="/resources/stories-and-reviews/" class="block px-3 py-2.5 rounded hover:bg-[#E1E0DD]/50 text-[length:var(--fs-small)]">Stories and Reviews</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="flex items-center gap-3 shrink-0">
        <a href="/book/" class="hidden lg:inline-flex btn-primary">Book Consultation</a>
        <button type="button" id="mobile-menu-toggle" class="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius)] border border-current/25" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle navigation menu">
          <span data-icon-menu><i data-lucide="menu" class="w-5 h-5"></i></span>
          <span data-icon-close class="hidden"><i data-lucide="x" class="w-5 h-5"></i></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Navigation Drawer -->
  <div id="mobile-menu" class="hidden lg:hidden absolute top-full left-0 right-0 bg-[#FAF9F6]/95 backdrop-blur-xl text-[#17191A] border-b border-[#E1E0DD] z-40 max-h-[82vh] overflow-y-auto px-4" aria-label="Mobile navigation">
    <div class="zizo-container py-5 space-y-2">
      <a href="/about/" class="block py-3 border-b border-[#E1E0DD] font-medium">About</a>

      <div class="border-b border-[#E1E0DD]" data-mobile-accordion>
        <button type="button" class="w-full flex items-center justify-between py-3 font-medium text-left" aria-expanded="false">
          <span>Services</span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform"></i>
        </button>
        <div class="hidden pb-3 pl-3 space-y-2 text-[length:var(--fs-small)]">
          <a href="/services/" class="block py-1.5 text-[#5D5E5F]">All Services</a>
          <a href="/services/surrogacy/" class="block py-1.5">Surrogacy</a>
          <a href="/services/ovum-donation/" class="block py-1.5">Ovum Donation</a>
          <a href="/services/personalized-matching/" class="block py-1.5">Personalized Matching</a>
          <a href="/services/counseling-ivf-support/" class="block py-1.5">Counseling and IVF Support</a>
        </div>
      </div>

      <div class="border-b border-[#E1E0DD]" data-mobile-accordion>
        <button type="button" class="w-full flex items-center justify-between py-3 font-medium text-left" aria-expanded="false">
          <span>Intended Parents</span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform"></i>
        </button>
        <div class="hidden pb-3 pl-3 space-y-2 text-[length:var(--fs-small)]">
          <a href="/intended-parents/how-it-works/" class="block py-1.5">How It Works</a>
          <a href="/intended-parents/programs-by-country/" class="block py-1.5">Programs by Country</a>
          <a href="/intended-parents/costs-and-packages/" class="block py-1.5">Costs and Packages</a>
          <a href="/intended-parents/legal-and-ethics/" class="block py-1.5">Legal and Ethics</a>
        </div>
      </div>

      <div class="border-b border-[#E1E0DD]" data-mobile-accordion>
        <button type="button" class="w-full flex items-center justify-between py-3 font-medium text-left" aria-expanded="false">
          <span>Surrogates &amp; Donors</span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform"></i>
        </button>
        <div class="hidden pb-3 pl-3 space-y-2 text-[length:var(--fs-small)]">
          <a href="/surrogates-donors/become-a-surrogate/" class="block py-1.5">Become a Surrogate</a>
          <a href="/surrogates-donors/become-an-egg-donor/" class="block py-1.5">Become an Egg Donor</a>
          <a href="/surrogates-donors/compensation-and-support/" class="block py-1.5">Compensation and Support</a>
        </div>
      </div>

      <div class="border-b border-[#E1E0DD]" data-mobile-accordion>
        <button type="button" class="w-full flex items-center justify-between py-3 font-medium text-left" aria-expanded="false">
          <span>Resources</span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform"></i>
        </button>
        <div class="hidden pb-3 pl-3 space-y-2 text-[length:var(--fs-small)]">
          <a href="/resources/blog/" class="block py-1.5">Blog</a>
          <a href="/resources/faq/" class="block py-1.5">FAQ</a>
          <a href="/resources/stories-and-reviews/" class="block py-1.5">Stories and Reviews</a>
        </div>
      </div>

      <div class="pt-3 flex flex-col gap-3">
        <a href="/book/" class="btn-primary w-full justify-center">Book Consultation</a>
        <a href="/contact/" class="btn-secondary w-full justify-center">Contact Us</a>
      </div>
    </div>
  </div>
</header>`;
}

export function renderInteriorHero({ breadcrumbs = [], title, intro, note = '' }) {
  const crumbsHtml = breadcrumbs
    .map((b, i) => {
      const isLast = i === breadcrumbs.length - 1;
      if (isLast || !b.href) {
        return `<span class="text-[#17191A]">${escapeHtml(b.label)}</span>`;
      }
      return `<a href="${escapeHtml(b.href)}" class="text-[#5D5E5F] hover:text-[#17645F] underline-offset-4 hover:underline">${escapeHtml(b.label)}</a>`;
    })
    .join('<span aria-hidden="true" class="mx-2 text-[#5D5E5F]">/</span>');

  return `<section class="pt-32 pb-12 border-b border-[#E1E0DD] bg-[#FAF9F6]">
  <div class="zizo-container">
    <nav aria-label="Breadcrumb" class="text-[length:var(--fs-small)] mb-4">
      ${crumbsHtml}
    </nav>
    <h1 class="display max-w-3xl mb-4">${escapeHtml(title)}</h1>
    <p class="text-[length:var(--fs-body)] text-[#2E3031] max-w-2xl">${escapeHtml(intro)}</p>
    ${note ? `<p class="mt-4 text-[length:var(--fs-small)] text-[#5D5E5F]">${escapeHtml(note)}</p>` : ''}
  </div>
</section>`;
}

export function getWhatsappHref(settings = {}) {
  const whatsappRaw = String(settings.whatsapp_number || '{{WHATSAPP_NUMBER}}');
  const whatsappClean = whatsappRaw.replace(/[^\d]/g, '');
  return whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hello Zizo Donor and Surrogacy, I would like to learn more about a confidential consultation.')}`
    : '/contact/';
}

export function renderClosingCta({ settings = {}, whatsappHref = '' }) {
  const resolvedHref = whatsappHref || getWhatsappHref(settings);
  return `<section class="relative bg-[#17645F] text-[#FAF9F6] surface-teal overflow-hidden zizo-section">
  <div class="cta-grid-overlay absolute inset-0 pointer-events-none" aria-hidden="true"></div>
  <div class="zizo-container relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
    <div class="max-w-2xl reveal">
      <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#FAF9F6]/80 mb-3">Join our community</p>
      <h2 class="display text-[#FAF9F6]">Your journey to parenthood starts here.</h2>
    </div>
    <div class="flex flex-wrap items-center gap-4 reveal">
      <a href="/surrogates-donors/become-a-surrogate/" class="btn-on-teal">Become Surrogate</a>
      <a href="/surrogates-donors/become-an-egg-donor/" class="btn-secondary-light">Become Egg Donor</a>
    </div>
  </div>
</section>`;
}

export function renderFooter({ settings = {}, hideStickyBar = false, extraScripts = '' }) {
  const address = String(settings.contact_address || '{{ADDRESS_LAGOS}}');
  const email = String(settings.contact_email || '{{EMAIL}}');
  const phone = String(settings.contact_phone || '{{PHONE}}');
  const whatsappHref = getWhatsappHref(settings);

  return `<footer class="bg-[#17191A] text-[#FAF9F6] surface-dark pt-16 pb-10 border-t border-[#FAF9F6]/10">
  <div class="zizo-container">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-[#FAF9F6]/15">
      <div class="lg:col-span-5 space-y-4">
        <a href="/" class="inline-flex items-center gap-3 text-[#FAF9F6]">
          ${zizoLogoSvg()}
          <span class="flex flex-col leading-none">
            <span class="font-display text-xl font-semibold">Zizo</span>
            <span class="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#FAF9F6]/75">Donor &amp; Surrogacy</span>
          </span>
        </a>
        <p class="text-[length:var(--fs-small)] text-[#FAF9F6]/80 max-w-sm">
          A safe fertility brand that creates families across borders, with expert legal and medical coordination and personal care at every step.
        </p>

        <!-- Social Media Icons (Lightweight Icons) -->
        <div class="flex items-center gap-4 pt-1" aria-label="Zizo social media">
          <a href="${escapeHtml(settings.social_facebook || 'https://facebook.com/')}" target="_blank" rel="noopener noreferrer" aria-label="Follow Zizo on Facebook" class="opacity-80 hover:opacity-100 transition-opacity text-[#FAF9F6] inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-auto" viewBox="0 0 224 432" aria-hidden="true">
              <path fill="#FAF9F6" d="M145 429H66V235H0v-76h66v-56q0-48 27-74t72-26q36 0 59 3v67l-41 1q-22 0-30 9t-8 27v49h76l-10 76h-66v194z"></path>
            </svg>
          </a>
          <a href="${escapeHtml(settings.social_linkedin || 'https://linkedin.com/')}" target="_blank" rel="noopener noreferrer" aria-label="Follow Zizo on LinkedIn" class="opacity-80 hover:opacity-100 transition-opacity text-[#FAF9F6] inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-auto" viewBox="0 0 432 432" aria-hidden="true">
              <path fill="#FAF9F6" d="M319 221.5q-8-10.5-30-10.5q-27 0-38 16t-11 45v146q0 5-3 8t-8 3h-76q-4 0-7.5-3t-3.5-8V148q0-4 3.5-7.5t7.5-3.5h74q4 0 6.5 2t3.5 6v5q1 2 1 7q28-27 76-27q53 0 83 27t30 79v182q0 5-3.5 8t-7.5 3h-78q-4 0-7.5-3t-3.5-8V254q0-22-8-32.5zM88 91.5Q73 107 51.5 107T15 91.5t-15-37T15 18T51.5 3T88 18t15 36.5t-15 37zm13 56.5v270q0 5-3.5 8t-7.5 3H14q-5 0-8-3t-3-8V148q0-4 3-7.5t8-3.5h76q4 0 7.5 3.5t3.5 7.5z"></path>
            </svg>
          </a>
          <a href="${escapeHtml(settings.social_instagram || 'https://instagram.com/')}" target="_blank" rel="noopener noreferrer" aria-label="Follow Zizo on Instagram" class="opacity-80 hover:opacity-100 transition-opacity text-[#FAF9F6] inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-auto" viewBox="0 0 14 14" aria-hidden="true">
              <g fill="none" stroke="#FAF9F6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.333 3.644a.25.25 0 1 1 0-.5m0 .5a.25.25 0 1 0 0-.5"></path>
                <path d="M.858 3.431A2.573 2.573 0 0 1 3.431.858h6.862a2.573 2.573 0 0 1 2.573 2.573v6.862a2.573 2.573 0 0 1-2.573 2.573H3.43a2.573 2.573 0 0 1-2.573-2.573V3.43Z"></path>
                <path d="M4.312 6.862a2.55 2.55 0 1 0 5.1 0a2.55 2.55 0 1 0-5.1 0"></path>
              </g>
            </svg>
          </a>
          <a href="${escapeHtml(settings.social_twitter || 'https://x.com/')}" target="_blank" rel="noopener noreferrer" aria-label="Follow Zizo on X (formerly Twitter)" class="opacity-80 hover:opacity-100 transition-opacity text-[#FAF9F6] inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-auto" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#FAF9F6" d="M8 2H1l8.26 11.014L1.45 22H4.1l6.388-7.349L16 22h7l-8.608-11.478L21.8 2h-2.65l-5.986 6.886L8 2Zm9 18L5 4h2l12 16h-2Z"></path>
            </svg>
          </a>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-3">
        <h3 class="text-[length:var(--fs-small)] font-semibold uppercase tracking-[0.1em] text-[#FAF9F6] font-sans">Company</h3>
        <ul class="space-y-2.5 text-[length:var(--fs-small)]">
          <li><a href="/about/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">About Us</a></li>
          <li><a href="/intended-parents/how-it-works/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">How It Works</a></li>
          <li><a href="/contact/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Contact Us</a></li>
        </ul>
      </div>

      <div class="lg:col-span-3 space-y-3">
        <h3 class="text-[length:var(--fs-small)] font-semibold uppercase tracking-[0.1em] text-[#FAF9F6] font-sans">Services</h3>
        <ul class="space-y-2.5 text-[length:var(--fs-small)]">
          <li><a href="/services/surrogacy/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Surrogacy</a></li>
          <li><a href="/services/ovum-donation/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Donation</a></li>
          <li><a href="/services/personalized-matching/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Matching</a></li>
          <li><a href="/services/counseling-ivf-support/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">IVF Support</a></li>
        </ul>
      </div>

      <div class="lg:col-span-2 space-y-3">
        <h3 class="text-[length:var(--fs-small)] font-semibold uppercase tracking-[0.1em] text-[#FAF9F6] font-sans">Resources</h3>
        <ul class="space-y-2.5 text-[length:var(--fs-small)]">
          <li><a href="/surrogates-donors/become-a-surrogate/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Surrogate &amp; Egg Donor</a></li>
          <li><a href="/resources/blog/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Our Blog</a></li>
          <li><a href="/resources/faq/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">FAQs</a></li>
          <li><a href="/resources/stories-and-reviews/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">Stories</a></li>
        </ul>
      </div>
    </div>

    <div class="py-6 border-b border-[#FAF9F6]/15 flex flex-wrap items-center justify-between gap-4 text-[length:var(--fs-small)] text-[#FAF9F6]/80">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span class="inline-flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-[#8BB2AF]"></i> ${escapeHtml(address)}</span>
        <span class="inline-flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4 text-[#8BB2AF]"></i> ${escapeHtml(email)}</span>
        <span class="inline-flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4 text-[#8BB2AF]"></i> ${escapeHtml(phone)}</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="${escapeHtml(whatsappHref)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline underline-offset-4">
          ${whatsappSvg('w-4 h-4 text-[#8BB2AF]')}
          <span>WhatsApp</span>
        </a>
        <a href="/admin/" class="text-[#FAF9F6]/65 hover:text-[#FAF9F6] hover:underline underline-offset-4">Staff Portal</a>
      </div>
    </div>

    <div class="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-[#FAF9F6]/75">
      <p>© 2026 Zizo Donor and Surrogacy. All rights reserved.</p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a href="/privacy-policy/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline">Privacy Policy</a>
        <span aria-hidden="true">·</span>
        <a href="/terms/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline">Terms and Conditions</a>
        <span aria-hidden="true">·</span>
        <a href="/confidentiality-statement/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline">Confidentiality Statement</a>
        <span aria-hidden="true">·</span>
        <a href="/cookie-policy/" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline">Cookie Policy</a>
        <span aria-hidden="true">·</span>
        <button type="button" id="open-cookie-settings" class="text-[#FAF9F6]/80 hover:text-[#FAF9F6] hover:underline">Cookie Choices</button>

      </div>
    </div>
  </div>
</footer>

${
  hideStickyBar
    ? ''
    : `<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E1E0DD] px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] flex items-center gap-2.5">
  <a href="/book/" class="btn-primary flex-1 justify-center !py-2.5 !min-h-[40px]">Book Consultation</a>
  <a href="${escapeHtml(whatsappHref)}" target="_blank" rel="noopener noreferrer" aria-label="Message Zizo on WhatsApp" class="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius)] bg-[#17191A] text-[#FAF9F6] shrink-0">
    ${whatsappSvg('w-5 h-5')}
  </a>
</div>`
}

<a href="${escapeHtml(whatsappHref)}" target="_blank" rel="noopener noreferrer" aria-label="Message Zizo on WhatsApp" class="hidden md:inline-flex fixed bottom-6 right-6 z-40 items-center justify-center w-13 h-13 rounded-full bg-[#17645F] hover:bg-[#155A56] text-[#FAF9F6] shadow-md transition-colors">
  ${whatsappSvg('w-6 h-6')}
</a>

<!-- Cookie Banner (compact bottom strip that never covers hero H1 or floating WhatsApp action) -->
<aside id="cookie-banner" role="dialog" aria-label="Cookie preferences" class="hidden fixed bottom-16 md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-[60] bg-[#FAF9F6]/95 backdrop-blur-md text-[#17191A] border md:border-x-0 md:border-b-0 border-[#E1E0DD] rounded-[var(--radius)] md:rounded-none px-4 py-3 md:px-6 md:py-3 md:pr-24 shadow-lg">
  <div class="zizo-container !px-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
    <div class="text-xs sm:text-[length:var(--fs-small)] text-[#2E3031]">
      <strong class="font-display text-[#17191A] font-medium mr-1.5">Your privacy choices:</strong>
      <span>Zizo uses strictly essential cookies for security and booking continuity. Optional analytics loads only with consent.</span>
    </div>
    <div class="flex flex-wrap items-center gap-2 shrink-0">
      <button type="button" id="cookie-accept-all" class="btn-primary !py-1.5 !px-3.5 !min-h-[38px]">Accept</button>
      <button type="button" id="cookie-essential-only" class="btn-secondary !py-1.5 !px-3.5 !min-h-[38px]">Essential only</button>
      <button type="button" id="cookie-manage-btn" class="text-xs sm:text-[length:var(--fs-small)] text-[#17645F] underline underline-offset-4 px-2 py-1.5">Manage</button>
    </div>
  </div>
</aside>

<!-- Cookie Manage Modal -->
<div id="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" class="hidden fixed inset-0 z-[70] bg-[#17191A]/60 flex items-center justify-center p-4">
  <div class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] max-w-md w-full p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h2 id="cookie-modal-title" class="font-display text-xl">Cookie Preferences</h2>
      <button type="button" id="cookie-modal-close" class="w-10 h-10 inline-flex items-center justify-center rounded border border-[#E1E0DD]" aria-label="Close cookie preferences">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
    <div class="space-y-3 text-[length:var(--fs-small)]">
      <div class="p-3 border border-[#E1E0DD] rounded-[var(--radius)] flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold">Essential Security &amp; Session</p>
          <p class="text-[#5D5E5F]">Always active for spam protection, staff authentication, and booking continuity.</p>
        </div>
        <span class="text-xs font-semibold text-[#17645F]">Active</span>
      </div>
      <label class="p-3 border border-[#E1E0DD] rounded-[var(--radius)] flex items-start justify-between gap-3 cursor-pointer">
        <div>
          <p class="font-semibold">Privacy-Friendly Analytics</p>
          <p class="text-[#5D5E5F]">Aggregated page metrics without advertising pixels or cross-site tracking.</p>
        </div>
        <input type="checkbox" id="cookie-analytics-toggle" class="mt-1 w-5 h-5 accent-[#17645F]" />
      </label>
    </div>
    <div class="flex justify-end gap-2.5 pt-2">
      <button type="button" id="cookie-save-prefs" class="btn-primary">Save preferences</button>
    </div>
  </div>
</div>

<div id="zizo-toast" role="status" aria-live="polite" class="hidden fixed top-24 right-4 z-[70] bg-[#17191A] text-[#FAF9F6] border border-[#FAF9F6]/20 rounded-[var(--radius)] px-4 py-3 text-[length:var(--fs-small)] shadow-lg max-w-sm"></div>

<script src="/assets/vendor/lucide.min.js" defer></script>
<script type="module" src="/assets/js/site.js"></script>
${extraScripts}
</body>
</html>`;
}
