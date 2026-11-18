import {
  escapeHtml,
  pictureTag,
  renderClosingCta,
  renderFooter,
  renderHead,
  renderHeader,
  renderInteriorHero,
} from '../partials/layout.mjs';

function renderApplicationForm({ kind }) {
  const isSurrogate = kind === 'surrogate';
  const title = isSurrogate ? 'Initial Surrogate Application' : 'Initial Egg Donor Application';
  const eligibilityItems = isSurrogate
    ? [
        { name: 'elig_age', label: 'I am within the general adult eligibility age range (21–38 years)' },
        { name: 'elig_birth', label: 'I have had at least one uncomplicated full-term pregnancy and birth' },
        { name: 'elig_health', label: 'I am in good general health and do not smoke' },
      ]
    : [
        { name: 'elig_age', label: 'I am within the general adult donor age range (20–30 years)' },
        { name: 'elig_health', label: 'I am in good general and reproductive health and do not smoke' },
        { name: 'elig_availability', label: 'I am available for confidential clinic appointments and screening' },
      ];

  return `<form id="application-form-${kind}" data-zizo-form="application" data-app-kind="${kind}" class="space-y-4" novalidate>
    <input type="hidden" name="kind" value="${kind}" />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="app-name" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Full name</label>
        <input id="app-name" name="name" type="text" required class="input-field" autocomplete="name" />
      </div>
      <div>
        <label for="app-email" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Email address</label>
        <input id="app-email" name="email" type="email" required class="input-field" autocomplete="email" />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="app-phone" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Phone or WhatsApp number</label>
        <input id="app-phone" name="phone" type="tel" required class="input-field" autocomplete="tel" />
      </div>
      <div>
        <label for="app-age" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Age range</label>
        <select id="app-age" name="age_range" required class="input-field">
          <option value="">Select age range</option>
          <option value="20-24">20 – 24</option>
          <option value="25-29">25 – 29</option>
          <option value="30-34">30 – 34</option>
          <option value="35-38">35 – 38</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="app-country" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Country</label>
        <input id="app-country" name="country" type="text" value="Nigeria" required class="input-field" autocomplete="country-name" />
      </div>
      <div>
        <label for="app-city" class="block text-[length:var(--fs-small)] font-medium mb-1.5">City / State</label>
        <input id="app-city" name="city" type="text" required class="input-field" placeholder="e.g. Lagos" />
      </div>
    </div>

    <fieldset class="space-y-2.5 pt-2">
      <legend class="text-[length:var(--fs-small)] font-medium text-[#17191A] mb-1">General eligibility confirmations</legend>
      ${eligibilityItems
        .map(
          (item) => `<label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
        <input type="checkbox" name="${item.name}" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
        <span>${escapeHtml(item.label)}</span>
      </label>`
        )
        .join('')}
    </fieldset>

    <div>
      <label for="app-heard" class="block text-[length:var(--fs-small)] font-medium mb-1.5">How did you hear about Zizo?</label>
      <select id="app-heard" name="heard_from" class="input-field">
        <option value="Search">Search engine</option>
        <option value="Referral">Personal referral</option>
        <option value="Social Media">Social media</option>
        <option value="Clinic">Partner clinic</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <p class="text-xs text-[#5D5E5F]">
      Privacy notice: Please do not share medical records, government ID, photos, or bank details here. Those are handled privately later by a coordinator.
    </p>

    <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
      <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
      <span>I agree Zizo may contact me privately about ${isSurrogate ? 'surrogacy' : 'egg donation'} in accordance with the <a href="/privacy-policy/" class="text-[#17645F] underline">Privacy Policy</a>.</span>
    </label>

    <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
    <div class="flex flex-wrap items-center gap-4 pt-2">
      <button type="submit" class="btn-primary">Submit ${escapeHtml(title)}</button>
      <p class="text-[length:var(--fs-small)] text-[#17645F]" data-form-status aria-live="polite"></p>
    </div>
  </form>`;
}

export function renderBecomeSurrogatePage({ settings = {}, faqs = [], siteUrl = '' }) {
  return `${renderHead({
    title: 'Become a Surrogate | Zizo Donor and Surrogacy',
    description:
      'Learn about surrogate eligibility, screening, compensation, medical support, and anonymity protections with Zizo in Nigeria.',
    canonicalPath: '/surrogates-donors/become-a-surrogate/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Surrogates & Donors' },
      { label: 'Become a Surrogate' },
    ],
    title: 'Interested in becoming a surrogate?',
    intro:
      'At Zizo, gestational surrogates are valued, deeply respected, transparently compensated, and supported with attentive personal and medical care.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-center">
        <div class="lg:col-span-5 rounded-[var(--radius)] overflow-hidden aspect-[4/3] bg-[#E1E0DD] reveal">
          ${pictureTag({
            base: 'become-a-surrogate',
            alt: 'Warm portrait of a Nigerian woman in cream linen near a sunlit window',
            width: 1920,
            height: 1440,
            eager: true,
          })}
        </div>
        <div class="lg:col-span-7 space-y-4 reveal">
          <h2 class="display">What to expect with Zizo</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">
            Your journey starts with a confidential information call where you can ask anything without obligation. Before matching, qualified clinicians and independent counselors guide you through medical and psychological evaluations so you feel confident and supported.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-4">
              <h3 class="display text-lg mb-1">Dedicated Case Manager</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Regular check-ins, appointment coordination, and responsive support.</p>
            </div>
            <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-4">
              <h3 class="display text-lg mb-1">Protected Anonymity</h3>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Your personal identity is safeguarded throughout screening and matching.</p>
            </div>
          </div>
          <div class="pt-2">
            <a href="/book/" class="btn-secondary">Book a Surrogate Information Call</a>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start pt-4 border-t border-[#E1E0DD]">
        <div class="lg:col-span-5 space-y-5 reveal">
          <h2 class="display text-[length:var(--fs-h3)]">Screening steps &amp; support</h2>
          <ol class="space-y-3 text-[length:var(--fs-small)] list-decimal pl-5">
            <li>Submit this brief initial screening application or book an information call.</li>
            <li>Complete a private coordinator conversation covering lifestyle and expectations.</li>
            <li>Undergo clinical medical, obstetric, and independent psychological screening.</li>
            <li>Review independent legal terms and milestone compensation before any match begins.</li>
          </ol>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">All medical appointments, health screenings, and legal representation are fully coordinated for participating surrogates.</p>

          ${
            faqs.length > 0
              ? `<div class="pt-4 divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
            ${faqs
              .slice(0, 3)
              .map((faq, i) => {
                const pid = `surr-faq-${i}`;
                return `<div class="faq-item py-3.5" data-open="false">
              <button type="button" class="w-full flex items-center justify-between gap-3 text-left min-h-[44px]" aria-expanded="false" aria-controls="${pid}" data-faq-trigger>
                <span class="font-display text-base">${escapeHtml(faq.question)}</span>
                <span class="faq-plus shrink-0 w-7 h-7 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center"><i data-lucide="plus" class="w-4 h-4"></i></span>
              </button>
              <div id="${pid}" class="faq-panel"><div class="faq-panel-inner"><p class="pt-2 text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(faq.answer)}</p></div></div>
            </div>`;
              })
              .join('')}
          </div>`
              : ''
          }
        </div>

        <div class="lg:col-span-7 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] bg-[#FAF9F6] reveal">
          <h2 class="display text-[length:var(--fs-h3)] mb-2">Initial Surrogate Application</h2>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">Confidential first step — takes around 2 minutes.</p>
          ${renderApplicationForm({ kind: 'surrogate' })}
        </div>
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderBecomeEggDonorPage({ settings = {}, faqs = [], siteUrl = '' }) {
  return `${renderHead({
    title: 'Become an Egg Donor | Zizo Donor and Surrogacy',
    description:
      'Confidential, anonymous ovum donation with thorough medical screening, counseling support, and transparent care.',
    canonicalPath: '/surrogates-donors/become-an-egg-donor/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Surrogates & Donors' },
      { label: 'Become an Egg Donor' },
    ],
    title: 'Become an anonymous egg donor.',
    intro:
      'Compassionate clinical care, independent counseling, and strict anonymity for women considering ovum donation.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-center">
        <div class="lg:col-span-5 rounded-[var(--radius)] overflow-hidden aspect-[4/3] bg-[#E1E0DD] reveal">
          ${pictureTag({
            base: 'service-ovum-donation',
            alt: 'Coordinator speaking privately with a prospective egg donor',
            width: 1920,
            height: 1440,
            eager: true,
          })}
        </div>
        <div class="lg:col-span-7 space-y-4 reveal">
          <h2 class="display">Thoughtful donor care and privacy</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">
            Every egg donor is treated with warmth, clear medical explanations, and full privacy. Before joining our donor programme, you speak privately with a coordinator and complete health and ovarian-reserve evaluations at a vetted fertility clinic.
          </p>
          <div class="pt-2">
            <a href="/book/" class="btn-secondary">Book an Egg Donor Information Call</a>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start pt-4 border-t border-[#E1E0DD]">
        <div class="lg:col-span-5 space-y-5 reveal">
          <h2 class="display text-[length:var(--fs-h3)]">How donor screening works</h2>
          <ol class="space-y-3 text-[length:var(--fs-small)] list-decimal pl-5">
            <li>Submit this initial interest form for a private, no-obligation call.</li>
            <li>Review general health history and family background with our coordinator.</li>
            <li>Complete clinical fertility testing and confidential counselor assessment.</li>
            <li>Enter our anonymous donor profile registry with protected privacy.</li>
          </ol>

          ${
            faqs.length > 0
              ? `<div class="pt-4 divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
            ${faqs
              .slice(0, 3)
              .map((faq, i) => {
                const pid = `donor-faq-${i}`;
                return `<div class="faq-item py-3.5" data-open="false">
              <button type="button" class="w-full flex items-center justify-between gap-3 text-left min-h-[44px]" aria-expanded="false" aria-controls="${pid}" data-faq-trigger>
                <span class="font-display text-base">${escapeHtml(faq.question)}</span>
                <span class="faq-plus shrink-0 w-7 h-7 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center"><i data-lucide="plus" class="w-4 h-4"></i></span>
              </button>
              <div id="${pid}" class="faq-panel"><div class="faq-panel-inner"><p class="pt-2 text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(faq.answer)}</p></div></div>
            </div>`;
              })
              .join('')}
          </div>`
              : ''
          }
        </div>

        <div class="lg:col-span-7 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] bg-[#FAF9F6] reveal">
          <h2 class="display text-[length:var(--fs-h3)] mb-2">Initial Egg Donor Application</h2>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">Confidential first step — no medical documents required here.</p>
          ${renderApplicationForm({ kind: 'egg_donor' })}
        </div>
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderCompensationSupportPage({ settings = {}, siteUrl = '' }) {
  const cards = [
    {
      icon: 'shield-check',
      title: 'Milestone Escrow Protection',
      desc: 'Compensation and expense allowances follow clear, documented milestones held in dedicated escrow and reviewed with independent legal counsel.',
    },
    {
      icon: 'heart-pulse',
      title: 'Comprehensive Medical Coverage',
      desc: 'All clinical screenings, prenatal visits, laboratory evaluations, hospital delivery costs, and postpartum medical check-ups are fully covered.',
    },
    {
      icon: 'scale',
      title: 'Independent Legal Counsel',
      desc: 'Every surrogate is paired with independent reproductive legal counsel to ensure personal rights, informed consent, and compensation terms are fully protected.',
    },
    {
      icon: 'heart',
      title: 'Emotional Counseling & Wellness',
      desc: 'Confidential access to qualified reproductive counselors before, during, and after your journey whenever you need emotional guidance or reflection.',
    },
    {
      icon: 'message-square',
      title: 'Dedicated Case-Manager Access',
      desc: 'A personal coordinator assists with transportation logistics, appointment scheduling, allowance disbursements, and 24/7 emergency support.',
    },
    {
      icon: 'sparkles',
      title: 'Postpartum Recovery & Rest',
      desc: 'Continuous post-birth check-ins, recovery allowances, and dedicated support continue well after delivery to ensure your long-term health and wellbeing.',
    },
  ];

  return `${renderHead({
    title: 'Compensation and Support | Zizo Donor and Surrogacy',
    description:
      'Transparent surrogate and donor compensation, comprehensive medical coordination, counseling, and dedicated case-manager support.',
    canonicalPath: '/surrogates-donors/compensation-and-support/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Surrogates & Donors' },
      { label: 'Compensation and Support' },
    ],
    title: 'Transparent compensation<br class="hidden sm:inline" /> and attentive care.',
    intro:
      'Every surrogate and donor deserves clarity on reimbursements, medical coverage, and emotional support before making any commitment.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cards
        .map(
          (c) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-7 space-y-3 bg-[#FAF9F6] shadow-sm hover:border-[#8BB2AF]/60 transition-colors reveal flex flex-col justify-between">
        <div class="space-y-3">
          <i data-lucide="${c.icon}" class="w-6 h-6 text-[#17645F]"></i>
          <h2 class="display text-[length:var(--fs-h3)] text-[#17191A]">${escapeHtml(c.title)}</h2>
        </div>
        <p class="text-[length:var(--fs-small)] text-[#2E3031] leading-relaxed">${escapeHtml(c.desc)}</p>
      </div>`
        )
        .join('')}
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}
