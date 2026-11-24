import {
  escapeHtml,
  pictureTag,
  renderClosingCta,
  renderFooter,
  renderHead,
  renderHeader,
  renderInteriorHero,
} from '../partials/layout.mjs';

export function renderAboutPage({ settings = {}, siteUrl = '' }) {
  const founderPhoto = String(settings.founder_photo_url || '').trim();

  const whoWeWorkWith = [
    'Individuals and couples of all backgrounds seeking a safe, private pathway to parenthood',
    'Single intended parents building their families with dedicated guidance',
    'International intended parents coordinating cross-border care in Nigeria, Europe, Asia, Canada, and the United States',
    'Ovum (egg) donors completing confidential, medically supervised screening',
    'Gestational surrogates supported with respect, transparency, and dedicated case management',
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${siteUrl}/about/` },
    ],
  };

  return `${renderHead({
    title: 'About Zizo | Zizo Donor and Surrogacy',
    description:
      'Founded by Chizaram Ata with 12+ years in reproductive and women’s health, Zizo creates families across borders with compassion, privacy, and ethical coordination.',
    canonicalPath: '/about/',
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'About' }],
    title: 'About Zizo',
    intro:
      'Zizo Donor and Surrogacy guides intended parents, gestational surrogates, and egg donors across borders with calm, personal coordination from Lagos, Nigeria.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start">
      <div class="lg:col-span-5">
        <div class="group rounded-2xl overflow-hidden aspect-[4/5] bg-[#E1E0DD] border border-[#E1E0DD] shadow-sm relative">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]">
            ${
              founderPhoto
                ? `<img src="${escapeHtml(founderPhoto)}" alt="Chizaram Ata, Founder and Lead Partner at Zizo Donor and Surrogacy" width="800" height="1000" class="w-full h-full object-cover object-top" />`
                : pictureTag({
                    base: 'founder-about-chizaram-ata',
                    alt: 'Chizaram Ata, Founder and Lead Partner at Zizo Donor and Surrogacy',
                    width: 2429,
                    height: 2144,
                    className: 'w-full h-full object-cover object-top',
                    sizes: '(min-width: 1024px) 480px, 100vw',
                    eager: false,
                  })
            }
          </div>
          <!-- Floating Founder Badge -->
          <div class="absolute bottom-4 inset-x-4 z-10 p-3.5 rounded-xl bg-[#17191A]/85 backdrop-blur-md border border-[#FAF9F6]/15 flex items-center justify-between text-[#FAF9F6]">
            <div>
              <p class="font-display text-sm font-medium leading-tight">Chizaram Ata</p>
              <p class="text-[10px] text-[#8BB2AF] tracking-wider uppercase mt-0.5">Founder &amp; Lead Partner</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17645F]/70 text-[10px] text-[#FAF9F6] border border-[#8BB2AF]/30 tabular-nums">
              <i data-lucide="award" class="w-3 h-3 text-[#8BB2AF]"></i>
              <span>12+ Years Exp.</span>
            </span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7 space-y-6 reveal">
        <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Founder Story</p>
        <h2 class="display">Led by Chizaram Ata — 12+ years in reproductive and women’s health</h2>
        <p class="text-[length:var(--fs-body)] text-[#2E3031]">
          Zizo was founded by Chizaram Ata to bring calm structure, ethical screening, and genuine human warmth to cross-border surrogacy and donor care. Drawing on more than 12 years of experience across reproductive and women’s health, Chizaram saw how often intended parents and surrogates felt overwhelmed by fragmented communication across clinics, borders, and legal teams.
        </p>
        <p class="text-[length:var(--fs-body)] text-[#2E3031]">
          At Zizo Surrogacy, every journey is guided quietly and confidentially. From the first private conversation in Lagos or online across time zones, our coordinators focus on clear expectations, medical safety, independent legal guidance, and emotional care for everyone involved.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E1E0DD]">
          <div class="space-y-2">
            <h3 class="display text-[length:var(--fs-h3)]">Our Mission</h3>
            <p class="text-[length:var(--fs-small)] text-[#2E3031]">
              To create safe, discreet, and ethically coordinated pathways to parenthood across borders while honouring the health, dignity, and privacy of surrogates and donors.
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="display text-[length:var(--fs-h3)]">Our Vision</h3>
            <p class="text-[length:var(--fs-small)] text-[#2E3031]">
              A fertility care experience where every parent, surrogate, and donor feels informed, respected, and personally supported from first consultation to birth.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="zizo-section bg-[#E1E0DD]/40 border-y border-[#E1E0DD]">
    <div class="zizo-container space-y-[var(--space-md)]">
      <div class="max-w-2xl reveal">
        <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F] mb-2">The Zizo Care Architecture</p>
        <h2 class="display">How we safeguard every stage of your journey</h2>
        <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">From autonomous legal counsel and secure escrow to physician-led matching and international homecoming, our care structure is built with zero gray areas.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <!-- Bento 1: Legal & Escrow Shield (Hero Card, Span 7) -->
        <div class="lg:col-span-7 bg-[#FAF9F6] border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 space-y-6 reveal flex flex-col justify-between shadow-sm hover:border-[#8BB2AF]/60 transition-colors">
          <div class="space-y-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Ethical Protection
              </span>
            </div>
            <h3 class="display text-[length:var(--fs-h3)] text-[#17191A] leading-snug">Autonomous Legal Counsel &amp; Protected Escrow</h3>
            <p class="text-[length:var(--fs-body)] text-[#2E3031] leading-relaxed">
              We eliminate conflicts of interest before medical protocols begin. Every surrogate receives independent legal representation funded by escrow, ensuring informed consent, while intended parent finances are safeguarded through milestone disbursements.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-[#E1E0DD]/80">
            <div class="p-3.5 rounded-xl bg-[#E1E0DD]/30 border border-[#E1E0DD]/60 flex items-start gap-2.5">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Dedicated Escrow Account</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Disbursements released strictly upon clinical verification.</p>
              </div>
            </div>
            <div class="p-3.5 rounded-xl bg-[#E1E0DD]/30 border border-[#E1E0DD]/60 flex items-start gap-2.5">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Independent Legal Representation</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Separate attorneys for intended parents and surrogates.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bento 2: Clinical Stewardship (Span 5) -->
        <div class="lg:col-span-5 bg-[#FAF9F6] border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 space-y-6 reveal flex flex-col justify-between shadow-sm hover:border-[#8BB2AF]/60 transition-colors">
          <div class="space-y-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Physician-Led
              </span>
            </div>
            <h3 class="display text-[length:var(--fs-h3)] text-[#17191A] leading-snug">12+ Years Clinical Oversight</h3>
            <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">
              Every medical match is supervised under Chizaram Ata’s reproductive healthcare background. We partner strictly with certified IVF laboratories and embryologists adhering to international ESHRE &amp; ASRM clinical standards.
            </p>
          </div>
          <div class="space-y-2.5 pt-5 border-t border-[#E1E0DD]/80 text-xs text-[#2E3031]">
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#17645F] shrink-0"></i>
              <span>Triple-tier infectious, genetic, and ovarian reserve screening</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#17645F] shrink-0"></i>
              <span>Comprehensive psychological readiness evaluations</span>
            </div>
          </div>
        </div>

        <!-- Bento 3: Cross-Border Concierge (Span 5) -->
        <div class="lg:col-span-5 bg-[#FAF9F6] border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 space-y-6 reveal flex flex-col justify-between shadow-sm hover:border-[#8BB2AF]/60 transition-colors">
          <div class="space-y-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="globe" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Global Compliance
              </span>
            </div>
            <h3 class="display text-[length:var(--fs-h3)] text-[#17191A] leading-snug">Consular &amp; Legal Homecoming</h3>
            <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">
              Connecting Nigeria, the US, UK, Canada, Europe, and Asia. We manage court parentage declarations, certified DNA testing, birth certificate legalization, and embassy passport paperwork for an anxiety-free journey home.
            </p>
          </div>
          <div class="space-y-2.5 pt-5 border-t border-[#E1E0DD]/80 text-xs text-[#2E3031]">
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#17645F] shrink-0"></i>
              <span>Pre-birth &amp; post-birth court orders for legal parentage</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-[#17645F] shrink-0"></i>
              <span>Consular Report of Birth Abroad (CRBA) and visa filings</span>
            </div>
          </div>
        </div>

        <!-- Bento 4: Zero Middlemen & Direct Support (Span 7) -->
        <div class="lg:col-span-7 bg-[#FAF9F6] border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 space-y-6 reveal flex flex-col justify-between shadow-sm hover:border-[#8BB2AF]/60 transition-colors">
          <div class="space-y-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="heart-handshake" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Direct Stewardship
              </span>
            </div>
            <h3 class="display text-[length:var(--fs-h3)] text-[#17191A] leading-snug">Zero Middlemen, Full Human Care</h3>
            <p class="text-[length:var(--fs-body)] text-[#2E3031] leading-relaxed">
              You are never handed off to anonymous call centers or rotating junior coordinators. Chizaram Ata and your dedicated care team provide transparent milestone communication, real-time clinical logs, 24/7 urgent response, and long-term postpartum support.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-[#E1E0DD]/80">
            <div class="p-3.5 rounded-xl bg-[#E1E0DD]/30 border border-[#E1E0DD]/60 flex items-start gap-2.5">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Direct Founder &amp; Team Access</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Private WhatsApp channels with real-time updates.</p>
              </div>
            </div>
            <div class="p-3.5 rounded-xl bg-[#E1E0DD]/30 border border-[#E1E0DD]/60 flex items-start gap-2.5">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Comprehensive Postpartum Care</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Continued wellness and recovery monitoring for surrogates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start">
      <div class="lg:col-span-5 reveal">
        <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F] mb-2">Who We Work With</p>
        <h2 class="display">Care tailored to your family and journey</h2>
      </div>
      <div class="lg:col-span-7 divide-y divide-[#E1E0DD] border-y border-[#E1E0DD] reveal">
        ${whoWeWorkWith
          .map(
            (item) => `<div class="py-4 flex items-start gap-3">
          <i data-lucide="check" class="w-5 h-5 text-[#17645F] mt-0.5 shrink-0"></i>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(item)}</p>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export const SERVICE_DEFINITIONS = [];

export function renderServicesHub({ settings = {}, services = [], siteUrl = '' }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${siteUrl}/services/` },
    ],
  };

  return `${renderHead({
    title: 'Fertility & Surrogacy Services | Zizo Donor and Surrogacy',
    description:
      'Confidential surrogacy coordination, egg donor screening, IVF clinic liaison, and cross-border legal support from Zizo in Lagos, Nigeria.',
    canonicalPath: '/services/',
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false, services })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Services' }],
    title: 'Our Services',
    intro:
      'Care coordination designed around clinical rigour, legal clarity, anonymity, and steady personal care.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container">
      ${services && services.length > 0 ? `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        ${services.map(
          (svc) => `<a href="/services/${escapeHtml(svc.slug)}/" class="group block border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal">
          <div class="aspect-[16/10] overflow-hidden bg-[#E1E0DD]">
            <img src="${escapeHtml(svc.image_path || '/assets/img/service-matching-1920w.webp')}" alt="${escapeHtml(svc.image_alt || svc.title)}" width="1200" height="750" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
          <div class="p-6 space-y-3">
            <div class="flex items-center justify-between text-xs text-[#5D5E5F] tabular-nums">
              <span>Service</span>
              <i data-lucide="arrow-up-right" class="w-4 h-4 text-[#17645F]"></i>
            </div>
            <h2 class="display text-[length:var(--fs-h3)] text-[#17191A]">${escapeHtml(svc.title)}</h2>
            <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(svc.short_description || svc.summary || '')}</p>
            <div class="pt-3 border-t border-[#E1E0DD] flex items-center justify-between text-xs text-[#5D5E5F]">
              <span>Consultation fee: <strong class="text-[#17645F] font-semibold">${svc.show_price ? (svc.price_amount > 0 ? `${escapeHtml(svc.price_currency || 'NGN')} ${Number(svc.price_amount).toLocaleString()}` : 'Free') : 'On Request'}</strong></span>
            </div>
          </div>
        </a>`
        ).join('')}
      </div>` : `
      <div class="rounded-2xl border border-[#E1E0DD] bg-[#F4F4F2] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 reveal">
        <div class="w-14 h-14 rounded-full bg-[#17645F]/10 text-[#17645F] flex items-center justify-center mx-auto">
          <i data-lucide="shield-check" class="w-7 h-7 text-[#17645F]"></i>
        </div>
        <div class="space-y-3">
          <h2 class="display text-2xl sm:text-3xl text-[#17191A]">Personalized Care Pathways</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] leading-relaxed max-w-xl mx-auto">
            Our comprehensive clinical coordination pathways are customized for each family. Connect with our coordination team to discuss tailored gestational surrogacy, egg donor matching, and clinic liaison services.
          </p>
        </div>
        <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a href="/book/" class="btn-primary">Book Private Consultation</a>
          <a href="/contact/" class="btn-secondary">Contact Coordination Team</a>
        </div>
      </div>
      `}
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings, services })}`;
}

export function renderServiceDetailPage({
  service,
  settings = {},
  services = [],
  faqs = [],
  posts = [],
  reviews = [],
  siteUrl = '',
}) {
  const title = service.title || 'Fertility Service';
  const summary = service.summary || service.short_description || '';
  const intro = service.intro || summary;
  const duration = service.duration || '45 minutes';
  const priceDisplay = service.price || (service.show_price ? (service.price_amount > 0 ? `${escapeHtml(service.price_currency || 'NGN')} ${Number(service.price_amount).toLocaleString()}` : 'Free') : 'On Request');
  const whoFor = Array.isArray(service.whoFor) ? service.whoFor : [];
  const included = Array.isArray(service.included) ? service.included : [];
  const howItWorks = Array.isArray(service.howItWorks) ? service.howItWorks : [];
  const relatedServices = (services || []).filter((s) => s.slug !== service.slug);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description: summary,
      provider: {
        '@type': 'Organization',
        name: 'Zizo Donor and Surrogacy',
      },
      areaServed: ['Nigeria', 'Europe', 'Asia', 'Canada', 'United States'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${siteUrl}/services/` },
        { '@type': 'ListItem', position: 3, name: title, item: `${siteUrl}/services/${service.slug}/` },
      ],
    },
  ];

  return `${renderHead({
    title: `${title} | Zizo Donor and Surrogacy`,
    description: summary,
    canonicalPath: `/services/${service.slug}/`,
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false, services })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services/' },
      { label: title },
    ],
    title,
    intro,
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-xl)]">

      <!-- Consultation Fee & Duration Metadata Bar -->
      <div class="p-6 bg-[#E1E0DD]/35 border border-[#E1E0DD] rounded-[var(--radius)] flex flex-col md:flex-row md:items-center justify-between gap-6 reveal">
        <div class="flex flex-wrap items-center gap-6 sm:gap-10">
          <div class="space-y-1">
            <span class="text-xs uppercase tracking-wider text-[#5D5E5F] font-medium block">Consultation fee:</span>
            <span class="display text-2xl text-[#17645F] font-semibold">${priceDisplay}</span>
          </div>
          <div class="w-px h-10 bg-[#E1E0DD] hidden sm:block" aria-hidden="true"></div>
          <div class="space-y-1">
            <span class="text-xs uppercase tracking-wider text-[#5D5E5F] font-medium block">Typical duration:</span>
            <span class="display text-2xl text-[#17191A] font-medium">${escapeHtml(duration)}</span>
          </div>
          <div class="w-px h-10 bg-[#E1E0DD] hidden sm:block" aria-hidden="true"></div>
          <div class="space-y-1">
            <span class="text-xs uppercase tracking-wider text-[#5D5E5F] font-medium block">Format:</span>
            <span class="text-[length:var(--fs-small)] text-[#2E3031] font-medium">Google Meet, Phone or WhatsApp</span>
          </div>
        </div>
        <div>
          <a href="/book/" class="btn-primary w-full md:w-auto text-center justify-center">Book Consultation</a>
        </div>
      </div>

      <!-- Featured Image -->
      <div class="aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius)] overflow-hidden bg-[#E1E0DD] reveal">
        ${service.image_path ? `<img src="${escapeHtml(service.image_path)}" alt="${escapeHtml(service.image_alt || title)}" width="1920" height="1080" class="w-full h-full object-cover" />` : pictureTag({
          base: service.imageBase || 'service-matching',
          alt: service.imageAlt || title,
          width: 1920,
          height: 1080,
          eager: true,
        })}
      </div>

      <!-- Overview: Who it is for & What is included -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)]">
        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Overview</p>
          <h2 class="display">Who this service is for</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(summary)}</p>
          ${whoFor.length > 0 ? `
          <ul class="space-y-3 pt-2">
            ${whoFor
              .map(
                (w) => `<li class="flex items-start gap-3">
              <i data-lucide="check" class="w-5 h-5 text-[#17645F] mt-0.5 shrink-0"></i>
              <span>${escapeHtml(w)}</span>
            </li>`
              )
              .join('')}
          </ul>` : ''}
          ${service.body_md ? `<div class="pt-4 text-[length:var(--fs-body)] text-[#2E3031] leading-relaxed whitespace-pre-line">${escapeHtml(service.body_md)}</div>` : ''}
        </div>

        ${included.length > 0 ? `
        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Coordination Scope</p>
          <h2 class="display">What is included</h2>
          <ul class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
            ${included
              .map(
                (item) => `<li class="py-3.5 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(item)}</li>`
              )
              .join('')}
          </ul>
        </div>` : ''}
      </div>

      <!-- How it works? Section -->
      ${howItWorks.length > 0 ? `
      <div class="space-y-6 reveal">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Structured Process</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">How it works?</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">
            A transparent coordination pathway designed to protect your peace of mind and support your family journey.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          ${howItWorks
            .map(
              (step) => `<div class="border border-[#E1E0DD] rounded-xl p-6 bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <span class="display text-3xl font-light text-[#17645F]/40">${escapeHtml(step.step)}</span>
              <h3 class="display text-[length:var(--fs-h4)] text-[#17191A]">${escapeHtml(step.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">${escapeHtml(step.desc)}</p>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>` : ''}

      <!-- How screening works -->
      ${service.screening ? `
      <div class="bg-[#E1E0DD]/45 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center reveal">
        <div class="lg:col-span-8 space-y-2">
          <h2 class="display text-[length:var(--fs-h3)]">How screening works</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(service.screening)}</p>
        </div>
        <div class="lg:col-span-4 flex lg:justify-end">
          <a href="/book/" class="btn-primary">Book Consultation</a>
        </div>
      </div>` : ''}

      <!-- Parent and surrogate reflections -->
      ${(() => {
        if (!reviews || reviews.length === 0) {
          return `<div class="p-8 rounded-2xl border border-[#E1E0DD] bg-[#FAF9F6] text-center space-y-3 reveal">
            <h3 class="font-display text-base text-[#17191A]">Patient Reflections &amp; Clinical Feedback</h3>
            <p class="text-xs text-[#5D5E5F] max-w-lg mx-auto font-light leading-relaxed">
              We respect the sensitivity and privacy of all intended parents, surrogates, and egg donors. Client reviews are shared only with explicit consent and verified completion.
            </p>
            <a href="/resources/reviews/#write-a-review" class="inline-block text-xs font-semibold text-[#17645F] hover:underline mt-1">Share your experience &rarr;</a>
          </div>`;
        }

        return `<div class="space-y-6 reveal">
        <div class="flex items-center justify-between">
          <h2 class="display text-[length:var(--fs-h3)]">Parent and surrogate reflections</h2>
          <a href="/resources/reviews/" class="text-[length:var(--fs-small)] text-[#17645F] font-semibold hover:underline underline-offset-4">Read all stories</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${reviews.slice(0, 3)
            .map((rev) => {
              const dName = escapeHtml(rev.display_name || 'Anonymous');
              const rName = escapeHtml(rev.role || 'Client');
              const loc = escapeHtml(rev.country ? `${rev.role} · ${rev.country}` : rev.role);
              const starVal = Number(rev.rating || 5).toFixed(1);
              const bText = escapeHtml(rev.body || '');
              const isVerified = Boolean(rev.verified);

              return `<article class="rounded-2xl border border-[#E1E0DD] bg-white p-6 flex flex-col justify-between space-y-4 shadow-xs" tabindex="0" aria-label="Review by ${dName}">
                <div>
                  <div class="flex items-center justify-between pb-3 border-b border-[#E1E0DD]">
                    <span class="text-xs uppercase font-bold text-[#17645F]">${rName}</span>
                    <span class="text-xs text-[#17191A] font-mono">${starVal} ★</span>
                  </div>
                  <p class="text-xs text-[#2E3031] leading-relaxed italic mt-3">“${bText}”</p>
                </div>
                <div class="pt-3 border-t border-[#E1E0DD] flex items-center justify-between gap-2">
                  <div>
                    <div class="text-xs font-semibold text-[#17191A]">${dName}</div>
                    <div class="text-[11px] text-[#5D5E5F]">${loc}${isVerified ? ' · Verified' : ''}</div>
                  </div>
                  ${isVerified ? `
                    <div class="w-6 h-6 rounded-full bg-[#8BB2AF]/20 text-[#17645F] flex items-center justify-center shrink-0" title="Verified journey completion">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-[#17645F]"></i>
                    </div>
                  ` : ''}
                </div>
              </article>`;
            })
            .join('')}
        </div>
      </div>`;
      })()}

      <!-- Related Services (Typical Cards with Image and Text) -->
      ${relatedServices.length > 0 ? `
      <div class="space-y-6 reveal">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Complementary Pathways</p>
            <h2 class="display text-[length:var(--fs-h2)] mt-1">Related Services</h2>
          </div>
          <a href="/services/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4">Explore all services</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${relatedServices
            .slice(0, 3)
            .map(
              (svc) => `<a href="/services/${svc.slug}/" class="group block border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal">
            <div class="aspect-[16/10] overflow-hidden bg-[#E1E0DD]">
              <img src="${escapeHtml(svc.image_path || '/assets/img/service-matching-1920w.webp')}" alt="${escapeHtml(svc.image_alt || svc.title)}" width="1200" height="750" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <div class="p-6 space-y-3">
              <h3 class="display text-[length:var(--fs-h3)] text-[#17191A]">${escapeHtml(svc.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(svc.short_description || svc.summary || '')}</p>
              <div class="pt-3 border-t border-[#E1E0DD] flex items-center justify-between text-xs text-[#5D5E5F]">
                <span>Consultation fee: <strong class="text-[#17645F] font-semibold">${svc.show_price ? (svc.price_amount > 0 ? `${escapeHtml(svc.price_currency || 'NGN')} ${Number(svc.price_amount).toLocaleString()}` : 'Free') : 'On Request'}</strong></span>
              </div>
            </div>
          </a>`
            )
            .join('')}
        </div>
      </div>` : ''}

      <!-- Related questions -->
      ${
        faqs.length > 0
          ? `<div class="space-y-5 reveal">
        <h2 class="display text-[length:var(--fs-h3)]">Related questions</h2>
        <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
          ${faqs
            .slice(0, 4)
            .map((faq, idx) => {
              const pid = `svc-faq-${service.slug}-${idx}`;
              return `<div class="faq-item py-4" data-open="false">
            <button type="button" class="w-full flex items-center justify-between gap-4 text-left min-h-[44px]" aria-expanded="false" aria-controls="${pid}" data-faq-trigger>
              <span class="font-display text-lg text-[#17191A]">${escapeHtml(faq.question)}</span>
              <span class="faq-plus shrink-0 w-8 h-8 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center"><i data-lucide="plus" class="w-4 h-4"></i></span>
            </button>
            <div id="${pid}" class="faq-panel"><div class="faq-panel-inner"><p class="pt-3 text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(faq.answer)}</p></div></div>
          </div>`;
            })
            .join('')}
        </div>
      </div>`
          : ''
      }
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings, services })}`;
}
