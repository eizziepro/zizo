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
        'Safe fertility brand that creates families across borders, with expert legal and medical coordination, compassionate, personal care at every step.',
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
        <p class="hero-enter hero-delay-3 text-[length:var(--fs-body)] text-[#FAF9F6]/90 max-w-3xl leading-relaxed">
          Safe fertility brand that creates families across borders, with expert legal<br class="hidden sm:inline" /> and medical coordination, compassionate, personal care at every step.
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
      <div class="max-w-2xl reveal">
        <p class="text-[length:var(--fs-small)] uppercase tracking-[0.14em] text-[#5D5E5F] font-medium mb-2">How It Works</p>
        <h2 class="display !text-[#12504C] text-[length:var(--fs-h2)]">A clear route to parenthood</h2>
        <p class="mt-2 text-[length:var(--fs-body)] text-[#2E3031]">Five transparent, physician-coordinated phases designed to protect every intended parent, donor, and surrogate.</p>
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
                  <a href="/book/" class="btn-primary">Book Consultation</a>
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
    </div>
  </section>

  <!-- SECTION 6: REVIEWS AND TESTIMONIALS (AURA.BUILD MOVING WALL) -->
  <section class="overflow-hidden bg-[#17191A] border-t border-[#FAF9F6]/10 py-24 md:py-28 relative text-[#FAF9F6] surface-dark" id="reviews-section">
    <!-- Ambient Deep Teal Glow & Grid Background -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(23,100,95,0.22),transparent_42%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,178,175,0.12),transparent_28%)]"></div>
      <div class="absolute inset-0 opacity-[0.04]" style="background-image:
        linear-gradient(rgba(250,249,246,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(250,249,246,0.08) 1px, transparent 1px);
        background-size: 72px 72px;">
      </div>
      <div class="absolute left-1/2 top-0 -translate-x-1/2 w-[850px] h-[340px] bg-[#17645F]/20 blur-[130px] rounded-full"></div>
    </div>

    <div class="z-10 max-w-[1360px] mx-auto px-6 relative">
      <!-- Section Header -->
      <div class="max-w-3xl mx-auto text-center mb-14 md:mb-16 reveal">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#FAF9F6]/15 bg-[#FAF9F6]/[0.03] text-[11px] uppercase tracking-[0.22em] text-[#8BB2AF] mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#8BB2AF] shadow-[0_0_10px_rgba(139,178,175,0.9)]"></span>
          Stories &amp; Reflections
        </div>

        <h2 class="display text-3xl md:text-5xl font-normal tracking-tight text-[#FAF9F6] mb-4">
          Words from parents and
          <span class="bg-gradient-to-r from-[#FAF9F6] via-[#8BB2AF] to-[#74A29F] bg-clip-text text-transparent">surrogates</span>
        </h2>

        <p class="text-[#FAF9F6]/75 text-sm md:text-[15px] font-light leading-relaxed max-w-2xl mx-auto">
          Genuine reflections from intended parents and gestational carriers supported through our physician-coordinated cross-border pathways.
        </p>
        ${
          avgRating
            ? `<div class="mt-3 inline-flex items-center gap-2 text-xs text-[#8BB2AF] tracking-wider uppercase font-medium">
                <span class="inline-flex text-[#8BB2AF]"><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i></span>
                <span>${avgRating} out of 5 · ${approvedCount} approved reviews</span>
              </div>`
            : ''
        }
      </div>

      <!-- Desktop Moving Wall (md:block) -->
      <div class="hidden md:block testimonial-wall-stage reveal"
        style="mask-image: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%); -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%);">
        <div class="testimonial-wall-3d grid grid-cols-2 lg:grid-cols-4 gap-5 overflow-hidden h-[780px] items-start">
          ${(() => {
            const r0 = featuredReviews[0] || {
              display_name: 'Parent AJ',
              role: 'Intended Parent',
              country: 'United Kingdom',
              rating: 5,
              body: 'From our first conversation to bringing our child home, Zizo handled every detail with warmth, discretion, and professionalism. We are forever grateful.',
              verified: 1,
            };
            const r1 = featuredReviews[1] || {
              display_name: 'Parent SS & MV',
              role: 'Intended Parent',
              country: 'United States',
              rating: 5,
              body: 'Coordinating a cross-border journey felt overwhelming until we spoke with Chizaram and the Zizo team. Every medical and legal step was explained clearly and thoughtfully.',
              verified: 1,
            };
            const r2 = featuredReviews[2] || {
              display_name: 'B.O., Surrogate Mother, Lagos',
              role: 'Surrogate',
              country: 'Nigeria',
              rating: 5,
              body: 'As a surrogate in Lagos, I felt genuinely valued and protected at every appointment. My case manager checked in thoughtfully and my privacy was respected throughout.',
              verified: 1,
            };

            function makeCard(rev, imgSrc, imgAlt, heightPx, isMobile = false) {
              const dName = escapeHtml(rev.display_name || 'Anonymous');
              const rName = escapeHtml(rev.role || 'Client');
              const loc = escapeHtml(rev.country ? `${rev.role} · ${rev.country}` : rev.role);
              const starVal = Number(rev.rating || 5).toFixed(1);
              const bText = escapeHtml(rev.body || '');

              return `
              <article class="testimonial-wall-card ${isMobile ? 'testimonial-wall-mobile-card w-[290px] sm:w-[320px] shrink-0 snap-center' : ''}" style="height: ${heightPx}px;" tabindex="0" aria-label="Review by ${dName}">
                <img class="testimonial-wall-image" src="${imgSrc}" alt="${imgAlt}" loading="lazy" decoding="async" />

                <div class="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] tracking-wider uppercase text-[#8BB2AF] font-medium">
                    <i data-lucide="quote" class="w-3 h-3 text-[#8BB2AF]"></i>
                    <span>${rName}</span>
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] text-[#FAF9F6]/90 font-medium tabular-nums">
                    <i data-lucide="star" class="w-3 h-3 text-[#8BB2AF] fill-current"></i>
                    <span>${starVal}</span>
                  </span>
                </div>

                <div class="testimonial-wall-content">
                  <p class="testimonial-wall-quote">“${bText}”</p>
                  <div class="pt-2.5 border-t border-[#FAF9F6]/15 flex items-center justify-between gap-2">
                    <div>
                      <div class="testimonial-wall-name">${dName}</div>
                      <div class="testimonial-wall-role">${loc}${rev.verified ? ' · Verified' : ''}</div>
                    </div>
                    <div class="w-7 h-7 rounded-full bg-[#8BB2AF]/20 border border-[#8BB2AF]/30 text-[#8BB2AF] flex items-center justify-center shrink-0" aria-hidden="true">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-[#8BB2AF]"></i>
                    </div>
                  </div>
                </div>
              </article>`;
            }

            const col1Cards = [
              makeCard(r0, '/assets/img/hero-family-1024w.webp', 'Intended parents holding hands with infant in soft natural light', 330),
              makeCard(r2, '/assets/img/become-a-surrogate-1024w.webp', 'Warm portrait of Nigerian gestational surrogate in natural daylight', 430),
            ];
            const col2Cards = [
              makeCard(r1, '/assets/img/service-matching-1024w.webp', 'Coordinator reviewing personalized donor and surrogate profiles', 430),
              makeCard(r0, '/assets/img/service-surrogacy-1024w.webp', 'Physician and intended parents discussing surrogacy pathways', 340),
            ];
            const col3Cards = [
              makeCard(r2, '/assets/img/how-it-works-1024w.webp', 'Warm daylight setting representing gestational journey care', 340),
              makeCard(r1, '/assets/img/service-counseling-1024w.webp', 'Independent counselor offering emotional support', 420),
            ];
            const col4Cards = [
              makeCard(r0, '/assets/img/service-ovum-donation-1024w.webp', 'Sunlit medical consultation room for donor matching', 420),
              makeCard(r2, '/assets/img/become-a-surrogate-1024w.webp', 'Gestational surrogate mother smiling in warm daylight', 330),
            ];

            return `
            <!-- Column 1 -->
            <div class="testimonial-wall-column relative h-full overflow-hidden">
              <div class="testimonial-wall-track wall-up">
                ${col1Cards.join('')}
                ${col1Cards.join('')}
              </div>
            </div>

            <!-- Column 2 -->
            <div class="testimonial-wall-column relative h-full overflow-hidden">
              <div class="testimonial-wall-track wall-down">
                ${col2Cards.join('')}
                ${col2Cards.join('')}
              </div>
            </div>

            <!-- Column 3 -->
            <div class="testimonial-wall-column relative h-full overflow-hidden">
              <div class="testimonial-wall-track wall-up">
                ${col3Cards.join('')}
                ${col3Cards.join('')}
              </div>
            </div>

            <!-- Column 4 -->
            <div class="testimonial-wall-column relative h-full overflow-hidden">
              <div class="testimonial-wall-track wall-down">
                ${col4Cards.join('')}
                ${col4Cards.join('')}
              </div>
            </div>`;
          })()}
        </div>
      </div>

      <!-- Mobile Wall Horizontal Scroll (block md:hidden) -->
      <div class="block md:hidden testimonial-wall-mobile-scroll reveal">
        <div class="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory px-1 scrollbar-none">
          ${(() => {
            const r0 = featuredReviews[0] || {
              display_name: 'Parent AJ',
              role: 'Intended Parent',
              country: 'United Kingdom',
              rating: 5,
              body: 'From our first conversation to bringing our child home, Zizo handled every detail with warmth, discretion, and professionalism. We are forever grateful.',
              verified: 1,
            };
            const r1 = featuredReviews[1] || {
              display_name: 'Parent SS & MV',
              role: 'Intended Parent',
              country: 'United States',
              rating: 5,
              body: 'Coordinating a cross-border journey felt overwhelming until we spoke with Chizaram and the Zizo team. Every medical and legal step was explained clearly and thoughtfully.',
              verified: 1,
            };
            const r2 = featuredReviews[2] || {
              display_name: 'B.O., Surrogate Mother, Lagos',
              role: 'Surrogate',
              country: 'Nigeria',
              rating: 5,
              body: 'As a surrogate in Lagos, I felt genuinely valued and protected at every appointment. My case manager checked in thoughtfully and my privacy was respected throughout.',
              verified: 1,
            };

            function makeMobileCard(rev, imgSrc, imgAlt) {
              const dName = escapeHtml(rev.display_name || 'Anonymous');
              const rName = escapeHtml(rev.role || 'Client');
              const loc = escapeHtml(rev.country ? `${rev.role} · ${rev.country}` : rev.role);
              const starVal = Number(rev.rating || 5).toFixed(1);
              const bText = escapeHtml(rev.body || '');

              return `
              <article class="testimonial-wall-card testimonial-wall-mobile-card w-[290px] sm:w-[320px] shrink-0 snap-center h-[390px]" tabindex="0" aria-label="Review by ${dName}">
                <img class="testimonial-wall-image" src="${imgSrc}" alt="${imgAlt}" loading="lazy" decoding="async" />

                <div class="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] tracking-wider uppercase text-[#8BB2AF] font-medium">
                    <i data-lucide="quote" class="w-3 h-3 text-[#8BB2AF]"></i>
                    <span>${rName}</span>
                  </span>
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] text-[#FAF9F6]/90 font-medium tabular-nums">
                    <i data-lucide="star" class="w-3 h-3 text-[#8BB2AF] fill-current"></i>
                    <span>${starVal}</span>
                  </span>
                </div>

                <div class="testimonial-wall-content">
                  <p class="testimonial-wall-quote">“${bText}”</p>
                  <div class="pt-2.5 border-t border-[#FAF9F6]/15 flex items-center justify-between gap-2">
                    <div>
                      <div class="testimonial-wall-name">${dName}</div>
                      <div class="testimonial-wall-role">${loc}${rev.verified ? ' · Verified' : ''}</div>
                    </div>
                    <div class="w-7 h-7 rounded-full bg-[#8BB2AF]/20 border border-[#8BB2AF]/30 text-[#8BB2AF] flex items-center justify-center shrink-0" aria-hidden="true">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-[#8BB2AF]"></i>
                    </div>
                  </div>
                </div>
              </article>`;
            }

            return [
              makeMobileCard(r0, '/assets/img/hero-family-1024w.webp', 'Intended parents holding hands with infant in soft natural light'),
              makeMobileCard(r1, '/assets/img/service-matching-1024w.webp', 'Coordinator reviewing personalized donor and surrogate profiles'),
              makeMobileCard(r2, '/assets/img/become-a-surrogate-1024w.webp', 'Warm portrait of Nigerian gestational surrogate in natural daylight'),
              makeMobileCard(r0, '/assets/img/service-surrogacy-1024w.webp', 'Physician and intended parents discussing surrogacy pathways'),
            ].join('');
          })()}
        </div>
      </div>

      <!-- Footer navigation links -->
      <div class="flex flex-wrap items-center justify-between gap-4 pt-10 mt-6 border-t border-[#FAF9F6]/10 reveal">
        <a href="/resources/stories-and-reviews/" class="text-[length:var(--fs-small)] text-[#8BB2AF] hover:text-[#FAF9F6] underline underline-offset-4 transition-colors">Read all stories and reviews</a>
        <a href="/resources/stories-and-reviews/#write-a-review" class="text-[length:var(--fs-small)] text-[#8BB2AF] hover:text-[#FAF9F6] underline underline-offset-4 transition-colors">Share your experience</a>
      </div>
    </div>
  </section>

  <!-- SECTION 7: FOUNDER SPOTLIGHT (CHIZARAM ATA) -->
  <section class="zizo-section bg-[#FAF9F6] border-t border-[#E1E0DD]">
    <div class="zizo-container !max-w-[1240px]">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <!-- Founder Portrait (513px width on desktop) -->
        <div class="w-full lg:w-[513px] lg:shrink-0 group rounded-2xl overflow-hidden aspect-[4/5] bg-[#E1E0DD] border border-[#E1E0DD] shadow-sm relative reveal">
          <div class="w-full h-full transition-transform duration-700 group-hover:scale-[1.02]">
            ${pictureTag({
              base: 'founder-chizaram-ata',
              alt: 'Chizaram Ata, Founder and Lead Partner at Zizo Donor and Surrogacy',
              width: 2429,
              height: 2330,
            })}
          </div>
          <!-- Floating Founder Badge -->
          <div class="absolute bottom-4 inset-x-4 z-10 p-4 rounded-xl bg-[#17191A]/85 backdrop-blur-md border border-[#FAF9F6]/15 flex items-center justify-between text-[#FAF9F6]">
            <div>
              <p class="font-display text-base font-medium">Chizaram Ata</p>
              <p class="text-xs text-[#8BB2AF] tracking-wider uppercase">Founder &amp; Lead Partner</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17645F]/70 text-[11px] text-[#FAF9F6] border border-[#8BB2AF]/30 tabular-nums">
              <i data-lucide="award" class="w-3.5 h-3.5 text-[#8BB2AF]"></i>
              <span>12+ Years Exp.</span>
            </span>
          </div>
        </div>

        <!-- Founder Story (627px width on desktop) -->
        <div class="w-full lg:w-[627px] lg:shrink-0 space-y-6 reveal">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#17645F]">Leadership &amp; Vision</p>
            <h2 class="display text-3xl md:text-4xl text-[#17191A] leading-tight">Chizaram Ata</h2>
            <p class="text-sm font-semibold text-[#8BB2AF] tracking-[0.14em] uppercase -mt-1">Founder &amp; Lead Partner</p>
          </div>

          <div class="space-y-3.5 text-[length:var(--fs-body)] text-[#2E3031] leading-relaxed">
            <p>
              At the heart of Zizo is <strong>Chizaram Ata</strong>, a visionary leader with over 12 years of specialized experience in reproductive healthcare and women’s health. Her passion for connecting intended parents with vetted gestational surrogates and egg donors is matched only by her dedication to providing guidance, confidentiality, and unwavering support every step of the way.
            </p>
            <p>
              Chizaram brings a calming presence and a firm structure to every case we manage. Her hands-on approach ensures that every intended parent, surrogate, and donor is treated not just with care, but with dignity, respect, privacy, and consistent communication from the initial consultation through postpartum homecoming.
            </p>
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

  <!-- SECTION 9: FAQ (ZELLA SALON INSPIRED INTERACTIVE ACCORDION & FILTER) -->
  ${(() => {
    const displayFaqs =
      homeFaqs && homeFaqs.length > 0
        ? homeFaqs.slice(0, 8)
        : [
            {
              id: 'faq-1',
              audience: 'Intended Parents',
              question: 'How does Zizo coordinate surrogacy and donor care across borders?',
              answer:
                'Zizo serves as your dedicated coordination partner from Lagos, connecting intended parents with vetted fertility clinics, independent reproductive legal counsel, and thoroughly screened surrogates or egg donors across Nigeria, Europe, Asia, Canada, and the United States.',
            },
            {
              id: 'faq-2',
              audience: 'Intended Parents',
              question: 'How are surrogates and egg donors screened?',
              answer:
                'Every prospective surrogate and egg donor completes comprehensive medical, psychological, and background evaluations conducted through qualified clinical and counseling professionals before joining our matching programme.',
            },
            {
              id: 'faq-3',
              audience: 'Intended Parents',
              question: 'How is privacy and anonymity protected during matching?',
              answer:
                'Confidentiality is foundational at Zizo. Profiles shared during personalized matching omit identifying personal details, and all consultations, records, and communications follow strict data-protection protocols.',
            },
            {
              id: 'faq-4',
              audience: 'Surrogates',
              question: 'What support does a surrogate receive during pregnancy?',
              answer:
                'Surrogates receive dedicated case-manager coordination, access to independent emotional counseling, transparent milestone compensation schedules, and close collaboration with obstetric care teams throughout pregnancy and postpartum recovery.',
            },
            {
              id: 'faq-5',
              audience: 'Donors',
              question: 'Who can apply to become an egg donor with Zizo?',
              answer:
                'Women in good general and reproductive health who meet clinical age and screening criteria may submit an initial inquiry. Our team conducts a private information call before any medical screening begins.',
            },
            {
              id: 'faq-6',
              audience: 'Legal and Costs',
              question: 'When should we speak with independent legal counsel?',
              answer:
                'Independent legal advice is essential before signing any matching or clinical agreement. Zizo coordinates introductions to experienced reproductive law practitioners in your relevant jurisdictions. Information on this website is general information and not legal or medical advice.',
            },
          ];

    const faqCategories = ['All', ...Array.from(new Set(displayFaqs.map((f) => f.audience || 'General')))];

    return `
  <section id="faq" aria-labelledby="faq-section-heading" class="zizo-section bg-[#FAF9F6] border-t border-[#E1E0DD] py-20 md:py-24 text-[#202020]">
    <div class="zizo-container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" data-home-faq>
        <!-- Left Column: Sticky Title, Description, Categories, and CTAs -->
        <div class="lg:col-span-5 lg:sticky lg:top-28 space-y-6 reveal">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#17645F] mb-2">Questions &amp; Answers</p>
            <h2 id="faq-section-heading" class="display text-3xl md:text-5xl font-medium text-[#17191A] leading-tight text-balance">Common questions, answered clearly</h2>
            <p class="mt-4 text-sm md:text-base text-[#2E3031]/80 leading-relaxed max-w-md">Information shared here is general guidance and not medical or legal advice.</p>
          </div>

          <!-- Category Filter Tabs -->
          <div role="tablist" aria-label="Filter frequently asked questions" class="flex flex-wrap gap-2 pt-1">
            ${faqCategories
              .map(
                (cat, idx) => `
            <button
              type="button"
              role="tab"
              id="faq-cat-tab-${idx}"
              aria-selected="${idx === 0 ? 'true' : 'false'}"
              tabindex="${idx === 0 ? '0' : '-1'}"
              data-faq-tab="${escapeHtml(cat)}"
              class="faq-cat-tab px-3.5 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#17645F] ${
                idx === 0
                  ? 'bg-[#17645F] text-[#FAF9F6] font-semibold shadow-xs'
                  : 'bg-[#FAF9F6] border border-[#E1E0DD] text-[#2E3031]/80 hover:border-[#17645F]/50 hover:text-[#17191A]'
              }"
            >
              ${escapeHtml(cat)}
            </button>`
              )
              .join('')}
          </div>

          <!-- Action Links -->
          <div class="pt-4 border-t border-[#E1E0DD] flex flex-wrap items-center gap-4">
            <a href="/book/" class="btn-primary">Book Consultation</a>
            <a href="/resources/faq/" class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17191A] hover:text-[#17645F] transition-colors whitespace-nowrap">
              <span>See all FAQs</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>

        <!-- Right Column: Accordion Container -->
        <div class="lg:col-span-7 reveal">
          <div class="bg-[#FAF9F6] rounded-2xl border border-[#E1E0DD] divide-y divide-[#E1E0DD] shadow-xs overflow-hidden" data-faq-accordion-container>
            ${displayFaqs
              .map((faq, idx) => {
                const isOpen = idx === 0;
                const panelId = `home-faq-panel-${idx}`;
                const triggerId = `home-faq-btn-${idx}`;
                const category = faq.audience || 'General';

                return `
            <div class="faq-item transition-colors" data-faq-item data-faq-category="${escapeHtml(category)}" data-open="${isOpen ? 'true' : 'false'}">
              <h3>
                <button
                  type="button"
                  id="${triggerId}"
                  class="w-full px-6 py-5 text-left flex items-start justify-between gap-4 hover:bg-[#17191A]/[0.02] transition-colors focus-visible:outline-2 focus-visible:outline-[#17645F]"
                  aria-expanded="${isOpen ? 'true' : 'false'}"
                  aria-controls="${panelId}"
                  data-faq-trigger
                >
                  <div class="space-y-1">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#17645F]">
                      ${escapeHtml(category)}
                    </span>
                    <span class="block font-display text-lg md:text-xl font-medium text-[#17191A] leading-snug">
                      ${escapeHtml(faq.question)}
                    </span>
                  </div>
                  <i
                    data-lucide="chevron-down"
                    class="faq-chevron w-5 h-5 text-[#17645F] shrink-0 mt-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-180' : ''}"
                    aria-hidden="true"
                  ></i>
                </button>
              </h3>
              <div
                id="${panelId}"
                class="faq-panel"
                role="region"
                aria-labelledby="${triggerId}"
                aria-hidden="${isOpen ? 'false' : 'true'}"
              >
                <div class="faq-panel-inner">
                  <div class="px-6 pb-6 pt-0 text-sm md:text-[15px] text-[#2E3031]/85 leading-relaxed max-w-2xl">
                    ${escapeHtml(faq.answer)}
                  </div>
                </div>
              </div>
            </div>`;
              })
              .join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`;
  })()}

  <!-- SECTION 10: CONTACT CTA -->
  ${renderClosingCta({ whatsappHref })}
</main>
${renderFooter({ settings })}
`;
}
