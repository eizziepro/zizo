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
    title: 'About Zizo Donor and Surrogacy | Lagos & Cross-Border Care',
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
    title: 'Safe fertility care, built on trust.',
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
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Ethical Protection
              </span>
              <span class="text-xs font-semibold text-[#8BB2AF] tracking-widest uppercase">Pillar 01</span>
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
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Physician-Led
              </span>
              <span class="text-xs font-semibold text-[#8BB2AF] tracking-widest uppercase">Pillar 02</span>
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
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="globe" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Global Compliance
              </span>
              <span class="text-xs font-semibold text-[#8BB2AF] tracking-widest uppercase">Pillar 03</span>
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
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
                <i data-lucide="heart-handshake" class="w-3.5 h-3.5 text-[#17645F]"></i>
                Direct Stewardship
              </span>
              <span class="text-xs font-semibold text-[#8BB2AF] tracking-widest uppercase">Pillar 04</span>
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

export const SERVICE_DEFINITIONS = [
  {
    slug: 'surrogacy',
    index: '01 / 04',
    title: 'Surrogacy',
    imageBase: 'service-surrogacy',
    imageAlt: 'Expectant woman resting comfortably in a sunlit modern Lagos home',
    summary:
      'Surrogates are carefully selected through thorough psychological, medical, and background evaluations, supported by dedicated case management throughout pregnancy.',
    intro:
      'Structured gestational surrogacy coordination connecting intended parents with thoroughly screened carriers and independent legal and clinical teams.',
    whoFor: [
      'Individuals and couples seeking gestational surrogacy coordination in Nigeria or across international partner programmes',
      'Single intended parents and diaspora families needing steady local and cross-border coordination',
    ],
    included: [
      'Private initial consultation and programme pathway planning',
      'Carefully vetted gestational surrogate selection and anonymized profile presentation',
      'Coordination of medical and psychological screening appointments with partner clinics',
      'Introductions to independent reproductive legal counsel prior to matching agreements',
      'Dedicated case-manager support throughout pregnancy and birth planning',
    ],
    screening:
      'Prospective gestational surrogates complete multi-stage health history checks, obstetric review, infectious disease screening, psychological assessment, and background verification before entering matching.',
  },
  {
    slug: 'ovum-donation',
    index: '02',
    title: 'Ovum Donation',
    imageBase: 'service-ovum-donation',
    imageAlt: 'Care coordinator speaking softly with a prospective egg donor in a private consultation room',
    summary:
      'Egg donors are thoroughly screened and anonymously profiled, combining careful medical standards with warm donor care.',
    intro:
      'Confidential, anonymous ovum donation coordination centred on thorough clinical screening, informed consent, and donor wellbeing.',
    whoFor: [
      'Intended parents requiring donor eggs alongside IVF or surrogacy treatment',
      'Healthy women considering anonymous egg donation with transparent medical care',
    ],
    included: [
      'Curated, non-identifying donor profiles detailing health history and compatibility traits',
      'Comprehensive ovarian reserve, genetic, and infectious disease screening at partner clinics',
      'Independent counseling before and during the stimulation cycle',
      'Synchronised cycle scheduling with your chosen fertility clinic',
    ],
    screening:
      'Every prospective egg donor undergoes clinical fertility testing, family medical history review, psychological evaluation, and confidential counselor sign-off. Identifying details are never shared.',
  },
  {
    slug: 'personalized-matching',
    index: '03',
    title: 'Personalized Matching',
    imageBase: 'service-matching',
    imageAlt: 'Care coordinator reviewing a matching folder with a couple across an oak table',
    summary:
      'Bespoke matching grounded in compatibility, cultural preferences, and medical history—guided with complete discretion.',
    intro:
      'Unhurried, human-led matching between intended parents, egg donors, and gestational surrogates with anonymity protected at every stage.',
    whoFor: [
      'Intended parents seeking thoughtful alignment on values, background, and communication preferences',
      'Gestational surrogates who want clear expectations and mutual comfort before committing',
    ],
    included: [
      'In-depth preference intake covering medical criteria, cultural context, and communication style',
      'Anonymized profile presentation without rushing or high-pressure timelines',
      'Facilitated Q&A or mediated introduction calls where appropriate and mutually agreed',
      'Structured transition into independent legal review once a match is confirmed',
    ],
    screening:
      'Matching begins only after preliminary medical and psychological clearances are complete, ensuring every profile presented is clinically ready and mutually informed.',
  },
  {
    slug: 'counseling-ivf-support',
    index: '04',
    title: 'Counseling and IVF Support',
    imageBase: 'service-counseling',
    imageAlt: 'Couple holding hands during a calm counseling conversation in natural window light',
    summary:
      'Dedicated emotional management and IVF cycle coordination for intended parents, donors, and surrogates.',
    intro:
      'Compassionate counseling and practical IVF cycle coordination supporting every participant emotionally and logistically.',
    whoFor: [
      'Intended parents navigating emotional uncertainty, cross-border travel, or donor-conception decisions',
      'Surrogates and egg donors preparing for screening, embryo transfer, pregnancy, or postpartum transitions',
    ],
    included: [
      'Confidential pre-treatment and implications counseling referrals',
      'Dedicated case-manager check-ins across stimulation, transfer, and pregnancy milestones',
      'Clear appointment coordination between intended parents and partner fertility clinics',
      'Post-birth emotional check-ins and continuity support',
    ],
    screening:
      'Qualified mental health and fertility counselors conduct private readiness sessions tailored to each role—supporting informed consent and calm communication.',
  },
];

export function renderServicesHub({ settings = {}, siteUrl = '' }) {
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
      'Explore Zizo services: Surrogacy, Ovum Donation, Personalized Matching, and Counseling and IVF Support.',
    canonicalPath: '/services/',
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Services' }],
    title: 'Fertility, donor, and surrogacy coordination.',
    intro:
      'Four integrated services designed around clinical rigour, legal clarity, anonymity, and steady personal care.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 md:grid-cols-2 gap-8">
      ${SERVICE_DEFINITIONS.map(
        (svc) => `<a href="/services/${svc.slug}/" class="group block border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] reveal">
        <div class="aspect-[16/10] overflow-hidden bg-[#E1E0DD]">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
            ${pictureTag({
              base: svc.imageBase,
              alt: svc.imageAlt,
              width: 1920,
              height: 1080,
            })}
          </div>
        </div>
        <div class="p-6 space-y-3">
          <div class="flex items-center justify-between text-xs text-[#5D5E5F] tabular-nums">
            <span>${svc.index}</span>
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-[#17645F]"></i>
          </div>
          <h2 class="display text-[length:var(--fs-h3)]">${escapeHtml(svc.title)}</h2>
          <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(svc.summary)}</p>
        </div>
      </a>`
      ).join('')}
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderServiceDetailPage({ service, settings = {}, faqs = [], posts = [], reviews = [], siteUrl = '' }) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.summary,
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
        { '@type': 'ListItem', position: 3, name: service.title, item: `${siteUrl}/services/${service.slug}/` },
      ],
    },
  ];

  return `${renderHead({
    title: `${service.title} | Zizo Donor and Surrogacy`,
    description: service.summary,
    canonicalPath: `/services/${service.slug}/`,
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services/' },
      { label: service.title },
    ],
    title: service.title,
    intro: service.intro,
    note: 'General information only — not medical or legal advice. Clinical care is delivered by licensed fertility clinics.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius)] overflow-hidden bg-[#E1E0DD] reveal">
        ${pictureTag({
          base: service.imageBase,
          alt: service.imageAlt,
          width: 1920,
          height: 1080,
          eager: true,
        })}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)]">
        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Overview</p>
          <h2 class="display">Who this service is for</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(service.summary)}</p>
          <ul class="space-y-3 pt-2">
            ${service.whoFor
              .map(
                (w) => `<li class="flex items-start gap-3">
              <i data-lucide="check" class="w-5 h-5 text-[#17645F] mt-0.5 shrink-0"></i>
              <span>${escapeHtml(w)}</span>
            </li>`
              )
              .join('')}
          </ul>
        </div>

        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Coordination Scope</p>
          <h2 class="display">What is included</h2>
          <ul class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
            ${service.included
              .map(
                (item) => `<li class="py-3.5 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(item)}</li>`
              )
              .join('')}
          </ul>
        </div>
      </div>

      <div class="bg-[#E1E0DD]/45 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center reveal">
        <div class="lg:col-span-8 space-y-2">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Screening &amp; Process Summary</p>
          <h2 class="display text-[length:var(--fs-h3)]">How screening works</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(service.screening)}</p>
        </div>
        <div class="lg:col-span-4 flex lg:justify-end">
          <a href="/book/" class="btn-primary">Book Consultation</a>
        </div>
      </div>

      ${
        reviews.length > 0
          ? `<div class="space-y-5 reveal">
        <h2 class="display text-[length:var(--fs-h3)]">Parent and surrogate reflections</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${reviews
            .slice(0, 3)
            .map(
              (r) => `<article class="bg-[#17191A] text-[#FAF9F6] rounded-[var(--radius)] p-6 space-y-4">
            <p class="text-[length:var(--fs-small)] text-[#FAF9F6]/90">“${escapeHtml(r.body)}”</p>
            <p class="text-xs text-[#8BB2AF] font-medium">${escapeHtml(r.display_name)} · ${escapeHtml(r.role)}</p>
          </article>`
            )
            .join('')}
        </div>
      </div>`
          : ''
      }

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
              <span class="font-display text-lg">${escapeHtml(faq.question)}</span>
              <span class="faq-plus shrink-0 w-8 h-8 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center"><i data-lucide="plus" class="w-4 h-4"></i></span>
            </button>
            <div id="${pid}" class="faq-panel"><div class="faq-panel-inner"><p class="pt-3 text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(faq.answer)}</p></div></div>
          </div>`;
            })
            .join('')}
        </div>
      </div>`
          : ''
      }

      ${
        posts.length > 0
          ? `<div class="space-y-5 reveal">
        <div class="flex items-center justify-between">
          <h2 class="display text-[length:var(--fs-h3)]">Related reading</h2>
          <a href="/resources/blog/" class="text-[length:var(--fs-small)] text-[#17645F] font-semibold hover:underline">All articles</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${posts
            .slice(0, 3)
            .map(
              (p) => `<a href="/resources/blog/${escapeHtml(p.slug)}/" class="block border border-[#E1E0DD] rounded-[var(--radius)] p-5 hover:bg-[#E1E0DD]/30 transition-colors">
            <p class="text-xs text-[#5D5E5F] mb-2">${escapeHtml(p.category_name || 'Guide')} · ${Number(p.reading_minutes || 3)} min read</p>
            <h3 class="display text-lg mb-2">${escapeHtml(p.title)}</h3>
            <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(p.excerpt)}</p>
          </a>`
            )
            .join('')}
        </div>
      </div>`
          : ''
      }
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}
