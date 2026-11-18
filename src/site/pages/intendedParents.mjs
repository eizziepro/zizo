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
    title: 'How it works',
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
    title: 'International | Zizo Donor and Surrogacy',
    description:
      'Cross-border fertility, donor, and surrogacy coordination across Nigeria, Europe, Asia, Canada, and the United States.',
    canonicalPath: '/intended-parents/international/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'International' },
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
  const programmes = [
    {
      id: 'nigeria-surrogacy',
      name: 'Nigeria Surrogacy Programme',
      badge: 'Most Selected · Domestic & Diaspora',
      isPopular: true,
      tagline: 'Comprehensive gestational matching, clinical oversight, independent legal counsel, and prenatal case management within Nigeria.',
      audience: 'Intended parents living in Nigeria or diaspora families seeking domestic coordination with world-class clinical care.',
      programme: 'Nigeria Surrogacy',
      inclusions: [
        'Vetted gestational surrogate matching with obstetric, infectious disease and psychological clearance',
        'Independent legal representation for both intended parents and gestational carrier',
        'Dedicated third-party escrow account with verified clinical milestone disbursements',
        'Dedicated case manager overseeing appointments, nutrition, living allowances, and hospital logistics',
        'Hospital delivery coordination and high court legal parentage decree filings',
        'Emergency 24/7 case management and contingency reserve oversight',
      ],
      stages: [
        { phase: 'Phase 1', title: 'Consultation & Match Vetting', desc: 'Medical prerequisites review, non-identifying surrogate profile matching, and clinical obstetric clearance.' },
        { phase: 'Phase 2', title: 'Independent Legal Contracts', desc: 'Surrogate and parent agreements drafted by separate independent reproductive attorneys; escrow account established.' },
        { phase: 'Phase 3', title: 'Pregnancy Escrow Milestones', desc: 'Confirmed heartbeat milestone release, monthly living stipends, maternity allowances, and ongoing ultrasound monitoring.' },
        { phase: 'Phase 4', title: 'Hospital Delivery & Parentage', desc: 'Private delivery room logistics, final milestone release, certified birth certificate, and court parentage orders.' },
      ],
      clinicNote: 'Clinical IVF laboratory cycles and medications are itemised and billed directly at licensed clinic cost with zero agency surcharges.',
    },
    {
      id: 'cross-border',
      name: 'Cross-Border Programme Planning',
      badge: 'Global Compliance · UK, US, Canada, Europe, Asia',
      isPopular: false,
      tagline: 'Bespoke international coordination managing multi-jurisdictional legalities, certified DNA verification, and international consular homecoming.',
      audience: 'International intended parents and overseas diaspora requiring synchronized immigration, passport, and court parentage documentation.',
      programme: 'Cross-Border Planning',
      inclusions: [
        'Dual-jurisdiction reproductive legal counsel in Nigeria and intended parents’ home country',
        'Consular birth certificate & passport documentation (CRBA, UK emergency travel document, etc.)',
        'Embassy-approved chain-of-custody DNA testing and hospital discharge coordination',
        'Bespoke travel concierge, accredited accommodation guidance, and arrival planning in Lagos',
        'Coordination with embassy consular officers and high court legal parentage decrees',
        'Continuous cross-border case management from embryo shipment to safe international arrival',
      ],
      stages: [
        { phase: 'Phase 1', title: 'Dual-Jurisdiction Legal Review', desc: 'Conflict-of-law analysis and tailored roadmap ensuring lawful parentage recognition in your home country.' },
        { phase: 'Phase 2', title: 'Embryo Transfer & Escrow Setup', desc: 'Embryo transport or creation coordination, surrogate cycle preparation, and international escrow funding.' },
        { phase: 'Phase 3', title: 'Prenatal Care & Pre-Birth Filings', desc: 'Remote ultrasound sharing, monthly case reports, and drafting pre-birth court declarations.' },
        { phase: 'Phase 4', title: 'Consular Passport & Homecoming', desc: 'Chain-of-custody DNA test, expedited birth certificate legalization, embassy appointment, and flight departure.' },
      ],
      clinicNote: 'Embassy filing fees, consular expedited processing, and certified DNA laboratory fees are outlined transparently before signing.',
    },
    {
      id: 'donor-coordination',
      name: 'Donor Coordination Pathway',
      badge: 'Anonymous Matching · Verified Donors',
      isPopular: false,
      tagline: 'Curated non-identifying egg donor matching with multi-tier health and genetic screening, clinic synchronisation, and airtight parentage contracts.',
      audience: 'Intended parents seeking verified, healthy ovum donation alongside IVF or gestational surrogacy.',
      programme: 'Donor Coordination',
      inclusions: [
        'Curated non-identifying egg donor portfolio presentation tailored to your personal and physical preferences',
        'Rigorous medical evaluation: infectious disease, genetic carrier screening, and AMH ovarian reserve testing',
        'Clinic cycle synchronization and donor stimulation medication protocol management',
        'Independent psychological counseling and formal informed consent documentation',
        'Airtight donor contract execution ensuring permanent relinquishment of all parental rights',
        'Dedicated donor coordinator ensuring donor wellbeing and cycle scheduling adherence',
      ],
      stages: [
        { phase: 'Phase 1', title: 'Curated Profile Selection', desc: 'Review non-identifying donor profiles containing detailed health history, educational background, and physical traits.' },
        { phase: 'Phase 2', title: 'Comprehensive Clinical Clearance', desc: 'Hormonal evaluations, ovarian reserve ultrasound, genetic carrier testing, and independent counseling.' },
        { phase: 'Phase 3', title: 'Legal Contracts & Escrow', desc: 'Execution of anonymous legal agreements; donor compensation allowances placed securely in escrow.' },
        { phase: 'Phase 4', title: 'Ovarian Stimulation & Retrieval', desc: 'Medication management, follicular monitoring, and synchronized egg retrieval with your partner clinic.' },
      ],
      clinicNote: 'IVF clinic laboratory fertilization, ICSI, and embryo freezing are billed directly by certified embryology laboratories.',
    },
  ];

  const pillars = [
    {
      icon: 'shield-check',
      title: 'Dedicated Escrow Safeguards',
      desc: 'All surrogate compensation and medical contingency reserves are held securely in independent third-party escrow and never co-mingled with operating agency funds.',
    },
    {
      icon: 'sparkles',
      title: 'Zero Clinical Markups',
      desc: 'Partner fertility clinic laboratory fees, IVF cycles, and donor medications are billed directly at net clinic cost with full itemisation and zero agency markups.',
    },
    {
      icon: 'clock',
      title: 'Milestone-Based Releases',
      desc: 'Funds are disbursed strictly upon verified clinical milestones (confirmed pregnancy, 20-week anatomy scan, hospital delivery) ensuring complete security.',
    },
    {
      icon: 'repeat',
      title: 'Rematch Protection Guarantee',
      desc: 'If an embryo transfer does not take or matching requires a medical pause, our agency coordination continues with zero duplicate matching retainer fees.',
    },
  ];

  const comparisonMatrix = [
    { feature: 'Vetted Gestational Surrogate Matching', nigeria: true, crossBorder: true, donor: false },
    { feature: 'Curated Non-Identifying Egg Donor Profiling', nigeria: 'Optional Add-on', crossBorder: 'Optional Add-on', donor: true },
    { feature: 'Independent Legal Counsel (Both Parties)', nigeria: true, crossBorder: true, donor: true },
    { feature: 'Third-Party Milestone Escrow Protection', nigeria: true, crossBorder: true, donor: true },
    { feature: 'Dedicated Case Manager & 24/7 Access', nigeria: true, crossBorder: true, donor: true },
    { feature: 'Partner Clinic Cycle & Medication Scheduling', nigeria: true, crossBorder: true, donor: true },
    { feature: 'High Court Parentage Decree Filings', nigeria: true, crossBorder: true, donor: 'Relinquishment Order' },
    { feature: 'Consular Passport & Embassy CRBA Filing', nigeria: false, crossBorder: true, donor: false },
    { feature: 'Embassy-Approved Chain-of-Custody DNA', nigeria: 'Optional', crossBorder: true, donor: false },
    { feature: 'Rematch Guarantee Protection', nigeria: true, crossBorder: true, donor: true },
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
    title: 'Zizo Packages | Zizo Donor and Surrogacy',
    description:
      'Transparent breakdown of what is included in Zizo surrogacy and donor coordination packages, plus personalised cost-estimate requests.',
    canonicalPath: '/intended-parents/packages/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Intended Parents' },
      { label: 'Packages' },
    ],
    title: 'Costs and packages',
    intro:
      'We outline every agency, clinical, legal, and compensation component upfront so there are no unexpected surprises.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-xl)]">

      <!-- 1. Financial Transparency & Escrow Pillars -->
      <div class="space-y-6">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Financial Principles</p>
          <h2 class="display text-[length:var(--fs-h3)] mt-1">Ethical, milestone-based financial safeguards</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${pillars
            .map(
              (p) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-6 bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal flex flex-col justify-between">
            <div class="space-y-3">
              <span class="w-10 h-10 rounded-full bg-[#17645F]/10 text-[#17645F] inline-flex items-center justify-center">
                <i data-lucide="${p.icon}" class="w-5 h-5"></i>
              </span>
              <h3 class="font-display text-lg text-[#17191A] leading-snug">${escapeHtml(p.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(p.desc)}</p>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 2. Master Programme Pathway Cards (Elevated Architectural Layout) -->
      <div class="space-y-8">
        <div class="max-w-3xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Core Programmes</p>
          <h2 class="display text-[length:var(--fs-h2)] md:text-[length:var(--fs-h1)] mt-1">Structured coordination pathways</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031] mt-2">
            Every family journey is unique. Select your preferred pathway to view complete inclusions, clinical coordination milestones, and request an itemised written estimate.
          </p>
        </div>

        <div class="space-y-8">
          ${programmes
            .map(
              (p) => `<article class="relative border ${p.isPopular ? 'border-2 border-[#17645F] shadow-lg' : 'border-[#E1E0DD] shadow-sm'} rounded-2xl bg-[#FAF9F6] p-7 sm:p-9 lg:p-10 reveal" id="${p.id}">
            ${
              p.isPopular
                ? `<div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#17645F] text-[#FAF9F6] text-xs font-semibold tracking-wider uppercase mb-5 shadow-sm">
                    <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                    <span>${escapeHtml(p.badge)}</span>
                  </div>`
                : `<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1E0DD]/60 text-[#17645F] text-xs font-semibold border border-[#E1E0DD] mb-5">
                    <span>${escapeHtml(p.badge)}</span>
                  </div>`
            }

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <!-- Left: Pathway Header & Inclusions -->
              <div class="lg:col-span-7 space-y-6">
                <div>
                  <h3 class="display text-2xl sm:text-3xl text-[#17191A] leading-tight">${escapeHtml(p.name)}</h3>
                  <p class="text-[length:var(--fs-body)] text-[#2E3031] mt-2 leading-relaxed font-medium">${escapeHtml(p.tagline)}</p>
                  <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mt-1">${escapeHtml(p.audience)}</p>
                </div>

                <div class="pt-4 border-t border-[#E1E0DD]">
                  <p class="text-xs font-semibold text-[#17191A] uppercase tracking-wider mb-3.5">Included In Agency Coordination</p>
                  <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[length:var(--fs-small)] text-[#2E3031]">
                    ${p.inclusions
                      .map(
                        (inc) => `<li class="flex items-start gap-2.5">
                      <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                      <span>${escapeHtml(inc)}</span>
                    </li>`
                      )
                      .join('')}
                  </ul>
                </div>

                <div class="p-4 rounded-xl bg-[#E1E0DD]/30 border border-[#E1E0DD]/80 text-xs text-[#5D5E5F]">
                  <strong class="text-[#17191A]">Transparency note:</strong> ${escapeHtml(p.clinicNote)}
                </div>
              </div>

              <!-- Right: Milestone Disbursement Blueprint & Action -->
              <div class="lg:col-span-5 border border-[#E1E0DD] rounded-xl p-6 sm:p-7 bg-[#FAF9F6]/80 flex flex-col justify-between gap-6 shadow-sm">
                <div>
                  <div class="flex items-center justify-between pb-3 border-b border-[#E1E0DD]">
                    <span class="text-xs font-semibold text-[#17191A] uppercase tracking-wider">Milestone Disbursement Schedule</span>
                    <span class="text-xs text-[#17645F] font-medium">4 Key Phases</span>
                  </div>

                  <div class="mt-4 space-y-3.5">
                    ${p.stages
                      .map(
                        (st, sidx) => `<div class="flex items-start gap-3">
                      <span class="w-6 h-6 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        ${sidx + 1}
                      </span>
                      <div>
                        <p class="text-xs font-semibold text-[#17191A]">${escapeHtml(st.title)}</p>
                        <p class="text-[11px] text-[#5D5E5F] mt-0.5 leading-snug">${escapeHtml(st.desc)}</p>
                      </div>
                    </div>`
                      )
                      .join('')}
                  </div>
                </div>

                <div class="pt-4 border-t border-[#E1E0DD] space-y-3">
                  <button type="button" class="${p.isPopular ? 'btn-primary' : 'btn-secondary'} w-full justify-center text-sm !py-3" data-open-estimate-modal data-programme="${escapeHtml(p.programme)}">
                    Request Personalised Written Estimate
                  </button>
                  <p class="text-[11px] text-center text-[#5D5E5F]">Itemised estimate returned within 24 hours · Confidential</p>
                </div>
              </div>
            </div>
          </article>`
            )
            .join('')}
        </div>
      </div>

      <!-- 3. What Coordination Covers vs Direct Clinical Costs -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start">
        <div class="lg:col-span-6 space-y-4 reveal">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Three Financial Components</p>
          <h2 class="display text-[length:var(--fs-h3)]">Understanding how funding works</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">
            To ensure complete clarity and protect every family from hidden markups, surrogacy and donor journeys are divided into three clear financial tiers:
          </p>

          <div class="space-y-4 pt-2">
            <div class="border border-[#E1E0DD] rounded-xl p-5 bg-[#FAF9F6]">
              <div class="flex items-center gap-2.5 text-[#17191A] font-medium mb-1">
                <span class="w-6 h-6 rounded-full bg-[#17645F] text-[#FAF9F6] text-xs font-semibold flex items-center justify-center">1</span>
                <span class="font-display text-base">Agency Coordination Fee (Fixed)</span>
              </div>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] pl-8">
                Covers surrogate recruitment, thorough vetting, case management, hospital coordination, and milestone escrow management throughout your journey.
              </p>
            </div>

            <div class="border border-[#E1E0DD] rounded-xl p-5 bg-[#FAF9F6]">
              <div class="flex items-center gap-2.5 text-[#17191A] font-medium mb-1">
                <span class="w-6 h-6 rounded-full bg-[#17645F] text-[#FAF9F6] text-xs font-semibold flex items-center justify-center">2</span>
                <span class="font-display text-base">Clinical IVF &amp; Medications (Direct at Cost)</span>
              </div>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] pl-8">
                Billed directly by licensed fertility clinics and embryology laboratories. Zero agency markup on IVF procedures, ICSI, PGT-A genetic screening, or medications.
              </p>
            </div>

            <div class="border border-[#E1E0DD] rounded-xl p-5 bg-[#FAF9F6]">
              <div class="flex items-center gap-2.5 text-[#17191A] font-medium mb-1">
                <span class="w-6 h-6 rounded-full bg-[#17645F] text-[#FAF9F6] text-xs font-semibold flex items-center justify-center">3</span>
                <span class="font-display text-base">Surrogate Living &amp; Medical Escrow (Milestones)</span>
              </div>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] pl-8">
                Surrogate compensation, monthly allowances, maternity clothes, and emergency medical reserves are deposited into independent escrow and released only after verified medical milestones.
              </p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 border border-[#E1E0DD] rounded-[var(--radius)] p-7 md:p-8 bg-[#E1E0DD]/30 space-y-5 reveal">
          <div class="space-y-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20">
              <i data-lucide="calculator" class="w-3.5 h-3.5 text-[#17645F]"></i>
              Personalised Planning
            </span>
            <h2 class="display text-[length:var(--fs-h3)] text-[#17191A]">Receive an itemised cost estimate</h2>
          </div>
          <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">
            Every family’s clinical prerequisites and destination preferences are distinct. We provide a comprehensive, transparent cost estimate sheet detailing every stage before you make any commitment.
          </p>
          <div class="space-y-3 pt-2">
            <div class="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E1E0DD] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Independent Legal Representation</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Separate counsel for parents and surrogate to guarantee informed consent.</p>
              </div>
            </div>
            <div class="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E1E0DD] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Emergency Contingency Planning</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Pre-calculated reserves so unforeseen medical needs never cause stress.</p>
              </div>
            </div>
            <div class="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E1E0DD] flex items-start gap-3">
              <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
              <div>
                <p class="text-xs font-semibold text-[#17191A]">Fast 24-Hour Coordinator Turnaround</p>
                <p class="text-[11px] text-[#5D5E5F] mt-0.5">Confidential written response directly from a senior care coordinator.</p>
              </div>
            </div>
          </div>
          <div class="pt-2">
            <button type="button" class="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center" data-open-estimate-modal>
              <i data-lucide="calculator" class="w-4 h-4"></i>
              <span>Request Personalised Estimate</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Comparison Matrix (Clean Editorial Table) -->
      <div class="space-y-6 reveal">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Programme Comparison</p>
          <h2 class="display text-[length:var(--fs-h3)] mt-1">Compare coordination features</h2>
        </div>

        <div class="overflow-x-auto border border-[#E1E0DD] rounded-xl bg-[#FAF9F6]">
          <table class="w-full text-left border-collapse text-[length:var(--fs-small)]">
            <thead>
              <tr class="border-b border-[#E1E0DD] bg-[#E1E0DD]/20">
                <th class="py-4 px-6 font-semibold text-[#17191A] w-2/5">Feature / Inclusion</th>
                <th class="py-4 px-4 font-semibold text-[#17645F] w-1/5 text-center">Nigeria Surrogacy</th>
                <th class="py-4 px-4 font-semibold text-[#17191A] w-1/5 text-center">Cross-Border Planning</th>
                <th class="py-4 px-4 font-semibold text-[#17191A] w-1/5 text-center">Donor Coordination</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E1E0DD]">
              ${comparisonMatrix
                .map(
                  (row) => `<tr class="hover:bg-[#E1E0DD]/15 transition-colors">
                <td class="py-3.5 px-6 text-[#2E3031] font-medium">${escapeHtml(row.feature)}</td>
                <td class="py-3.5 px-4 text-center">
                  ${
                    typeof row.nigeria === 'boolean'
                      ? row.nigeria
                        ? `<i data-lucide="check" class="w-4 h-4 text-[#17645F] mx-auto"></i>`
                        : `<span class="text-[#5D5E5F]">—</span>`
                      : `<span class="text-xs text-[#17645F] font-medium">${escapeHtml(row.nigeria)}</span>`
                  }
                </td>
                <td class="py-3.5 px-4 text-center">
                  ${
                    typeof row.crossBorder === 'boolean'
                      ? row.crossBorder
                        ? `<i data-lucide="check" class="w-4 h-4 text-[#17645F] mx-auto"></i>`
                        : `<span class="text-[#5D5E5F]">—</span>`
                      : `<span class="text-xs text-[#17191A] font-medium">${escapeHtml(row.crossBorder)}</span>`
                  }
                </td>
                <td class="py-3.5 px-4 text-center">
                  ${
                    typeof row.donor === 'boolean'
                      ? row.donor
                        ? `<i data-lucide="check" class="w-4 h-4 text-[#17645F] mx-auto"></i>`
                        : `<span class="text-[#5D5E5F]">—</span>`
                      : `<span class="text-xs text-[#5D5E5F] font-medium">${escapeHtml(row.donor)}</span>`
                  }
                </td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Cost & Legal FAQs (At least 5 FAQs) -->
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
  const safeguardPillars = [
    {
      icon: 'scale',
      tag: 'Representation',
      title: 'Dual Independent Counsel',
      desc: 'Both the intended parents and gestational surrogate retain separate, accredited reproductive law solicitors. This guarantees zero conflict of interest and uncompromised advocacy.',
    },
    {
      icon: 'file-check',
      tag: 'Informed Consent',
      title: 'Voluntary Autonomy',
      desc: 'Comprehensive multi-session medical, psychological, and counselor evaluations ensure all parties participate voluntarily with complete autonomy and unhurried informed consent.',
    },
    {
      icon: 'shield-check',
      tag: 'Financial Security',
      title: 'Regulated Milestone Escrow',
      desc: 'All surrogate allowances, medical coverage, and living stipends are held in dedicated third-party escrow and disbursed strictly upon certified clinical milestones.',
    },
    {
      icon: 'heart-handshake',
      tag: 'Parentage Decrees',
      title: 'Irrevocable Parentage',
      desc: 'Pre-transfer legal agreements coupled with Nigerian judicial parentage orders extinguish third-party claims and establish intended parents as sole legal guardians.',
    },
  ];

  const legalRoadmap = [
    {
      step: '01',
      title: 'Pre-Transfer Surrogacy Agreement',
      timing: 'Executed Before Clinical Cycle',
      summary:
        'A comprehensive legal contract finalized between intended parents and the surrogate with separate, independent legal representation for each party.',
      deliverables: [
        'Unambiguous declaration of parental intent',
        'Surrogate bodily autonomy & health supremacy protocols',
        'Milestone-based compensation & reimbursement schedule',
        'Emergency obstetric decision-making directives',
      ],
    },
    {
      step: '02',
      title: 'Judicial Parentage Decrees & Pre-Birth Filings',
      timing: 'Mid-Pregnancy Court Filings',
      summary:
        'Reproductive legal counsel petitions the Nigerian High Court to secure formal parentage declarations establishing the intended parents as lawful parents upon delivery.',
      deliverables: [
        'Formal parental order petition filings in Nigerian court',
        'Judicial recognition of intended parents as lawful parents',
        'Legal extinguishing of any surrogate parental status',
        'Hospital notification and delivery custody clearances',
      ],
    },
    {
      step: '03',
      title: 'Delivery, Birth Registration & Certified DNA',
      timing: 'Delivery to Postpartum (Week 1–2)',
      summary:
        'Immediate parental custody at birth with official hospital documentation and accredited DNA parentage verification.',
      deliverables: [
        'Official hospital discharge directly to intended parents',
        'National birth certificate issuance naming intended parents',
        'Chain-of-custody certified DNA parentage testing',
        'Consular notification documentation package',
      ],
    },
    {
      step: '04',
      title: 'Consular Exit, Passport & International Return',
      timing: 'Post-Birth (Week 3–8 Depending on Country)',
      summary:
        'Bespoke international exit coordination for diaspora and overseas intended parents returning to the UK, US, Canada, Europe, or Asia.',
      deliverables: [
        'Embassy DNA compliance & CRBA / British High Commission filings',
        'Emergency travel document or passport issuance',
        'Apostille and Hague-compliant document legalisation',
        'Post-return home country parental order validation (e.g. UK s54 HFEA)',
      ],
    },
  ];

  const partyProtections = [
    {
      badge: 'For Intended Parents',
      badgeColor: 'bg-[#17645F]/10 text-[#17645F] border-[#17645F]/20',
      title: 'Uncompromised Parental Security',
      subtitle: 'Complete legal certainty from embryo creation to international homecoming.',
      items: [
        'Pre-transfer contracts ensuring enforceable parental intent',
        'Direct-to-provider medical billing with zero agency markups',
        'Protected third-party escrow shielding all financial allocations',
        'Dedicated legal liaison for home country embassy and visa exit',
        'Rematch protection guarantee in case of medical cycle cancellation',
      ],
    },
    {
      badge: 'For Gestational Surrogates',
      badgeColor: 'bg-[#8BB2AF]/20 text-[#17645F] border-[#8BB2AF]/40',
      title: 'Dignity, Autonomy & Wellbeing',
      subtitle: 'Ethical standards prioritizing surrogate health, respect, and peace of mind.',
      items: [
        '100% independent legal counsel paid by intended parents',
        'Maternal health supremacy—obstetric decisions prioritize her life & health',
        'Comprehensive private medical, dental, and life insurance',
        'Guaranteed monthly escrow allowances disbursed punctually on milestones',
        'Continuous clinical counseling, postpartum recovery, and doula care',
      ],
    },
    {
      badge: 'For Egg & Sperm Donors',
      badgeColor: 'bg-[#17191A]/5 text-[#17191A] border-[#E1E0DD]',
      title: 'Privacy & Voluntary Altruism',
      subtitle: 'Strict confidentiality and comprehensive ethical safeguards.',
      items: [
        'Full privacy protection with non-identifying profile representation',
        'Complete legal waiver of parental rights and future financial liability',
        'In-depth genetic, psychological, and infectious disease screening',
        'Standard-aligned compensation for time, travel, and clinical effort',
        'Data protected under the Nigeria Data Protection Act (NDPA 2023)',
      ],
    },
  ];

  const jurisdictions = [
    {
      country: 'Nigeria (Host Jurisdiction)',
      flag: 'NG',
      law: 'Contract Law, Child Welfare Doctrine & NDPA 2023',
      points: [
        'Gestational surrogacy agreements are recognized and enforceable under Nigerian contract law and child welfare doctrine.',
        'High Court declaratory orders vest full parental rights in intended parents upon birth, extinguishing surrogate claims.',
        'Strict health facility accreditation standards under the Federal Ministry of Health.',
      ],
    },
    {
      country: 'United Kingdom',
      flag: 'UK',
      law: 'Section 54, Human Fertilisation & Embryology Act 2008',
      points: [
        'UK courts grant Parental Orders extinguishing surrogate parenthood upon application after birth.',
        'Requires at least one intended parent to have a genetic link to the child.',
        'Surrogate must give free, informed consent at least 6 weeks post-birth with independent legal representation.',
      ],
    },
    {
      country: 'United States',
      flag: 'US',
      law: 'Immigration & Nationality Act (INA §§ 301, 309)',
      points: [
        'US citizenship is transmitted by bloodline from a qualifying US citizen intended parent.',
        'Consular Report of Birth Abroad (CRBA) and US passport issued via the US Consulate General in Lagos.',
        'Embassy-approved chain-of-custody DNA testing confirms genetic parentage.',
      ],
    },
    {
      country: 'Canada, Europe & Asia',
      flag: 'GLOBAL',
      law: 'Provincial Decrees, Hague Conventions & Foreign Affairs',
      points: [
        'Canada: Provincial parentage declarations or citizenship certificates based on genetic descent.',
        'Europe & Asia: Embassy-specific travel documents, apostille verifications, and cross-border adoption or parentage filings.',
        'Tailored legal liaison to match the exact requirements of your domestic nationality laws.',
      ],
    },
  ];

  const legalFaqs = [
    {
      question: 'Can a gestational surrogate legally claim parental rights over our child?',
      answer:
        'No. In gestational surrogacy, the surrogate carries an embryo created from the intended parents’ eggs/sperm or donor gametes, meaning she has zero genetic relationship to the child. Under Nigerian law, when combined with a pre-transfer Gestational Surrogacy Agreement and High Court parentage declarations, the intended parents are recognized as the sole lawful parents from the moment of birth.',
    },
    {
      question: 'Why is independent legal representation mandatory for the surrogate?',
      answer:
        'Dual independent representation eliminates conflicts of interest and ensures that the surrogate fully understands her rights, medical commitments, and compensation terms without any agency coercion. Furthermore, foreign courts and embassies (including the UK family court and US State Department) require documented proof that the surrogate received independent legal counsel before they issue parental orders or passports.',
    },
    {
      question: 'How are surrogate funds and living allowances protected during the pregnancy?',
      answer:
        'All surrogate reimbursements, allowances, and medical contingency funds are held in an independent, ring-fenced escrow account prior to the start of medications. Funds are never paid informally in cash; they are disbursed strictly according to pre-agreed clinical milestones certified by obstetric and clinic records.',
    },
    {
      question: 'How does international exit and passport issuance work for diaspora parents?',
      answer:
        'Our dedicated legal and consular liaison guides you through every step: registering the official birth certificate, coordinating embassy-accredited DNA chain-of-custody testing, assembling the consular application dossier (such as the US CRBA or British High Commission passport application), and assisting until you safely board your flight home.',
    },
    {
      question: 'How is donor and surrogate confidentiality protected under data privacy laws?',
      answer:
        'Zizo operates in strict compliance with the Nigeria Data Protection Act (NDPA 2023) and international data privacy principles. Intended parents receive curated, non-identifying donor and surrogate profiles. Identifying contact details, home addresses, and official identity documents are securely encrypted and never shared without mutual, explicit written authorization.',
    },
    {
      question: 'What happens in the rare event of an obstetric emergency during pregnancy?',
      answer:
        'Our ethical and legal charter places the surrogate’s health and bodily autonomy as the paramount priority. The Surrogacy Agreement clearly defines emergency medical protocols wherein qualified obstetricians and maternal-fetal medicine specialists make necessary clinical decisions to safeguard maternal life and wellbeing.',
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
    <div class="zizo-container space-y-[var(--space-xl)]">

      <!-- 1. The Four Ethical Pillars -->
      <div class="space-y-6">
        <div>
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Core Guarantees</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">Foundational legal &amp; ethical safeguards</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          ${safeguardPillars
            .map(
              (p) => `<div class="border border-[#E1E0DD] rounded-xl p-6 bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal flex flex-col justify-between">
            <div class="space-y-3">
              <div class="w-10 h-10 rounded-full bg-[#17645F]/10 flex items-center justify-center">
                <i data-lucide="${p.icon}" class="w-5 h-5 text-[#17645F]"></i>
              </div>
              <span class="inline-block text-[11px] uppercase tracking-wider font-semibold text-[#17645F]">${escapeHtml(p.tag)}</span>
              <h3 class="display text-[length:var(--fs-h4)] text-[#17191A]">${escapeHtml(p.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">${escapeHtml(p.desc)}</p>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 2. The 4-Stage Legal Roadmap -->
      <div class="space-y-6 reveal">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Legal Lifecycle</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">The four-stage parentage roadmap</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">
            Every legal step is sequenced chronologically to ensure absolute protection and unambiguous parental rights before, during, and after birth.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${legalRoadmap
            .map(
              (stage) => `<div class="border border-[#E1E0DD] rounded-2xl p-7 bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal flex flex-col justify-between space-y-5">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-4">
                <span class="display text-3xl font-light text-[#17645F]/40">${stage.step}</span>
                <span class="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#E1E0DD]/60 text-[#2E3031]">${escapeHtml(stage.timing)}</span>
              </div>
              <h3 class="display text-[length:var(--fs-h3)] text-[#17191A]">${escapeHtml(stage.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">${escapeHtml(stage.summary)}</p>
            </div>
            <div class="pt-4 border-t border-[#E1E0DD] space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-[#17191A]">Key Legal Deliverables</p>
              <ul class="space-y-2">
                ${stage.deliverables
                  .map(
                    (d) => `<li class="flex items-start gap-2.5 text-[length:var(--fs-small)] text-[#2E3031]">
                  <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                  <span>${escapeHtml(d)}</span>
                </li>`
                  )
                  .join('')}
              </ul>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 3. Tri-Party Protection Charter -->
      <div class="space-y-6 reveal">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Protection Charter</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">Rights guaranteed to every participant</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">
            True ethical surrogacy balances the security of intended parents with the dignity and bodily autonomy of surrogates and donors.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          ${partyProtections
            .map(
              (party) => `<div class="border border-[#E1E0DD] rounded-2xl p-7 bg-[#FAF9F6] shadow-sm flex flex-col justify-between space-y-6 reveal">
            <div class="space-y-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${party.badgeColor}">
                ${escapeHtml(party.badge)}
              </span>
              <h3 class="display text-[length:var(--fs-h3)] text-[#17191A]">${escapeHtml(party.title)}</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">${escapeHtml(party.subtitle)}</p>
              <div class="pt-2">
                <ul class="space-y-3">
                  ${party.items
                    .map(
                      (item) => `<li class="flex items-start gap-2.5 text-[length:var(--fs-small)] text-[#2E3031]">
                    <i data-lucide="shield-check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                    <span>${escapeHtml(item)}</span>
                  </li>`
                    )
                    .join('')}
                </ul>
              </div>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 4. Jurisdictional & Cross-Border Frameworks -->
      <div class="space-y-6 reveal">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Cross-Border Law</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">Jurisdictional alignment &amp; parentage recognition</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">
            How Nigerian reproductive agreements coordinate seamlessly with destination country immigration, consular citizenship, and parentage laws.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${jurisdictions
            .map(
              (j) => `<div class="border border-[#E1E0DD] rounded-2xl p-7 bg-[#FAF9F6] shadow-sm space-y-4 reveal">
            <div class="flex items-center justify-between gap-4 pb-3 border-b border-[#E1E0DD]">
              <h3 class="display text-[length:var(--fs-h4)] text-[#17191A]">${escapeHtml(j.country)}</h3>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#17645F]/10 text-[#17645F] border border-[#17645F]/20">${escapeHtml(j.flag || 'LAW')}</span>
            </div>
            <p class="text-xs font-semibold uppercase tracking-wider text-[#5D5E5F]">${escapeHtml(j.law)}</p>
            <ul class="space-y-2.5 pt-1">
              ${j.points
                .map(
                  (pt) => `<li class="flex items-start gap-2.5 text-[length:var(--fs-small)] text-[#2E3031]">
                <i data-lucide="check" class="w-4 h-4 text-[#17645F] mt-0.5 shrink-0"></i>
                <span class="leading-relaxed">${escapeHtml(pt)}</span>
              </li>`
                )
                .join('')}
            </ul>
          </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- 5. Interactive Legal FAQs -->
      <div class="space-y-6 reveal">
        <div class="max-w-2xl">
          <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">Common Inquiries</p>
          <h2 class="display text-[length:var(--fs-h2)] mt-1">Frequently asked legal &amp; ethical questions</h2>
          <p class="text-[length:var(--fs-body)] text-[#5D5E5F] mt-2">
            Answers to key questions regarding parental rights, custody decrees, surrogate autonomy, and consular exit.
          </p>
        </div>

        <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
          ${legalFaqs
            .map((faq, i) => {
              const pid = `legal-faq-${i}`;
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
      </div>

      <!-- 6. Legal Liaison Callout Banner -->
      <div class="p-8 sm:p-10 rounded-2xl bg-[#E1E0DD]/30 border border-[#E1E0DD] reveal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl">
          <h3 class="display text-2xl sm:text-3xl text-[#17191A]">Need legal clarity for your destination country?</h3>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F] leading-relaxed">
            Our legal liaison coordinates directly with qualified reproductive law solicitors in Nigeria, the UK, the US, Canada, and the EU to ensure your parentage orders and travel documents are unassailable.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <a href="/book/" class="btn-primary text-center">Book Consultation</a>
          <a href="/contact/" class="btn-secondary text-center">Contact Legal Liaison</a>
        </div>
      </div>

    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export const renderInternationalPage = renderProgramsByCountryPage;

export const renderPackagesPage = renderCostsPage;
