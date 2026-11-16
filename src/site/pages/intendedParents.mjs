import {
  escapeHtml,
  pictureTag,
  renderClosingCta,
  renderFooter,
  renderHead,
  renderHeader,
  renderInteriorHero,
} from '../partials/layout.mjs';

export function renderHowItWorksPage({ settings = {}, faqs = [], siteUrl = '' }) {
  const phases = [
    {
      num: '01',
      title: 'Consultation & Pathway Planning',
      duration: 'Duration: {{CLIENT_TO_CONFIRM}}',
      desc: 'Meet privately with our team via Google Meet, phone, or WhatsApp to review your family-building goals, preferred destination regions, and initial questions.',
    },
    {
      num: '02',
      title: 'Medical Records & Personalized Matching',
      duration: 'Duration: {{CLIENT_TO_CONFIRM}}',
      desc: 'Your fertility clinic reviews medical readiness while Zizo presents carefully screened, anonymized surrogate or egg donor profiles tailored to your preferences.',
    },
    {
      num: '03',
      title: 'Independent Legal & Clinical Coordination',
      duration: 'Duration: {{CLIENT_TO_CONFIRM}}',
      desc: 'Independent reproductive lawyers advise each party on contracts and parentage planning before medical stimulation or embryo transfer begins.',
    },
    {
      num: '04',
      title: 'Pregnancy & Case-Manager Support',
      duration: 'Duration: {{CLIENT_TO_CONFIRM}}',
      desc: 'Your dedicated Zizo case manager coordinates prenatal milestones, obstetric updates, and access to ongoing emotional counseling.',
    },
    {
      num: '05',
      title: 'Birth, Parentage & Homecoming',
      duration: 'Duration: {{CLIENT_TO_CONFIRM}}',
      desc: 'Hospital coordination and post-birth documentation steps are prepared ahead of delivery so you can welcome your child with peace of mind.',
    },
  ];

  const checklist = [
    'Identification and travel readiness details (shared only after onboarding, never on public forms)',
    'Summary of any prior fertility consultations or clinic preferences',
    'Questions about preferred programme regions (Nigeria, Europe, Asia, Canada, or the United States)',
    'Initial thoughts on donor or surrogate matching preferences',
  ];

  return `${renderHead({
    title: 'How It Works | Zizo Donor and Surrogacy',
    description:
      'A clear five-step route to parenthood with Zizo Donor and Surrogacy, from private consultation to birth coordination.',
    canonicalPath: '/intended-parents/how-it-works/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'How It Works' },
    ],
    title: 'A clear route to parenthood.',
    intro:
      'Step-by-step coordination designed to keep medical, legal, and emotional milestones calm and predictable.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius)] overflow-hidden bg-[#E1E0DD] reveal">
        ${pictureTag({
          base: 'how-it-works',
          alt: 'Parents hands gently cradling a newborn baby wrapped in a cream woven blanket',
          width: 1920,
          height: 1080,
          eager: true,
        })}
      </div>

      <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
        ${phases
          .map(
            (p) => `<div class="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-start reveal">
          <div class="md:col-span-2 flex items-center gap-3">
            <span class="w-9 h-9 rounded-full bg-[#8BB2AF] text-[#17191A] font-semibold text-sm inline-flex items-center justify-center tabular-nums">${p.num}</span>
          </div>
          <div class="md:col-span-4">
            <h2 class="display text-[length:var(--fs-h3)]">${escapeHtml(p.title)}</h2>
            <p class="text-xs text-[#5D5E5F] mt-1">${escapeHtml(p.duration)}</p>
          </div>
          <p class="md:col-span-6 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(p.desc)}</p>
        </div>`
          )
          .join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] pt-4">
        <div class="lg:col-span-6 bg-[#E1E0DD]/40 border border-[#E1E0DD] rounded-[var(--radius)] p-7 space-y-4 reveal">
          <h2 class="display text-[length:var(--fs-h3)]">What to prepare for your first consultation</h2>
          <ul class="space-y-3">
            ${checklist
              .map(
                (c) => `<li class="flex items-start gap-3 text-[length:var(--fs-small)]">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-1 shrink-0"></i>
              <span>${escapeHtml(c)}</span>
            </li>`
              )
              .join('')}
          </ul>
          <p class="text-xs text-[#5D5E5F]">Please do not send sensitive medical records through website forms.</p>
        </div>

        <div class="lg:col-span-6 space-y-4 reveal">
          <h2 class="display text-[length:var(--fs-h3)]">Frequently asked process questions</h2>
          <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
            ${faqs
              .slice(0, 4)
              .map((faq, i) => {
                const pid = `hiw-faq-${i}`;
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
        </div>
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderProgramsByCountryPage({ settings = {}, siteUrl = '' }) {
  const regions = [
    {
      id: 'nigeria',
      svg: '/assets/img/country-nigeria.svg',
      name: 'Nigeria',
      overview:
        'Anchored from our Lagos hub, Zizo coordinates local fertility clinic introductions, vetted gestational surrogate care, and anonymous donor pathways within Nigeria.',
      howItWorks:
        'Intended parents based locally or abroad work with our Lagos coordination team for screening, matching, and hospital planning.',
      legal: '{{LEGAL_REVIEW_REQUIRED}} — Independent Nigerian reproductive legal counsel reviews all agreements and parentage procedures prior to treatment.',
      timeline: '{{CLIENT_TO_CONFIRM}} — Estimated timeline confirmed with your partner clinic.',
    },
    {
      id: 'europe',
      svg: '/assets/img/country-europe.svg',
      name: 'Europe',
      overview:
        'Cross-border coordination for intended parents exploring regulated fertility, donor, or surrogacy pathways across selected European jurisdictions.',
      howItWorks:
        'Zizo coordinates preliminary consultations, clinic liaison, and introductions to local legal specialists aligned with each country’s framework.',
      legal: '{{LEGAL_REVIEW_REQUIRED}} — Jurisdiction-specific legal guidance must be obtained from licensed local counsel.',
      timeline: '{{CLIENT_TO_CONFIRM}} — Estimated timeline confirmed per country.',
    },
    {
      id: 'asia',
      svg: '/assets/img/country-asia.svg',
      name: 'Asia',
      overview:
        'Structured fertility and cross-border coordination supporting families navigating partner programmes in eligible Asian jurisdictions.',
      howItWorks:
        'Our coordinators manage communication bridges, time-zone scheduling, and documentation readiness alongside licensed clinical partners.',
      legal: '{{LEGAL_REVIEW_REQUIRED}} — Subject to local statutory requirements and independent legal review.',
      timeline: '{{CLIENT_TO_CONFIRM}} — Estimated timeline confirmed per clinic.',
    },
    {
      id: 'canada',
      svg: '/assets/img/country-canada.svg',
      name: 'Canada',
      overview:
        'Guidance and coordination for families pursuing altruistic gestational surrogacy and donor options in Canada.',
      howItWorks:
        'We assist with pathway planning, clinic introductions, and alignment with Canadian reimbursement and legal frameworks.',
      legal: '{{LEGAL_REVIEW_REQUIRED}} — Governed by federal and provincial family-law counsel.',
      timeline: '{{CLIENT_TO_CONFIRM}} — Estimated timeline confirmed during planning.',
    },
    {
      id: 'united-states',
      svg: '/assets/img/country-usa.svg',
      name: 'United States',
      overview:
        'Cross-border coordination for intended parents seeking established surrogacy and donor care programmes in supportive U.S. states.',
      howItWorks:
        'Zizo helps organise international logistics, clinic communication, and referrals to experienced U.S. reproductive attorneys.',
      legal: '{{LEGAL_REVIEW_REQUIRED}} — State-specific legal representation is required for all agreements and parentage orders.',
      timeline: '{{CLIENT_TO_CONFIRM}} — Estimated timeline confirmed per state programme.',
    },
  ];

  return `${renderHead({
    title: 'Programs by Country | Zizo Donor and Surrogacy',
    description:
      'Cross-border fertility, donor, and surrogacy coordination across Nigeria, Europe, Asia, Canada, and the United States.',
    canonicalPath: '/intended-parents/programs-by-country/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'Programs by Country' },
    ],
    title: 'Programs across five global regions.',
    intro:
      'Thoughtful cross-border coordination tailored to Nigeria, Europe, Asia, Canada, and the United States for seamless, trusted family building.',
  })}

  <section class="zizo-section bg-[#FAF9F6]" id="cross-border">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="flex flex-wrap gap-2.5 pb-4 border-b border-[#E1E0DD]">
        ${regions
          .map(
            (r) => `<a href="#${r.id}" class="px-4 py-2 rounded-[var(--radius)] bg-[#E1E0DD] hover:bg-[#d5d4d0] text-[#17191A] text-[length:var(--fs-small)] font-medium">${escapeHtml(r.name)}</a>`
          )
          .join('')}
      </div>

      <div class="space-y-12">
        ${regions
          .map(
            (r) => `<article id="${r.id}" class="scroll-mt-28 border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] reveal">
          <div class="aspect-[16/5] bg-[#FAF9F6] border-b border-[#E1E0DD]">
            <img src="${r.svg}" alt="" width="800" height="240" loading="lazy" class="w-full h-full object-cover" />
          </div>
          <div class="p-[var(--space-md)] grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-5 space-y-3">
              <h2 class="display">${escapeHtml(r.name)}</h2>
              <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(r.overview)}</p>
            </div>
            <div class="lg:col-span-7 space-y-4">
              <div>
                <h3 class="text-[length:var(--fs-small)] font-semibold uppercase tracking-[0.08em] text-[#5D5E5F] font-sans mb-1">How coordination works</h3>
                <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(r.howItWorks)}</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E1E0DD]">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Legal Context</p>
                  <p class="text-[length:var(--fs-small)] text-[#2E3031] mt-1">${escapeHtml(r.legal)}</p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Typical Timeline</p>
                  <p class="text-[length:var(--fs-small)] text-[#2E3031] mt-1">${escapeHtml(r.timeline)}</p>
                </div>
              </div>
              <div class="pt-2">
                <a href="/book/" class="btn-primary">Discuss ${escapeHtml(r.name)} Options</a>
              </div>
            </div>
          </div>
        </article>`
          )
          .join('')}
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderCostsPage({ settings = {}, faqs = [], siteUrl = '' }) {
  const includedItems = [
    'Coordination and dedicated case-manager support from consultation to birth',
    'Surrogate or donor recruitment, screening coordination, and anonymized profiling',
    'Clinic scheduling and laboratory cycle-support coordination',
    'Referrals to independent reproductive legal counsel',
    'Milestone compensation administration and transparent escrow reporting',
  ];

  const tiers = [
    {
      name: 'Donor Coordination Pathway',
      badge: 'Anonymous Matching',
      audience: 'Intended parents seeking verified ovum donation alongside IVF or surrogacy',
      estimate: 'Itemised Milestone Estimate',
      estimateSub: 'Direct clinic & laboratory pricing',
      notes: 'Curated donor matching, multi-tier screening, clinic synchronisation, and legal parentage contracts.',
      features: [
        'Curated non-identifying donor profile presentation',
        'Infectious disease, genetic & ovarian reserve testing',
        'Clinic cycle scheduling & medication management',
        'Independent counseling & informed consent',
      ],
      programme: 'Donor Coordination',
      isPopular: false,
    },
    {
      name: 'Nigeria Surrogacy Programme',
      badge: 'Most Selected',
      audience: 'Local and diaspora intended parents coordinating domestically within Nigeria',
      estimate: 'Itemised Milestone Estimate',
      estimateSub: 'Independent escrow protection',
      notes: 'Comprehensive gestational matching, clinical oversight, independent legal counsel, and prenatal case management.',
      features: [
        'Vetted surrogate selection with obstetric & psychological clearance',
        'Independent legal representation for intended parents and surrogate',
        'Dedicated escrow account with verified milestone releases',
        'Dedicated case manager from match to postpartum care',
      ],
      programme: 'Nigeria Surrogacy',
      isPopular: true,
    },
    {
      name: 'Cross-Border Programme Planning',
      badge: 'Global Compliance',
      audience: 'International pathways spanning Nigeria, the UK, US, Canada, Europe, and Asia',
      estimate: 'Itemised Milestone Estimate',
      estimateSub: 'Multi-jurisdictional concierge',
      notes: 'Bespoke cross-border coordination handling consular legalities, DNA verification, and international homecoming.',
      features: [
        'Cross-border legal counsel & parentage court orders',
        'Consular birth certificate & passport documentation (CRBA)',
        'Certified DNA testing and hospital delivery coordination',
        'International travel concierge & arrival planning',
      ],
      programme: 'Cross-Border Planning',
      isPopular: false,
    },
  ];

  const defaultFaqs = [
    {
      question: 'How are programme costs and payments structured?',
      answer:
        'Programme costs are divided into milestone stages rather than one upfront lump sum. Initial deposits cover matching and medical vetting, while surrogate compensation and clinical procedure funds are deposited into an independent escrow account and released only when each clinical milestone (such as contract signing, confirmed heartbeat, and monthly prenatal care) is verified.',
    },
    {
      question: 'When should we consult independent reproductive legal counsel?',
      answer:
        'Independent legal representation is mandatory before any matching agreement is signed or medical stimulation begins. Intended parents and gestational surrogates are represented by separate, independent legal counsel to ensure complete protection, informed consent, and airtight parentage orders.',
    },
    {
      question: 'How does third-party escrow protect our funds and the surrogate?',
      answer:
        'All surrogate compensation, travel allowances, and medical contingency reserves are held securely in a dedicated third-party escrow account. Neither the parents nor the agency can arbitrarily delay or withhold scheduled payments, ensuring the surrogate is treated with complete dignity and parents enjoy full financial security.',
    },
    {
      question: 'Are clinical IVF laboratory and medication fees included in the coordination fee?',
      answer:
        'Zizo provides full agency coordination, vetting, matching, and case management. Clinical IVF cycle fees, medication costs, and specialized laboratory procedures are itemized separately by our certified partner fertility clinics, ensuring full transparency with zero hidden agency markups.',
    },
    {
      question: 'What happens financially if an embryo transfer or matching does not succeed?',
      answer:
        'We structure our agreements with realistic medical expectations. While clinic laboratory fees for subsequent transfers depend on the clinic, our coordination agreements provide clear rematch protections with zero duplicate agency matching fees.',
    },
    {
      question: 'How are international birth certificates and consular passports managed?',
      answer:
        'For cross-border and diaspora intended parents, our legal network coordinates court parentage declarations, certified DNA testing, birth certificate legalization, and embassy passport paperwork (such as CRBA filings) to ensure a smooth, lawful homecoming.',
    },
  ];

  const displayedFaqs = faqs && faqs.length >= 5 ? faqs : defaultFaqs;

  return `${renderHead({
    title: 'Costs and Packages | Zizo Donor and Surrogacy',
    description:
      'Transparent breakdown of what is included in Zizo surrogacy and donor coordination packages, plus personalised cost-estimate requests.',
    canonicalPath: '/intended-parents/costs-and-packages/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'Costs and Packages' },
    ],
    title: 'Clear, transparent cost planning.',
    intro:
      'We outline every agency, clinical, legal, and compensation component upfront so there are no unexpected surprises.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <!-- Refined Service Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        ${tiers
          .map(
            (t) => `<div class="relative ${t.isPopular ? 'border-2 border-[#17645F] shadow-md' : 'border border-[#E1E0DD] shadow-sm'} rounded-[var(--radius)] p-7 md:p-8 flex flex-col justify-between gap-6 bg-[#FAF9F6] hover:border-[#8BB2AF]/60 transition-all duration-300 reveal">
          ${
            t.isPopular
              ? `<span class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#17645F] text-[#FAF9F6] text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                  ${escapeHtml(t.badge)}
                </span>`
              : `<div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E1E0DD]/50 text-[#17645F] text-[11px] font-semibold border border-[#E1E0DD]">
                    ${escapeHtml(t.badge)}
                  </span>
                </div>`
          }

          <div class="space-y-4">
            <div>
              <h2 class="display text-[length:var(--fs-h3)] text-[#17191A] leading-snug">${escapeHtml(t.name)}</h2>
            </div>

            <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(t.notes)}</p>

            <div class="pt-3 border-t border-[#E1E0DD]/80">
              <p class="text-xs font-semibold text-[#17191A] uppercase tracking-wider mb-2.5">Key Inclusions</p>
              <ul class="space-y-2 text-[length:var(--fs-small)] text-[#2E3031]">
                ${t.features
                  .map(
                    (f) => `<li class="flex items-start gap-2.5">
                  <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                  <span>${escapeHtml(f)}</span>
                </li>`
                  )
                  .join('')}
              </ul>
            </div>
          </div>

          <button type="button" class="${t.isPopular ? 'btn-primary' : 'btn-secondary'} w-full justify-center" data-open-estimate-modal data-programme="${escapeHtml(t.programme)}">
            Request estimate
          </button>
        </div>`
          )
          .join('')}
      </div>

      <!-- Coordination Scope & Financial Commitments -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start pt-6">
        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Coverage &amp; Scope</p>
          <h2 class="display text-[length:var(--fs-h3)]">What coordination covers</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">
            We coordinate the administrative, clinical, and legal components of your journey so you can focus on building your family.
          </p>
          <ul class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
            ${includedItems
              .map(
                (i) => `<li class="py-3.5 text-[length:var(--fs-small)] text-[#2E3031] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <span>${escapeHtml(i)}</span>
            </li>`
              )
              .join('')}
          </ul>
          <p class="text-xs text-[#5D5E5F]">
            Compensation for gestational surrogates follows transparent, milestone-based schedules confirmed in independent legal agreements.
          </p>
        </div>

        <div class="lg:col-span-6 border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 bg-[#E1E0DD]/30 space-y-5 reveal">
          <div class="space-y-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#17645F]"></i>
              Financial Transparency
            </span>
            <h2 class="display text-[length:var(--fs-h3)] text-[#17191A]">Our financial commitments</h2>
          </div>
          <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">
            Clinical IVF laboratory fees, donor medications, and independent attorney fees are itemised and billed directly at cost by licensed providers with zero agency surcharges.
          </p>
          <div class="space-y-3 pt-2">
            <div class="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E1E0DD] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Independent Escrow Account</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Surrogate compensation is safeguarded and released strictly after verified medical milestones.</p>
              </div>
            </div>
            <div class="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E1E0DD] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Itemised Written Estimates</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Every potential expense—from matching to hospital delivery—is outlined clearly before you commit.</p>
              </div>
            </div>
          </div>
          <div class="pt-2">
            <button type="button" class="btn-primary inline-flex items-center gap-2" data-open-estimate-modal>
              <i data-lucide="calculator" class="w-4 h-4"></i>
              <span>Request Personalised Estimate</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Cost & Legal FAQs (At least 5 FAQs) -->
      <div class="space-y-4 reveal">
        <h2 class="display text-[length:var(--fs-h3)]">Cost &amp; legal FAQs</h2>
        <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
          ${displayedFaqs
            .map((faq, i) => {
              const pid = `cost-faq-${i}`;
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
      </div>
    </div>
  </section>

  <!-- POPUP MODAL: Request Personalised Cost Estimate -->
  <div id="cost-estimate-modal" class="fixed inset-0 z-50 hidden bg-[#17191A]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-estimate-title">
    <div class="relative w-full max-w-xl bg-[#FAF9F6] border border-[#E1E0DD] rounded-2xl p-6 sm:p-8 shadow-2xl my-auto text-[#17191A]">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20 mb-2">
            <i data-lucide="calculator" class="w-3.5 h-3.5 text-[#17645F]"></i>
            Personalised Cost Planning
          </span>
          <h2 id="modal-estimate-title" class="display text-2xl sm:text-3xl font-normal text-[#17191A] leading-tight">Request a personalised estimate</h2>
        </div>
        <button type="button" class="w-9 h-9 rounded-full bg-[#E1E0DD]/60 hover:bg-[#E1E0DD] text-[#17191A] flex items-center justify-center transition-colors shrink-0" data-modal-close aria-label="Close modal">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">
        Share your preferred programme and destination. We respond within 24 hours with an itemised, milestone-based breakdown. Please do not include medical records here.
      </p>

      <form id="cost-estimate-form" data-zizo-form="cost_estimate" class="space-y-4" novalidate>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="ce-name" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Full name</label>
            <input id="ce-name" name="name" type="text" required class="input-field" autocomplete="name" />
          </div>
          <div>
            <label for="ce-email" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Email address</label>
            <input id="ce-email" name="email" type="email" required class="input-field" autocomplete="email" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="ce-country" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Country of residence</label>
            <input id="ce-country" name="country" type="text" required class="input-field" autocomplete="country-name" />
          </div>
          <div>
            <label for="ce-region" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Preferred programme / region</label>
            <select id="ce-region" name="preferred_region" class="input-field">
              <option value="Nigeria Surrogacy">Nigeria Surrogacy Programme</option>
              <option value="Donor Coordination">Donor Coordination Pathway</option>
              <option value="Cross-Border Planning">Cross-Border Programme Planning</option>
              <option value="Undecided">Not yet decided / Need advice</option>
            </select>
          </div>
        </div>
        <div>
          <label for="ce-message" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Services of interest or questions</label>
          <textarea id="ce-message" name="message" rows="3" required class="input-field" placeholder="For example: Gestational surrogacy and egg donation planning"></textarea>
        </div>
        <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
          <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-[#17645F]" />
          <span>I consent to Zizo contacting me with an estimate under the <a href="/privacy-policy/" class="text-[#17645F] underline">Privacy Policy</a>.</span>
        </label>
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
        <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button type="submit" class="btn-primary w-full sm:w-auto">Send Estimate Request</button>
          <button type="button" class="btn-secondary w-full sm:w-auto" data-modal-close>Cancel</button>
        </div>
        <p class="text-[length:var(--fs-small)] text-[#17645F]" data-form-status aria-live="polite"></p>
      </form>
    </div>
  </div>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderLegalEthicsPage({ settings = {}, siteUrl = '' }) {
  const pillars = [
    {
      title: 'Strict Anonymity & Discretion',
      body: 'Surrogates, egg donors, and intended parents are protected by strict privacy standards. Matching profiles exclude identifying contact details, and reviews never publish full names or photographs.',
    },
    {
      title: 'Independent Legal Representation',
      body: 'Every party should receive independent advice from qualified reproductive legal counsel in the relevant jurisdiction before executing any agreement.',
    },
    {
      title: 'Informed Consent & Ethical Screening',
      body: 'No matching proceeds without documented medical, psychological, and counselor readiness assessments. Participants may ask questions or pause without pressure.',
    },
    {
      title: 'Transparent Compensation Standards',
      body: 'Reimbursements and surrogate compensation are structured transparently around documented milestones and health-care protections.',
    },
  ];

  return `${renderHead({
    title: 'Legal and Ethics | Zizo Donor and Surrogacy',
    description:
      'How Zizo protects anonymity, informed consent, independent legal counsel, and ethical compensation standards.',
    canonicalPath: '/intended-parents/legal-and-ethics/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'Legal and Ethics' },
    ],
    title: 'Legal clarity and ethical standards.',
    intro:
      'Protecting the dignity, privacy, and informed consent of intended parents, egg donors, and gestational surrogates.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 md:grid-cols-2 gap-6">
      ${pillars
        .map(
          (p) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-7 space-y-3 reveal">
        <h2 class="display text-[length:var(--fs-h3)]">${escapeHtml(p.title)}</h2>
        <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(p.body)}</p>
      </div>`
        )
        .join('')}
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}
