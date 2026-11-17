import {
  escapeHtml,
  renderFooter,
  renderHead,
  renderHeader,
  renderInteriorHero,
  zizoLogoSvg,
} from '../partials/layout.mjs';

export function renderBookingPage({ consultationTypes = [], settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Book a Consultation | Zizo Donor and Surrogacy',
    description:
      'Schedule a confidential consultation with Zizo Donor and Surrogacy in your local timezone alongside Africa/Lagos (WAT).',
    canonicalPath: '/book/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Book a Consultation' }],
    title: 'Schedule a confidential consultation.',
    intro:
      'Choose a consultation type, pick an available date and time in your timezone, and connect privately via Google Meet, phone, or WhatsApp.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container max-w-4xl">
      <!-- Progress indicator -->
      <nav aria-label="Booking steps" class="mb-10">
        <ol class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="booking-steps-nav">
          <li data-step-indicator="1" class="border border-[#17645F] bg-[#8BB2AF]/20 rounded-[var(--radius)] p-3 text-[length:var(--fs-small)] font-semibold text-[#17191A]">
            <span class="text-xs text-[#17645F] block">Step 1</span>Choose type
          </li>
          <li data-step-indicator="2" class="border border-[#E1E0DD] rounded-[var(--radius)] p-3 text-[length:var(--fs-small)] text-[#5D5E5F]">
            <span class="text-xs block">Step 2</span>Date &amp; time
          </li>
          <li data-step-indicator="3" class="border border-[#E1E0DD] rounded-[var(--radius)] p-3 text-[length:var(--fs-small)] text-[#5D5E5F]">
            <span class="text-xs block">Step 3</span>Your details
          </li>
          <li data-step-indicator="4" class="border border-[#E1E0DD] rounded-[var(--radius)] p-3 text-[length:var(--fs-small)] text-[#5D5E5F]">
            <span class="text-xs block">Step 4</span>Confirm
          </li>
        </ol>
      </nav>

      <div id="booking-app" class="border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] bg-[#FAF9F6]" data-consultation-types="${escapeHtml(JSON.stringify(consultationTypes))}">
        <!-- Step 1: Consultation Types -->
        <div id="booking-step-1" class="space-y-6">
          <div>
            <h2 class="display text-[length:var(--fs-h3)]">1. Choose a consultation type</h2>
            <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mt-1">Select the conversation that best matches where you are today.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="consultation-type-list">
            ${consultationTypes
              .map(
                (ct) => `<button type="button" data-select-type="${escapeHtml(ct.id)}" class="text-left border border-[#E1E0DD] hover:border-[#17645F] rounded-[var(--radius)] p-5 space-y-2.5 transition-colors focus-visible:outline-[#17645F]">
              <div class="flex items-center justify-between gap-2">
                <span class="font-display text-xl text-[#17191A]">${escapeHtml(ct.name)}</span>
                <div class="text-right shrink-0">
                  <span class="text-xs font-semibold text-[#17645F] tabular-nums block">${Number(ct.duration_min)} min</span>
                  <span class="text-xs text-[#5D5E5F] font-medium">${ct.price_minor > 0 ? `₦${(ct.price_minor / 100).toLocaleString()}` : 'Free'}</span>
                </div>
              </div>
              <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(ct.intro)}</p>
              <p class="text-xs text-[#5D5E5F]">Channels: ${escapeHtml((Array.isArray(ct.channels) ? ct.channels : JSON.parse(ct.channels || '[]')).join(' · '))}</p>
            </button>`
              )
              .join('')}
          </div>
        </div>

        <!-- Step 2: Date & Time -->
        <div id="booking-step-2" class="hidden space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="display text-[length:var(--fs-h3)]">2. Pick a date and time</h2>
              <p id="tz-display" class="text-[length:var(--fs-small)] text-[#5D5E5F] mt-1">Detecting your timezone…</p>
            </div>
            <button type="button" data-goto-step="1" class="btn-secondary !py-2 !px-4">Change type</button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div class="lg:col-span-7 border border-[#E1E0DD] rounded-[var(--radius)] p-4">
              <div class="flex items-center justify-between mb-4">
                <button type="button" id="cal-prev-month" class="w-10 h-10 rounded-[var(--radius)] border border-[#E1E0DD] inline-flex items-center justify-center" aria-label="Previous month">
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <h3 id="cal-month-label" class="font-display text-lg">Month Year</h3>
                <button type="button" id="cal-next-month" class="w-10 h-10 rounded-[var(--radius)] border border-[#E1E0DD] inline-flex items-center justify-center" aria-label="Next month">
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
              </div>
              <div class="grid grid-cols-7 text-center text-xs text-[#5D5E5F] font-medium mb-2">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div id="cal-grid" class="grid grid-cols-7 gap-1.5" role="grid" aria-label="Available consultation dates"></div>
            </div>

            <div class="lg:col-span-5 space-y-3">
              <p id="selected-date-label" class="font-medium text-[length:var(--fs-small)] text-[#17191A]">Select an available day on the calendar</p>
              <div id="slots-list" class="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1" aria-live="polite"></div>
            </div>
          </div>
        </div>

        <!-- Step 3: Details -->
        <div id="booking-step-3" class="hidden space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="display text-[length:var(--fs-h3)]">3. Your details</h2>
              <p id="booking-summary-banner" class="text-[length:var(--fs-small)] text-[#17645F] mt-1"></p>
            </div>
            <button type="button" data-goto-step="2" class="btn-secondary !py-2 !px-4">Change time</button>
          </div>

          <form id="booking-details-form" class="space-y-4" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="bk-name" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Full name</label>
                <input id="bk-name" name="name" type="text" required class="input-field" autocomplete="name" />
              </div>
              <div>
                <label for="bk-email" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Email address</label>
                <input id="bk-email" name="email" type="email" required class="input-field" autocomplete="email" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="bk-phone" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Phone or WhatsApp number</label>
                <input id="bk-phone" name="phone" type="tel" required class="input-field" autocomplete="tel" />
              </div>
              <div>
                <label for="bk-country" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Country</label>
                <input id="bk-country" name="country" type="text" required class="input-field" autocomplete="country-name" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="bk-audience" class="block text-[length:var(--fs-small)] font-medium mb-1.5">I am an</label>
                <select id="bk-audience" name="audience" required class="input-field">
                  <option value="Intended Parent">Intended Parent</option>
                  <option value="Surrogate">Surrogate</option>
                  <option value="Egg Donor">Egg Donor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label for="bk-channel" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Preferred channel</label>
                <select id="bk-channel" name="channel" required class="input-field"></select>
              </div>
            </div>
            <div>
              <label for="bk-note" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Short note (optional)</label>
              <textarea id="bk-note" name="note" rows="3" maxlength="600" class="input-field"></textarea>
              <p class="text-xs text-[#5D5E5F] mt-1">Please do not include medical details here.</p>
            </div>
            <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
              <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
              <span>I consent to Zizo contacting me regarding this consultation under the <a href="/privacy-policy/" class="text-[#17645F] underline">Privacy Policy</a>.</span>
            </label>
            <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
            <div id="bk-error" class="text-[length:var(--fs-small)] text-red-700" role="alert" aria-live="assertive"></div>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" class="btn-primary">Review &amp; Confirm</button>
            </div>
          </form>
        </div>

        <!-- Step 4: Confirm -->
        <div id="booking-step-4" class="hidden space-y-6">
          <h2 class="display text-[length:var(--fs-h3)]">4. Confirm your consultation</h2>
          <div id="booking-confirm-review" class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-2 text-[length:var(--fs-small)] bg-[#E1E0DD]/25"></div>
          <div id="booking-submit-error" class="text-[length:var(--fs-small)] text-red-700" role="alert" aria-live="assertive"></div>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" id="confirm-booking-btn" class="btn-primary">Confirm Booking</button>
            <button type="button" data-goto-step="3" class="btn-secondary">Edit Details</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
${renderFooter({
  settings,
  hideStickyBar: true,
  extraScripts: '<script type="module" src="/assets/js/booking.js"></script>',
})}`;
}

export function renderBookingConfirmedPage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Consultation Confirmed | Zizo Donor and Surrogacy',
    description: 'Your Zizo consultation details, calendar file, and private manage link.',
    canonicalPath: '/book/confirmed/',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content" class="pt-36 pb-24">
  <div class="zizo-container max-w-2xl">
    <div id="booking-confirmed-panel" class="border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] space-y-6 bg-[#FAF9F6]">
      <div class="w-12 h-12 rounded-full bg-[#8BB2AF]/30 text-[#17645F] inline-flex items-center justify-center">
        <i data-lucide="calendar-check" class="w-6 h-6"></i>
      </div>
      <h1 class="display text-[length:var(--fs-h2)]">Your consultation is scheduled.</h1>
      <div id="confirmed-summary" class="space-y-2 text-[length:var(--fs-body)] text-[#2E3031]">
        <p>Loading confirmation details…</p>
      </div>
      <div id="confirmed-actions" class="flex flex-wrap items-center gap-3 pt-2"></div>
    </div>
  </div>
</main>
${renderFooter({
  settings,
  hideStickyBar: true,
  extraScripts: '<script type="module" src="/assets/js/booking-confirmed.js"></script>',
})}`;
}

export function renderBookingManagePage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Manage Consultation | Zizo Donor and Surrogacy',
    description: 'Reschedule or cancel your consultation privately using your single-purpose link.',
    canonicalPath: '/book/manage/',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content" class="pt-36 pb-24">
  <div class="zizo-container max-w-3xl">
    <div id="manage-booking-app" class="border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] space-y-6 bg-[#FAF9F6]">
      <h1 class="display text-[length:var(--fs-h2)]">Manage your consultation</h1>
      <div id="manage-status" class="text-[length:var(--fs-body)] text-[#2E3031]">Verifying your secure consultation link…</div>
      <div id="manage-controls" class="hidden space-y-6"></div>
    </div>
  </div>
</main>
${renderFooter({
  settings,
  hideStickyBar: true,
  extraScripts: '<script type="module" src="/assets/js/booking-manage.js"></script>',
})}`;
}

export function renderAdminPage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Staff Portal & Admin Dashboard | Zizo Donor and Surrogacy',
    description: 'Zizo Donor and Surrogacy staff authentication and operations dashboard.',
    canonicalPath: '/admin/',
    noindex: true,
    extraHead: `
  <script src="/assets/vendor/marked.umd.js" defer></script>
  <script src="/assets/vendor/purify.min.js" defer></script>`,
    siteUrl,
  })}
<div id="admin-root" class="min-h-screen bg-[#FAF9F6] text-[#17191A]">
  <!-- AUTH VIEW -->
  <div id="admin-auth-screen" class="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
    <div class="w-full max-w-md border border-[#E1E0DD] rounded-[var(--radius)] bg-[#FAF9F6] p-8 space-y-6">
      <div class="flex items-center justify-between">
        <a href="/" class="inline-flex items-center gap-2.5 text-[#17191A]">
          ${zizoLogoSvg()}
          <span class="font-display text-xl font-semibold">Zizo Staff Portal</span>
        </a>
        <span class="text-xs text-[#5D5E5F]">Secure Staff Access</span>
      </div>

      <!-- Step 1: Email & Password -->
      <form id="admin-login-form" class="space-y-4" novalidate>
        <div>
          <h1 class="display text-2xl mb-1">Staff sign in</h1>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Sign in with your authorized staff email and password.</p>
        </div>
        <div>
          <label for="auth-email" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Email address</label>
          <input id="auth-email" name="email" type="email" required class="input-field" autocomplete="username" />
        </div>
        <div>
          <label for="auth-password" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Password</label>
          <input id="auth-password" name="password" type="password" required class="input-field" autocomplete="current-password" />
        </div>
        <div id="auth-login-error" class="text-[length:var(--fs-small)] text-red-700" role="alert" aria-live="assertive"></div>
        <button type="submit" class="btn-primary w-full justify-center">Sign in to Dashboard</button>
        <div class="pt-3 border-t border-[#E1E0DD] text-xs text-[#5D5E5F] space-y-1">
          <p>Sessions automatically lock after 30 minutes of inactivity.</p>
          <p><a href="/" class="text-[#17645F] underline">Return to public website</a></p>
        </div>
      </form>
    </div>
  </div>

  <!-- DASHBOARD WORKSPACE -->
  <div id="admin-workspace" class="hidden min-h-screen flex flex-col lg:flex-row">
    <aside class="w-full lg:w-64 bg-[#17191A] text-[#FAF9F6] surface-dark shrink-0 flex flex-col justify-between p-5 border-b lg:border-b-0 lg:border-r border-[#FAF9F6]/10">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <a href="/" class="inline-flex items-center gap-2.5 text-[#FAF9F6]">
            ${zizoLogoSvg()}
            <span class="font-display text-lg font-semibold">Zizo Admin</span>
          </a>
        </div>

        <div class="border border-[#FAF9F6]/15 rounded-[var(--radius)] p-3 text-xs space-y-1">
          <p class="font-semibold text-[#FAF9F6]" id="admin-user-name">Staff</p>
          <p class="text-[#8BB2AF] uppercase tracking-[0.08em]" id="admin-user-role">role</p>
        </div>

        <nav id="admin-nav" class="space-y-1 text-[length:var(--fs-small)]" aria-label="Admin sections">
          <button type="button" data-admin-tab="overview" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Overview</button>
          <button type="button" data-admin-tab="bookings" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Bookings</button>
          <button type="button" data-admin-tab="availability" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Availability &amp; Types</button>
          <button type="button" data-admin-tab="inquiries" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Inquiries &amp; Applications</button>
          <button type="button" data-admin-tab="reviews" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Reviews &amp; Testimonials</button>
          <button type="button" data-admin-tab="blog" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Blog CMS</button>
          <button type="button" data-admin-tab="faqs" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">FAQs</button>
          <button type="button" data-admin-tab="subscribers" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Subscribers</button>
          <button type="button" data-admin-tab="settings" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Site Settings</button>
          <button type="button" data-admin-tab="audit" class="w-full text-left px-3 py-2.5 rounded-[var(--radius)] hover:bg-[#FAF9F6]/10 transition-colors">Audit Log</button>
        </nav>
      </div>

      <div class="pt-6 border-t border-[#FAF9F6]/15 space-y-3 text-xs">
        <p class="text-[#FAF9F6]/65 tabular-nums">Session idle lock: <span id="session-idle-timer">30:00</span></p>
        <button type="button" id="admin-logout-btn" class="w-full btn-secondary-light !py-2">Sign out</button>
      </div>
    </aside>

    <main id="main-content" class="flex-1 p-6 lg:p-10 overflow-x-auto">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E1E0DD]">
          <h1 id="admin-section-title" class="display text-[length:var(--fs-h2)]">Overview</h1>
          <div id="admin-top-actions" class="flex flex-wrap items-center gap-2.5"></div>
        </div>
        <div id="admin-content" aria-live="polite">
          <p class="text-[#5D5E5F]">Loading workspace…</p>
        </div>
      </div>
    </main>
  </div>
</div>

<div id="admin-modal" role="dialog" aria-modal="true" class="hidden fixed inset-0 z-[70] bg-[#17191A]/60 flex items-center justify-center p-4">
  <div class="bg-[#FAF9F6] text-[#17191A] border border-[#E1E0DD] rounded-[var(--radius)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-[#E1E0DD]">
      <h2 id="admin-modal-title" class="display text-xl">Edit</h2>
      <button type="button" id="admin-modal-close" class="w-10 h-10 rounded border border-[#E1E0DD] inline-flex items-center justify-center" aria-label="Close dialog">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
    <div id="admin-modal-body"></div>
  </div>
</div>

<div id="zizo-toast" role="status" aria-live="polite" class="hidden fixed bottom-6 right-6 z-[70] bg-[#17191A] text-[#FAF9F6] border border-[#FAF9F6]/20 rounded-[var(--radius)] px-4 py-3 text-[length:var(--fs-small)] shadow-lg max-w-sm"></div>
<script src="/assets/vendor/lucide.min.js" defer></script>
<script type="module" src="/assets/js/admin.js"></script>
</body>
</html>`;
}
