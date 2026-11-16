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
      'Thoughtful cross-border coordination tailored to Nigeria, Europe, Asia, Canada, and the United States.',
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
    'Clinic scheduling and cycle-support coordination',
    'Referrals to independent reproductive legal counsel',
    'Milestone compensation administration and transparent reporting',
  ];

  const tiers = [
    {
      name: 'Donor Coordination Pathway',
      audience: 'Intended parents seeking anonymous ovum donation coordination',
      estimate: 'Request a personalised estimate',
      notes: 'Clinical IVF laboratory fees and legal fees are itemised separately by partner providers.',
    },
    {
      name: 'Nigeria Surrogacy Programme',
      audience: 'Local and diaspora intended parents coordinating within Nigeria',
      estimate: 'Request a personalised estimate',
      notes: 'Structured in clear milestone stages after initial medical and legal review.',
    },
    {
      name: 'Cross-Border Programme Planning',
      audience: 'International pathways across Europe, Asia, Canada, and the United States',
      estimate: 'Request a personalised estimate',
      notes: 'Tailored around destination clinic fees, travel logistics, and independent legal counsel.',
    },
  ];

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
    note: 'Specific package figures vary by region and medical needs. Request a personalised written estimate below.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${tiers
          .map(
            (t) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-7 flex flex-col justify-between gap-6 bg-[#FAF9F6] reveal">
          <div class="space-y-3">
            <h2 class="display text-[length:var(--fs-h3)]">${escapeHtml(t.name)}</h2>
            <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">${escapeHtml(t.audience)}</p>
            <p class="font-display text-xl text-[#17645F] pt-2">${escapeHtml(t.estimate)}</p>
            <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(t.notes)}</p>
          </div>
          <a href="#cost-estimate-form" class="btn-secondary w-full justify-center">Request estimate</a>
        </div>`
          )
          .join('')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start pt-4">
        <div class="lg:col-span-5 space-y-4 reveal">
          <h2 class="display text-[length:var(--fs-h3)]">What coordination covers</h2>
          <ul class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]">
            ${includedItems
              .map((i) => `<li class="py-3.5 text-[length:var(--fs-small)]">${escapeHtml(i)}</li>`)
              .join('')}
          </ul>
          <p class="text-xs text-[#5D5E5F]">
            Compensation for gestational surrogates follows transparent, milestone-based schedules confirmed in independent legal agreements.
          </p>
        </div>

        <div class="lg:col-span-7 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] bg-[#FAF9F6] reveal">
          <h2 class="display text-[length:var(--fs-h3)] mb-2">Request a personalised cost estimate</h2>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">
            Share your preferred service and region. Please do not include medical records here.
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
                <label for="ce-region" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Preferred programme region</label>
                <select id="ce-region" name="preferred_region" class="input-field">
                  <option value="Nigeria">Nigeria</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="Undecided">Not yet decided</option>
                </select>
              </div>
            </div>
            <div>
              <label for="ce-message" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Services of interest</label>
              <textarea id="ce-message" name="message" rows="3" required class="input-field" placeholder="For example: Gestational surrogacy and egg donation planning"></textarea>
            </div>
            <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
              <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-[#17645F]" />
              <span>I consent to Zizo contacting me with an estimate under the <a href="/privacy-policy/" class="text-[#17645F] underline">Privacy Policy</a>.</span>
            </label>
            <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
            <div class="flex flex-wrap items-center gap-4">
              <button type="submit" class="btn-primary">Request Estimate</button>
              <p class="text-[length:var(--fs-small)] text-[#17645F]" data-form-status aria-live="polite"></p>
            </div>
          </form>
        </div>
      </div>

      ${
        faqs.length > 0
          ? `<div class="space-y-4 reveal">
        <h2 class="display text-[length:var(--fs-h3)]">Cost &amp; legal FAQs</h2>
        <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
          ${faqs
            .slice(0, 4)
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
      </div>`
          : ''
      }
    </div>
  </section>

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
      body: 'Every party should receive independent advice from qualified reproductive legal counsel in the relevant jurisdiction before executing any agreement. {{LEGAL_REVIEW_REQUIRED}}',
    },
    {
      title: 'Informed Consent & Ethical Screening',
      body: 'No matching proceeds without documented medical, psychological, and counselor readiness assessments. Participants may ask questions or pause without pressure.',
    },
    {
      title: 'Transparent Compensation Standards',
      body: 'Reimbursements and surrogate compensation are structured transparently around documented milestones and health-care protections. {{LEGAL_REVIEW_REQUIRED}}',
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
    note: 'General information only, not legal advice. All jurisdiction-specific guidance is provided by independent legal counsel ({{LEGAL_REVIEW_REQUIRED}}).',
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
