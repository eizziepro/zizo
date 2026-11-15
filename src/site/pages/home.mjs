import {
  escapeHtml,
  pictureTag,
  renderClosingCta,
  renderFooter,
  renderHead,
  renderHeader,
} from '../partials/layout.mjs';

function isConfirmedStat(val) {
  if (!val) return false;
  const s = String(val).trim();
  return s.length > 0 && !s.startsWith('{{');
}

export function renderHomePage({ settings = {}, homeFaqs = [], reviews = [], posts = [], siteUrl = '' }) {
  const stats = [
    { value: settings.stats_experience || '12+ years', label: 'Reproductive and women’s health experience' },
    { value: settings.stats_families_helped, label: 'Families supported across borders' },
    { value: settings.stats_regions || '5 regions', label: 'Nigeria, Europe, Asia, Canada and the United States' },
    { value: settings.stats_support_24_7, label: 'Dedicated case-manager support' },
  ].filter((s) => isConfirmedStat(s.value));

  const gridColsClass =
    stats.length === 4
      ? 'md:grid-cols-4'
      : stats.length === 3
        ? 'md:grid-cols-3'
        : stats.length === 2
          ? 'md:grid-cols-2'
          : 'md:grid-cols-1';

  const whatsappRaw = String(settings.whatsapp_number || '{{WHATSAPP_NUMBER}}');
  const whatsappClean = whatsappRaw.replace(/[^\d]/g, '');
  const whatsappHref = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hello Zizo Donor and Surrogacy, I would like to learn more about starting my journey.')}`
    : '/contact/';

  const approvedCount = reviews.length;
  const avgRating =
    approvedCount >= 5
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / approvedCount).toFixed(1)
      : null;

  const featuredReviews = reviews.filter((r) => r.featured).length > 0
    ? reviews.filter((r) => r.featured)
    : reviews;

  const orgJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Zizo Donor and Surrogacy',
      alternateName: 'Zizo Surrogacy',
      url: siteUrl || 'https://zizodonorandsurrogacy.com',
      description:
        'A safe fertility brand that creates families across borders, with expert legal and medical coordination and compassionate, personal care at every step.',
      areaServed: ['Nigeria', 'Europe', 'Asia', 'Canada', 'United States'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Zizo Donor and Surrogacy',
      url: siteUrl || 'https://zizodonorandsurrogacy.com',
    },
  ];

  const head = renderHead({
    title: 'Zizo Donor and Surrogacy — A safe fertility brand that creates families across borders',
    description:
      'Confidential surrogacy, anonymous ovum donation, personalized matching, and counseling coordination from Lagos across Nigeria, Europe, Asia, Canada, and the United States.',
    canonicalPath: '/',
    preloadHero: true,
    jsonLd: orgJsonLd,
    siteUrl,
  });

  const header = renderHeader({ isHome: true });

  const sectors = [
    { label: 'Nigeria', href: '/intended-parents/programs-by-country/#nigeria' },
    { label: 'Europe', href: '/intended-parents/programs-by-country/#europe' },
    { label: 'Asia', href: '/intended-parents/programs-by-country/#asia' },
    { label: 'Canada', href: '/intended-parents/programs-by-country/#canada' },
    { label: 'United States', href: '/intended-parents/programs-by-country/#united-states' },
    { label: 'Cross-border', href: '/intended-parents/programs-by-country/#cross-border' },
  ];

  const whyRows = [
    {
      num: '01',
      title: 'Global Reach, Local Care',
      desc: 'Grounded in Lagos with coordinated pathways across Nigeria, Europe, Asia, Canada, and the United States, tailored to where your family is growing.',
      href: '/intended-parents/programs-by-country/',
    },
    {
      num: '02',
      title: 'Expert Legal and Medical Coordination',
      desc: 'Every clinical milestone and independent legal agreement is structured in sequence so intended parents and surrogates move forward with clarity.',
      href: '/intended-parents/legal-and-ethics/',
    },
    {
      num: '03',
      title: 'Personalized Guidance',
      desc: 'One dedicated care coordinator guides your conversations from initial consultation through matching, pregnancy, and homecoming planning.',
      href: '/intended-parents/how-it-works/',
    },
    {
      num: '04',
      title: 'Ethical, Transparent Practices',
      desc: 'Strict anonymity standards, clear compensation structures, and thorough screening protect the dignity of donors, surrogates, and intended parents.',
      href: '/intended-parents/legal-and-ethics/',
    },
    {
      num: '05',
      title: 'Emotional Management',
      desc: 'Confidential counseling support accompanies intended parents, egg donors, and gestational carriers before, during, and after each stage.',
      href: '/services/counseling-ivf-support/',
    },
  ];

  const processSteps = [
    {
      step: '1',
      icon: 'message-square',
      title: 'Consultation',
      headline: 'Private discovery and customized family strategy',
      duration: 'Week 1 · 1 to 2 Weeks',
      copy: 'Speak privately with our clinical and legal coordination team about your family goals, medical history, budget, and cross-border options.',
      safeguards: [
        'Confidential 1-on-1 strategy session with a senior case director',
        'Transparent breakdown of clinical timelines and total package costs',
        'Direct preliminary review for cross-border parentage recognition',
      ],
      highlightBadge: 'Initial Strategy',
      highlightMetric: '100% Confidential',
      highlightDetail: 'Private consultation assessing your family building path with no upfront obligation.',
    },
    {
      step: '2',
      icon: 'users',
      title: 'Matching',
      headline: 'Thoroughly screened surrogates & profiled donors',
      duration: 'Month 1–2 · 4 to 8 Weeks',
      copy: 'Review carefully screened, anonymized profiles aligned with your cultural values, medical considerations, and personal preferences.',
      safeguards: [
        'Multi-stage psychological, medical, and background evaluations',
        'Bespoke compatibility matching based on health records and values',
        'Strict anonymous matching protocol protecting mutual dignity and privacy',
      ],
      highlightBadge: 'Screened Profiles',
      highlightMetric: 'Clinical Vetting',
      highlightDetail: 'Only medically cleared candidates with proven health records and psychological readiness.',
    },
    {
      step: '3',
      icon: 'scale',
      title: 'Medical & Legal Coordination',
      headline: 'Dual legal counsel and synchronized clinic protocols',
      duration: 'Month 2–3 · 3 to 6 Weeks',
      copy: 'Complete clinic evaluations and independent legal agreements before cycles begin, protecting both intended parents and surrogates.',
      safeguards: [
        'Independent legal representation for intended parents and surrogates',
        'Secure escrow management for all medical disbursements and living allowances',
        'Direct IVF clinic liaison and laboratory synchronization',
      ],
      highlightBadge: 'Escrow Protected',
      highlightMetric: 'Dual Legal Counsel',
      highlightDetail: 'Binding cross-border contracts executed in full compliance before any embryo transfer.',
    },
    {
      step: '4',
      icon: 'heart-pulse',
      title: 'Pregnancy & Support',
      headline: 'Continuous obstetric care and 24/7 case management',
      duration: 'Month 4–12 · Full Term',
      copy: 'Receive steady case-manager updates, obstetric coordination, milestone ultrasounds, and dedicated counseling care throughout gestation.',
      safeguards: [
        'Dedicated personal case manager providing scheduled milestone updates',
        'Top-tier obstetric appointments, detailed ultrasound reports, and nutrition care',
        'Ongoing emotional, nutritional, and psychological support for the surrogate',
      ],
      highlightBadge: 'Continuous Care',
      highlightMetric: '24/7 Case Oversight',
      highlightDetail: 'Direct access to your coordinator with documented milestone tracking throughout pregnancy.',
    },
    {
      step: '5',
      icon: 'baby',
      title: 'Birth & Parentage',
      headline: 'Hospital delivery and post-birth travel documentation',
      duration: 'Delivery · Hospital Discharge',
      copy: 'Prepare hospital and post-birth documentation smoothly as you welcome your child and prepare for safe departure.',
      safeguards: [
        'Coordinated hospital delivery protocols with private room accommodation',
        'Expedited consular paperwork, legal parentage orders, and birth registration',
        'Seamless departure coordination to return home safely with your newborn',
      ],
      highlightBadge: 'Global Recognition',
      highlightMetric: 'Parentage Secured',
      highlightDetail: 'Comprehensive legal documentation and passport processing coordinated for your child.',
    },
  ];

  return `${head}
${header}
<main id="main-content">
  <!-- SECTION 1: HERO -->
  <section class="relative min-h-[var(--hero-min-height)] lg:min-h-[90svh] flex items-end overflow-hidden bg-[#17191A]">
    <div id="hero-media" class="absolute inset-0 scale-[1.03] will-change-transform">
      ${pictureTag({
        base: 'hero-family',
        alt: 'A joyful Nigerian American mother and father seated together on a warm cream sofa, holding their newborn wrapped in a neutral woven blanket',
        width: 1920,
        height: 1080,
        className: 'w-full h-full object-cover object-center',
        eager: true,
        sizes: '100vw',
      })}
      <div class="hero-gradient-overlay absolute inset-0" aria-hidden="true"></div>
    </div>

    <div class="zizo-container relative z-10 pt-32 pb-[var(--space-lg)]">
      <div class="max-w-2xl lg:max-w-3xl space-y-5 text-[#FAF9F6]">
        <p class="hero-enter hero-delay-1 text-[length:var(--fs-small)] uppercase tracking-[0.14em] text-[#FAF9F6]/85">
          Donor and Surrogacy · Lagos, Nigeria
        </p>
        <h1 class="hero-enter hero-delay-2 display text-[#FAF9F6] max-w-3xl">
          Every family deserves a path to parenthood.
        </h1>
        <p class="hero-enter hero-delay-3 text-[length:var(--fs-body)] text-[#FAF9F6]/90 max-w-xl leading-relaxed">
          A safe fertility brand that creates families across borders, with expert legal and medical coordination and compassionate, personal care at every step.
        </p>
        <div class="hero-enter hero-delay-4 flex items-center gap-3 flex-wrap sm:flex-nowrap pt-1">
          <a href="/book/" class="btn-primary">Book Consultation</a>
          <a href="/surrogates-donors/become-a-surrogate/" class="btn-secondary-light">Become Surrogate</a>
        </div>
        <p class="hero-enter hero-delay-4 inline-flex items-center gap-2 text-[length:var(--fs-small)] text-[#FAF9F6]/80 pt-1">
          <i data-lucide="shield-check" class="w-4 h-4 text-[#8BB2AF] shrink-0"></i>
          <span>Confidential. Ethical. Anonymous matching.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- SECTION 2: TRUST STATS & PROGRAMS STRIP -->
  <section class="bg-[#FAF9F6] border-b border-[#E1E0DD]">
    <div class="zizo-container">
      <div class="grid grid-cols-1 ${gridColsClass} divide-y md:divide-y-0 md:divide-x divide-[#E1E0DD]">
        ${stats
          .map(
            (s) => `<div class="py-8 md:px-6 first:md:pl-0 last:md:pr-0 reveal">
          <p class="font-display text-[length:var(--fs-h2)] font-medium text-[#17191A] tabular-nums leading-tight mb-1">${escapeHtml(s.value)}</p>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">${escapeHtml(s.label)}</p>
        </div>`
          )
          .join('')}
      </div>
    </div>
    <div class="border-t border-[#E1E0DD]">
      <div class="zizo-container py-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          ${sectors
            .map(
              (sec) => `<a href="${escapeHtml(sec.href)}" class="bg-[#E1E0DD] hover:bg-[#d5d4d0] text-[#454748] text-center text-[length:var(--fs-small)] font-medium py-3 px-3 rounded-[var(--radius)] transition-colors whitespace-nowrap">
            ${escapeHtml(sec.label)}
          </a>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 3: CORE SERVICES -->
  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-md)]">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F] mb-2">Core Services</p>
          <h2 class="display">Thoughtful fertility coordination</h2>
        </div>
        <a href="/services/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4">Explore all services</a>
      </div>

      <!-- 01 / 04 Full width -->
      <a href="/services/surrogacy/" class="group block relative aspect-[16/10] rounded-[var(--radius)] overflow-hidden bg-[#17191A] reveal">
        <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
          ${pictureTag({
            base: 'service-surrogacy',
            alt: 'Expectant woman resting calmly in a sunlit Lagos home interior',
            width: 1920,
            height: 1080,
          })}
        </div>
        <div class="card-charcoal-scrim absolute inset-0"></div>
        <div class="absolute inset-0 p-[var(--space-md)] flex flex-col justify-between text-[#FAF9F6]">
          <div class="flex items-start justify-between">
            <span class="text-[length:var(--fs-small)] font-medium tabular-nums text-[#FAF9F6]/85">01 / 04</span>
            <span class="w-11 h-11 rounded-full bg-[#FAF9F6] text-[#17191A] inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
            </span>
          </div>
          <div class="max-w-xl">
            <h3 class="display text-[#FAF9F6] mb-1.5">Surrogacy</h3>
            <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/85">Surrogates are carefully selected through thorough psychological, medical, and background evaluations.</p>
          </div>
        </div>
      </a>

      <!-- Split 7 / 5 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-md)]">
        <a href="/services/ovum-donation/" class="lg:col-span-7 group block relative aspect-[4/3] rounded-[var(--radius)] overflow-hidden bg-[#17191A] reveal">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
            ${pictureTag({
              base: 'service-ovum-donation',
              alt: 'Coordinator speaking privately with a prospective egg donor in natural morning light',
              width: 1920,
              height: 1440,
            })}
          </div>
          <div class="card-charcoal-scrim absolute inset-0"></div>
          <div class="absolute inset-0 p-[var(--space-md)] flex flex-col justify-between text-[#FAF9F6]">
            <div class="flex items-start justify-between">
              <span class="text-[length:var(--fs-small)] font-medium tabular-nums text-[#FAF9F6]/85">02</span>
              <span class="w-11 h-11 rounded-full bg-[#FAF9F6] text-[#17191A] inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
              </span>
            </div>
            <div class="max-w-md">
              <h3 class="display text-[#FAF9F6] mb-1.5">Ovum Donation</h3>
              <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/85">Egg donors are thoroughly screened and anonymously profiled with medical and emotional care.</p>
            </div>
          </div>
        </a>

        <a href="/services/personalized-matching/" class="lg:col-span-5 group block relative aspect-[4/3] lg:aspect-auto lg:min-h-full rounded-[var(--radius)] overflow-hidden bg-[#17191A] reveal">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
            ${pictureTag({
              base: 'service-matching',
              alt: 'Care coordinator reviewing an anonymized matching folder with an African couple',
              width: 1920,
              height: 1440,
            })}
          </div>
          <div class="card-charcoal-scrim absolute inset-0"></div>
          <div class="absolute inset-0 p-[var(--space-md)] flex flex-col justify-between text-[#FAF9F6]">
            <div class="flex items-start justify-between">
              <span class="text-[length:var(--fs-small)] font-medium tabular-nums text-[#FAF9F6]/85">03</span>
              <span class="w-11 h-11 rounded-full bg-[#FAF9F6] text-[#17191A] inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
              </span>
            </div>
            <div>
              <h3 class="display text-[#FAF9F6] mb-1.5">Personalized Matching</h3>
              <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/85">Bespoke matching guided by compatibility, cultural preferences, and medical history.</p>
            </div>
          </div>
        </a>
      </div>

      <!-- 04 Banner 21/9 -->
      <a href="/services/counseling-ivf-support/" class="group block relative aspect-[16/10] md:aspect-[21/9] rounded-[var(--radius)] overflow-hidden bg-[#17191A] reveal">
        <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
          ${pictureTag({
            base: 'service-counseling',
            alt: 'Couple seated together in a private, warm counseling session',
            width: 1920,
            height: 1080,
          })}
        </div>
        <div class="card-charcoal-scrim absolute inset-0"></div>
        <div class="absolute inset-0 p-[var(--space-md)] flex flex-col justify-between text-[#FAF9F6]">
          <div class="flex items-start justify-between">
            <span class="text-[length:var(--fs-small)] font-medium tabular-nums text-[#FAF9F6]/85">04</span>
            <span class="w-11 h-11 rounded-full bg-[#FAF9F6] text-[#17191A] inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
            </span>
          </div>
          <div class="max-w-2xl">
            <h3 class="display text-[#FAF9F6] mb-1.5">Counseling and IVF Support</h3>
            <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/85">Dedicated counseling and cycle coordination supporting intended parents, egg donors, and surrogates.</p>
          </div>
        </div>
      </a>
    </div>
  </section>

  <!-- SECTION 4: WHY ZIZO -->
  <section class="zizo-section bg-[#FAF9F6] border-t border-[#E1E0DD]">
    <div class="zizo-container">
      <div class="max-w-2xl mb-[var(--space-lg)] reveal">
        <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F] mb-2">Why Zizo</p>
        <h2 class="display">Built on discretion, clinical rigour, and personal warmth</h2>
      </div>

      <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
        ${whyRows
          .map(
            (row) => `<a href="${escapeHtml(row.href)}" class="group block py-7 rounded-[var(--radius)] hover:bg-[#E1E0DD]/40 transition-colors reveal">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <span class="md:col-span-1 text-[length:var(--fs-small)] font-medium tabular-nums text-[#5D5E5F]">${row.num}</span>
            <h3 class="md:col-span-4 display text-[#17191A]">${escapeHtml(row.title)}</h3>
            <p class="md:col-span-6 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(row.desc)}</p>
            <div class="md:col-span-1 flex md:justify-end">
              <i data-lucide="move-up-right" class="w-5 h-5 text-[#17191A] group-hover:text-[#17645F] transition-colors"></i>
            </div>
          </div>
        </a>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- SECTION 5: PROCESS (INTERACTIVE STAGE SPOTLIGHT) -->
  <section class="zizo-section bg-[#E1E0DD] text-[#17191A] relative">
    <div class="zizo-container space-y-[var(--space-md)]">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 reveal">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.14em] text-[#5D5E5F] font-medium mb-2">How It Works</p>
          <h2 class="display !text-[#12504C] text-[length:var(--fs-h2)]">A clear route to parenthood</h2>
          <p class="mt-2 text-[length:var(--fs-body)] text-[#2E3031]">Five transparent, physician-coordinated phases designed to protect every intended parent, donor, and surrogate.</p>
        </div>
        <a href="/intended-parents/how-it-works/" class="group inline-flex items-center gap-2 text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:text-[#12504C] shrink-0">
          <span>Learn more about the process</span>
          <i data-lucide="arrow-right" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"></i>
        </a>
      </div>

      <!-- Interactive Stage Spotlight Container -->
      <div class="reveal space-y-0">
        <!-- Stage Tabs Header -->
        <div role="tablist" data-process-tablist aria-label="Surrogacy and donor journey stages" class="flex items-center gap-1.5 overflow-x-auto pb-0 border-b border-[#C8C7C3] scrollbar-none">
          ${processSteps
            .map(
              (st, idx) => `<button
            type="button"
            role="tab"
            id="stage-tab-${idx}"
            aria-selected="${idx === 0 ? 'true' : 'false'}"
            aria-controls="stage-panel-${idx}"
            data-stage-tab="${idx}"
            tabindex="${idx === 0 ? '0' : '-1'}"
            class="stage-tab group relative px-4 sm:px-5 py-3.5 rounded-t-xl transition-all duration-200 flex items-center gap-2.5 shrink-0 whitespace-nowrap text-left ${
              idx === 0
                ? 'bg-[#FAF9F6] text-[#12504C] font-semibold shadow-sm border-t-2 border-t-[#17645F] border-x border-[#E1E0DD]'
                : 'text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#FAF9F6]/50'
            }"
          >
            <span class="stage-tab-badge w-6 h-6 rounded-full flex items-center justify-center text-xs tabular-nums font-semibold transition-colors ${
              idx === 0 ? 'bg-[#17645F] text-[#FAF9F6]' : 'bg-[#8BB2AF]/30 text-[#17191A]'
            }">
              0${st.step}
            </span>
            <span class="text-xs sm:text-sm tracking-tight">${escapeHtml(st.title)}</span>
          </button>`
            )
            .join('')}
        </div>

        <!-- Stage Spotlight Panels -->
        <div class="relative bg-[#FAF9F6] border-x border-b border-[#E1E0DD] rounded-b-2xl shadow-sm overflow-hidden">
          ${processSteps
            .map(
              (st, idx) => `<div
            role="tabpanel"
            id="stage-panel-${idx}"
            aria-labelledby="stage-tab-${idx}"
            data-stage-panel="${idx}"
            class="stage-panel p-6 sm:p-8 lg:p-10 ${idx === 0 ? '' : 'hidden'}"
          >
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <!-- Left: Editorial Guidance & Safeguards -->
              <div class="lg:col-span-7 space-y-5">
                <div class="flex flex-wrap items-center gap-2.5">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8BB2AF]/25 text-[#12504C] text-xs font-semibold uppercase tracking-wider tabular-nums">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#17645F]"></span>
                    Phase 0${st.step} of 05
                  </span>
                  <span class="px-3 py-1 rounded-full bg-[#E1E0DD] text-[#5D5E5F] text-xs font-medium">${escapeHtml(st.duration)}</span>
                </div>

                <div class="space-y-2">
                  <h3 class="display text-[length:var(--fs-h2)] leading-tight text-[#17191A]">${escapeHtml(st.headline)}</h3>
                  <p class="text-[length:var(--fs-body)] text-[#2E3031] leading-relaxed max-w-2xl">${escapeHtml(st.copy)}</p>
                </div>

                <div class="pt-2 space-y-2.5">
                  <p class="text-xs font-semibold uppercase tracking-wider text-[#5D5E5F]">Key Safeguards in this Stage:</p>
                  <ul class="space-y-2 text-[length:var(--fs-small)] text-[#2E3031]">
                    ${st.safeguards
                      .map(
                        (item) => `<li class="flex items-start gap-2.5">
                      <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                      <span>${escapeHtml(item)}</span>
                    </li>`
                      )
                      .join('')}
                  </ul>
                </div>

                <div class="pt-3 flex flex-wrap items-center gap-4 border-t border-[#E1E0DD]">
                  <a href="/book/" class="btn-primary !py-2.5 !px-4 text-xs sm:text-sm">Start with Consultation</a>
                  <a href="/intended-parents/how-it-works/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4 inline-flex items-center gap-1.5">
                    <span>Full process guide</span>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </a>
                </div>
              </div>

              <!-- Right: Bento Spotlight Card -->
              <div class="lg:col-span-5">
                <div class="bg-[#FAF9F6] border border-[#E1E0DD] rounded-2xl p-6 sm:p-7 space-y-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-[#FAF9F6] to-[#E1E0DD]/40">
                  <div class="flex items-center justify-between">
                    <span class="text-xs uppercase tracking-wider font-semibold text-[#12504C] bg-[#8BB2AF]/25 px-3 py-1 rounded-full">${escapeHtml(st.highlightBadge)}</span>
                    <div class="w-10 h-10 rounded-full bg-[#17645F] text-[#FAF9F6] flex items-center justify-center shadow-sm">
                      <i data-lucide="${st.icon}" class="w-5 h-5"></i>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <div class="font-display text-2xl font-medium text-[#17191A]">${escapeHtml(st.highlightMetric)}</div>
                    <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">${escapeHtml(st.highlightDetail)}</p>
                  </div>

                  <div class="pt-4 border-t border-[#E1E0DD] flex items-center gap-2.5 text-xs text-[#2E3031]">
                    <i data-lucide="shield-check" class="w-4 h-4 text-[#17645F] shrink-0"></i>
                    <span>Physician &amp; attorney coordinated at every milestone.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- Action & Reassurance Strip -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#8BB2AF]/30 reveal">
        <div class="flex items-center gap-3">
          <a href="/book/" class="btn-primary group inline-flex items-center gap-2">
            <span>Start Your Journey</span>
            <i data-lucide="arrow-right" class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"></i>
          </a>
        </div>
        <div class="flex items-center gap-2 text-[length:var(--fs-small)] text-[#5D5E5F]">
          <i data-lucide="shield-check" class="w-4 h-4 text-[#17645F] shrink-0"></i>
          <span>Confidential initial intake · No obligation · Global matching</span>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 6: REVIEWS AND TESTIMONIALS -->
  <section class="zizo-section bg-[#17191A] text-[#FAF9F6] surface-dark" id="reviews-section">
    <div class="zizo-container space-y-[var(--space-md)]">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#8BB2AF] mb-2">Stories &amp; Reflections</p>
          <h2 class="display text-[#FAF9F6]">Words from parents and surrogates</h2>
          ${
            avgRating
              ? `<p class="mt-2 text-[length:var(--fs-small)] text-[#FAF9F6]/80 tabular-nums">${avgRating} out of 5 across ${approvedCount} approved reviews</p>`
              : ''
          }
        </div>
        <div class="flex items-center gap-3">
          <button type="button" id="reviews-prev" aria-label="Previous testimonials" class="w-11 h-11 rounded-full border border-[#FAF9F6]/30 hover:bg-[#FAF9F6]/10 inline-flex items-center justify-center text-[#FAF9F6] transition-colors">
            <i data-lucide="chevron-left" class="w-5 h-5"></i>
          </button>
          <button type="button" id="reviews-next" aria-label="Next testimonials" class="w-11 h-11 rounded-full border border-[#FAF9F6]/30 hover:bg-[#FAF9F6]/10 inline-flex items-center justify-center text-[#FAF9F6] transition-colors">
            <i data-lucide="chevron-right" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <div id="reviews-carousel" class="grid grid-cols-1 md:grid-cols-3 gap-6 reveal" tabindex="0" aria-roledescription="carousel" aria-label="Parent and surrogate testimonials">
        ${featuredReviews
          .slice(0, 3)
          .map((rev) => {
            const initials = escapeHtml(
              String(rev.display_name || 'P')
                .replace(/[^A-Za-z]/g, '')
                .slice(0, 2)
                .toUpperCase() || 'Z'
            );
            return `<article class="bg-[#FAF9F6]/5 border border-[#FAF9F6]/15 rounded-[var(--radius)] p-6 flex flex-col justify-between gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <i data-lucide="quote" class="w-6 h-6 text-[#8BB2AF]"></i>
              <span class="text-xs text-[#FAF9F6]/70">${escapeHtml(rev.role)}${rev.verified ? ' · Verified client' : ''}</span>
            </div>
            <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/90 leading-relaxed">“${escapeHtml(rev.body)}”</p>
          </div>
          <div class="flex items-center gap-3 pt-2 border-t border-[#FAF9F6]/10">
            <span class="w-10 h-10 rounded-full bg-[#8BB2AF] text-[#17191A] font-semibold text-xs inline-flex items-center justify-center shrink-0">${initials}</span>
            <div>
              <p class="font-medium text-[length:var(--fs-small)] text-[#FAF9F6]">${escapeHtml(rev.display_name)}</p>
              ${rev.country ? `<p class="text-xs text-[#FAF9F6]/70">${escapeHtml(rev.country)}</p>` : ''}
            </div>
          </div>
        </article>`;
          })
          .join('')}
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 pt-2 reveal">
        <a href="/resources/stories-and-reviews/" class="text-[length:var(--fs-small)] text-[#FAF9F6]/85 hover:text-[#FAF9F6] underline underline-offset-4">Read all stories and reviews</a>
        <a href="/resources/stories-and-reviews/#write-a-review" class="text-[length:var(--fs-small)] text-[#FAF9F6]/85 hover:text-[#FAF9F6] underline underline-offset-4">Share your experience</a>
      </div>
    </div>
  </section>

  <!-- SECTION 7: SURROGATE AND DONOR BAND -->
  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-center">
        <div class="lg:col-span-6 group rounded-[var(--radius)] overflow-hidden aspect-[4/3] bg-[#E1E0DD] reveal">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.03]">
            ${pictureTag({
              base: 'become-a-surrogate',
              alt: 'Warm portrait of a Nigerian woman seated in natural daylight',
              width: 1920,
              height: 1440,
            })}
          </div>
        </div>

        <div class="lg:col-span-6 space-y-5 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Join our community</p>
          <h2 class="display">Interested in becoming a surrogate?</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">
            At Zizo, gestational surrogates and egg donors are valued, deeply respected, transparently compensated, and supported with dedicated case management and medical care. Your privacy and anonymity are safeguarded at every step.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <a href="/surrogates-donors/become-a-surrogate/" class="btn-primary">Become Surrogate</a>
            <a href="/surrogates-donors/become-an-egg-donor/" class="btn-secondary">Become an Egg Donor</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 8: FROM THE BLOG -->
  <section class="zizo-section bg-[#FAF9F6] border-t border-[#E1E0DD]">
    <div class="zizo-container space-y-[var(--space-md)]">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 reveal">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F] mb-2">From the Journal</p>
          <h2 class="display">Guidance for your family journey</h2>
        </div>
        <a href="/resources/blog/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4">Read all articles</a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${posts
          .slice(0, 3)
          .map(
            (post) => `<article class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] flex flex-col justify-between reveal">
          <a href="/resources/blog/${escapeHtml(post.slug)}/" class="block aspect-[16/10] bg-[#E1E0DD] overflow-hidden">
            <img src="${escapeHtml(post.featured_image_url || '/assets/img/blog-default-1920w.webp')}" alt="${escapeHtml(post.featured_image_alt || post.title)}" width="1200" height="750" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </a>
          <div class="p-6 flex-1 flex flex-col justify-between gap-4">
            <div class="space-y-2.5">
              <div class="flex items-center gap-2 text-xs text-[#5D5E5F]">
                <span>${escapeHtml(post.category_name || 'Guide')}</span>
                <span aria-hidden="true">·</span>
                <span>${Number(post.reading_minutes || 3)} min read</span>
              </div>
              <h3 class="display text-[length:var(--fs-h3)]">
                <a href="/resources/blog/${escapeHtml(post.slug)}/" class="hover:text-[#17645F] transition-colors">${escapeHtml(post.title)}</a>
              </h3>
              <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(post.excerpt)}</p>
            </div>
            <a href="/resources/blog/${escapeHtml(post.slug)}/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4">Read article</a>
          </div>
        </article>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- SECTION 9: FAQ -->
  <section class="zizo-section bg-[#FAF9F6] border-t border-[#E1E0DD]">
    <div class="zizo-container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)]">
        <div class="lg:col-span-4 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Questions &amp; Answers</p>
          <h2 class="display">Common questions, answered clearly</h2>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Information shared here is general guidance and not medical or legal advice.</p>
          <a href="/resources/faq/" class="inline-block text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline underline-offset-4">See all FAQs</a>
        </div>

        <div class="lg:col-span-8 divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
          ${homeFaqs
            .slice(0, 6)
            .map((faq, idx) => {
              const panelId = `home-faq-${idx}`;
              return `<div class="faq-item py-5" data-open="false">
            <button type="button" class="w-full flex items-center justify-between gap-4 text-left font-medium text-[length:var(--fs-body)] text-[#17191A] min-h-[44px]" aria-expanded="false" aria-controls="${panelId}" data-faq-trigger>
              <span class="font-display text-[length:var(--fs-h3)] font-medium">${escapeHtml(faq.question)}</span>
              <span class="faq-plus shrink-0 w-8 h-8 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center text-[#17191A]" aria-hidden="true">
                <i data-lucide="plus" class="w-4 h-4"></i>
              </span>
            </button>
            <div id="${panelId}" class="faq-panel">
              <div class="faq-panel-inner">
                <p class="pt-3 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(faq.answer)}</p>
              </div>
            </div>
          </div>`;
            })
            .join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 10: CONTACT CTA -->
  ${renderClosingCta({ whatsappHref })}
</main>
${renderFooter({ settings })}
`;
}
