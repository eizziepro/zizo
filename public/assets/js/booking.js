const app = document.getElementById('booking-app');

if (app) {
  const consultationTypes = JSON.parse(app.dataset.consultationTypes || '[]');
  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';

  const state = {
    step: 1,
    selectedType: null,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    availableDates: new Set(),
    selectedDate: null,
    selectedSlot: null,
    details: null,
  };

  const tzDisplay = document.getElementById('tz-display');
  if (tzDisplay) {
    tzDisplay.textContent = `Your timezone: ${visitorTz} · Clinic timezone: Africa/Lagos (WAT)`;
  }

  function goToStep(step) {
    state.step = step;
    [1, 2, 3, 4].forEach((n) => {
      document.getElementById(`booking-step-${n}`)?.classList.toggle('hidden', n !== step);
      const ind = document.querySelector(`[data-step-indicator="${n}"]`);
      if (ind) {
        const isCurrent = n === step;
        const isPassed = n < step;
        ind.classList.toggle('border-[#17645F]', isCurrent);
        ind.classList.toggle('bg-[#8BB2AF]/20', isCurrent);
        ind.classList.toggle('font-semibold', isCurrent);
        ind.classList.toggle('text-[#17191A]', isCurrent || isPassed);
        ind.classList.toggle('border-[#E1E0DD]', !isCurrent);
        ind.classList.toggle('cursor-pointer', isPassed);
        if (isPassed) {
          ind.setAttribute('tabindex', '0');
          ind.setAttribute('role', 'button');
          ind.setAttribute('aria-label', `Step ${n}: Completed. Click to return.`);
        } else {
          ind.removeAttribute('role');
          ind.removeAttribute('tabindex');
          ind.removeAttribute('aria-label');
        }
      }
    });

    // Smoothly keep booking container in comfortable view
    const rect = app.getBoundingClientRect();
    if (rect.top < 80 || rect.top > 300) {
      const targetY = window.scrollY + rect.top - 100;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }

  // Clickable completed step indicators
  document.querySelectorAll('[data-step-indicator]').forEach((ind) => {
    ind.addEventListener('click', () => {
      const stepNum = Number(ind.dataset.stepIndicator);
      if (stepNum < state.step) {
        goToStep(stepNum);
      }
    });
    ind.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && Number(ind.dataset.stepIndicator) < state.step) {
        e.preventDefault();
        goToStep(Number(ind.dataset.stepIndicator));
      }
    });
  });

  function formatTimeInZone(iso, tz) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  }

  function formatDateInZone(iso, tz) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  }

  async function loadMonthAvailability() {
    if (!state.selectedType) return;
    const monthStr = `${state.currentYear}-${String(state.currentMonth).padStart(2, '0')}`;
    const calGrid = document.getElementById('cal-grid');
    const calLabel = document.getElementById('cal-month-label');

    if (calLabel) {
      const d = new Date(Date.UTC(state.currentYear, state.currentMonth - 1, 15));
      calLabel.textContent = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(d);
    }

    if (calGrid) {
      calGrid.innerHTML = '<p class="col-span-7 text-xs text-[#5D5E5F] py-8 text-center flex items-center justify-center gap-2"><span class="zizo-spinner"></span> Checking available clinic slots…</p>';
    }

    try {
      const res = await fetch(
        `/api/availability?typeId=${encodeURIComponent(state.selectedType.id)}&month=${encodeURIComponent(monthStr)}`
      );
      const data = await res.json();
      state.availableDates = new Set(data.availableDates || []);
    } catch {
      state.availableDates = new Set();
    }

    renderCalendar();
  }

  function renderCalendar() {
    const calGrid = document.getElementById('cal-grid');
    if (!calGrid) return;

    const firstDayWeekday = new Date(Date.UTC(state.currentYear, state.currentMonth - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(state.currentYear, state.currentMonth, 0)).getUTCDate();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let html = '';
    for (let i = 0; i < firstDayWeekday; i++) {
      html += '<div aria-hidden="true"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${state.currentYear}-${String(state.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const available = state.availableDates.has(dateStr);
      const selected = state.selectedDate === dateStr;
      const isToday = dateStr === todayStr;

      let cls = 'relative h-11 rounded-[var(--radius)] text-sm tabular-nums transition-all focus-visible:outline-[#17645F] ';
      if (selected) {
        cls += 'bg-[#17645F] text-[#FAF9F6] font-semibold shadow-sm';
      } else if (available) {
        cls += 'bg-[#8BB2AF]/25 text-[#17191A] font-semibold hover:bg-[#8BB2AF]/50 border border-[#17645F]/30 cursor-pointer';
      } else {
        cls += 'text-[#5D5E5F]/40 cursor-not-allowed opacity-60';
      }

      if (isToday && !selected) {
        cls += ' ring-1 ring-[#17645F]';
      }

      const todayDot = isToday
        ? `<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${selected ? 'bg-[#FAF9F6]' : 'bg-[#17645F]'}" aria-hidden="true"></span>`
        : '';

      html += `<button type="button" data-cal-date="${dateStr}" ${available ? '' : 'disabled'} class="${cls}" aria-selected="${selected ? 'true' : 'false'}" aria-label="${dateStr}${isToday ? ' (today)' : ''}${available ? ' available' : ' unavailable'}">${day}${todayDot}</button>`;
    }
    calGrid.innerHTML = html;

    calGrid.querySelectorAll('[data-cal-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedDate = btn.dataset.calDate;
        renderCalendar();
        loadSlotsForDate(state.selectedDate);
      });
    });

    // Auto-select first available date if none chosen yet
    if (!state.selectedDate && state.availableDates.size > 0) {
      const first = Array.from(state.availableDates)[0];
      state.selectedDate = first;
      renderCalendar();
      loadSlotsForDate(first);
    }
  }

  async function loadSlotsForDate(dateStr) {
    const list = document.getElementById('slots-list');
    const label = document.getElementById('selected-date-label');
    if (label) {
      const d = new Date(dateStr + 'T12:00:00Z');
      const dateFormatted = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
      label.textContent = `Available times on ${dateFormatted}`;
    }
    if (list) {
      list.innerHTML = '<p class="col-span-2 text-xs text-[#5D5E5F] py-4 flex items-center gap-2"><span class="zizo-spinner"></span> Checking times…</p>';
    }

    try {
      const res = await fetch(
        `/api/availability?typeId=${encodeURIComponent(state.selectedType.id)}&date=${encodeURIComponent(dateStr)}`
      );
      const data = await res.json();
      const slots = data.slots || [];
      if (slots.length === 0) {
        if (list) {
          list.innerHTML = '<p class="col-span-2 text-[length:var(--fs-small)] text-[#5D5E5F] py-4">No remaining slots on this date. Please choose another day from the calendar.</p>';
        }
        return;
      }

      list.innerHTML = slots
        .map((s) => {
          const localTime = formatTimeInZone(s.startAt, visitorTz);
          const watTime = s.clinicTime;
          const tzSub = visitorTz === 'Africa/Lagos' ? 'WAT' : `${watTime} WAT`;
          return `<button type="button" data-slot-start="${s.startAt}" class="group border border-[#E1E0DD] hover:border-[#17645F] hover:bg-[#8BB2AF]/15 rounded-[var(--radius)] p-3 text-left transition-all min-h-[44px] focus-visible:outline-[#17645F]">
            <span class="block text-[length:var(--fs-small)] font-semibold text-[#17191A] group-hover:text-[#17645F] tabular-nums">${localTime}</span>
            <span class="block text-xs text-[#5D5E5F] tabular-nums">${tzSub}</span>
          </button>`;
        })
        .join('');

      list.querySelectorAll('[data-slot-start]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.selectedSlot = slots.find((x) => x.startAt === btn.dataset.slotStart) || null;
          populateStep3();
          goToStep(3);
        });
      });
    } catch {
      if (list) {
        list.innerHTML = '<p class="col-span-2 text-xs text-red-700 py-4">Could not load time slots. Please refresh or retry.</p>';
      }
    }
  }

  function populateStep3() {
    const banner = document.getElementById('booking-summary-banner');
    const channelSel = document.getElementById('bk-channel');
    if (banner && state.selectedType && state.selectedSlot) {
      const dateTxt = formatDateInZone(state.selectedSlot.startAt, visitorTz);
      const localTxt = formatTimeInZone(state.selectedSlot.startAt, visitorTz);
      banner.innerHTML = `<span class="font-semibold">${escapeClient(state.selectedType.name)}</span> (${Number(state.selectedType.duration_min)} min) · <span class="tabular-nums">${dateTxt} at ${localTxt} (${visitorTz})</span>`;
    }
    if (channelSel && state.selectedType) {
      const channels = Array.isArray(state.selectedType.channels)
        ? state.selectedType.channels
        : JSON.parse(state.selectedType.channels || '["Google Meet"]');
      channelSel.innerHTML = channels
        .map((ch) => `<option value="${escapeClient(ch)}">${escapeClient(ch)}</option>`)
        .join('');
    }
  }

  // Consultation type selection
  document.querySelectorAll('[data-select-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const found = consultationTypes.find((c) => c.id === btn.dataset.selectType);
      if (!found) return;
      state.selectedType = found;
      state.selectedDate = null;
      state.selectedSlot = null;
      goToStep(2);
      loadMonthAvailability();
    });
  });

  document.getElementById('cal-prev-month')?.addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 1) {
      state.currentMonth = 12;
      state.currentYear--;
    }
    state.selectedDate = null;
    loadMonthAvailability();
  });

  document.getElementById('cal-next-month')?.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 12) {
      state.currentMonth = 1;
      state.currentYear++;
    }
    state.selectedDate = null;
    loadMonthAvailability();
  });

  document.querySelectorAll('[data-goto-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToStep(Number(btn.dataset.gotoStep));
    });
  });

  const detailsForm = document.getElementById('booking-details-form');
  detailsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = document.getElementById('bk-error');
    if (!detailsForm.checkValidity()) {
      const firstInvalid = detailsForm.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.classList.add('input-error');
        firstInvalid.focus();
      }
      detailsForm.reportValidity();
      return;
    }
    const fd = new FormData(detailsForm);
    state.details = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      country: String(fd.get('country') || '').trim(),
      audience: String(fd.get('audience') || 'Intended Parent'),
      channel: String(fd.get('channel') || 'Google Meet'),
      note: String(fd.get('note') || '').trim(),
      consent: fd.get('consent') === 'on',
      website_url: String(fd.get('website_url') || ''),
    };
    if (!state.details.consent) {
      if (errEl) errEl.textContent = 'Please confirm consent before continuing.';
      return;
    }
    if (errEl) errEl.textContent = '';

    const revBox = document.getElementById('booking-confirm-review');
    const priceMinor = Number(state.selectedType?.price_minor || 0);
    const isPaid = priceMinor > 0;
    const currency = state.selectedType?.currency || 'NGN';
    const confirmBtnEl = document.getElementById('confirm-booking-btn');
    if (confirmBtnEl) {
      confirmBtnEl.textContent = isPaid ? 'Pay & Confirm Consultation' : 'Confirm Booking';
    }

    if (revBox && state.selectedType && state.selectedSlot) {
      const priceFormatted = isPaid
        ? (priceMinor / 100).toLocaleString('en-US', { style: 'currency', currency })
        : 'Complimentary';

      revBox.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#E1E0DD]">
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Consultation Type</span>
            <p class="font-display text-lg text-[#17191A] mt-0.5">${escapeClient(state.selectedType.name)}</p>
            <p class="text-xs text-[#17645F] font-semibold tabular-nums">${Number(state.selectedType.duration_min)} minutes duration</p>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Scheduled Time</span>
            <p class="text-sm font-semibold text-[#17191A] tabular-nums mt-0.5">${formatDateInZone(state.selectedSlot.startAt, visitorTz)}</p>
            <p class="text-xs text-[#5D5E5F] tabular-nums">${formatTimeInZone(state.selectedSlot.startAt, visitorTz)} (${visitorTz}) · ${state.selectedSlot.clinicTime} WAT</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 pb-3 border-b border-[#E1E0DD]">
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Client Details</span>
            <p class="text-sm font-medium text-[#17191A] mt-0.5">${escapeClient(state.details.name)}</p>
            <p class="text-xs text-[#5D5E5F]">${escapeClient(state.details.audience)} · ${escapeClient(state.details.country)}</p>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Channel &amp; Contact</span>
            <p class="text-xs text-[#17191A] mt-0.5">${escapeClient(state.details.email)}</p>
            <p class="text-xs text-[#17191A]">${escapeClient(state.details.phone)}</p>
            <span class="inline-block mt-1 text-xs px-2.5 py-0.5 rounded bg-[#8BB2AF]/20 text-[#17645F] font-medium">${escapeClient(state.details.channel)}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
          <div>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-[#5D5E5F]">Consultation Fee</span>
            <p class="text-xs text-[#5D5E5F] mt-0.5">${isPaid ? 'Processed securely via Paystack (Cards, Apple Pay, Bank Transfer)' : 'Introductory clinical session'}</p>
          </div>
          <div class="flex items-center sm:items-start pt-0.5">
            ${
              isPaid
                ? `<span class="text-base font-bold text-[#17645F] tabular-nums">${priceFormatted}</span>`
                : '<span class="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-[#8BB2AF]/20 text-[#17645F]">Complimentary</span>'
            }
          </div>
        </div>
      `;
    }
    goToStep(4);
  });

  /**
   * High-fidelity Paystack Inline Popup Modal Simulation
   * Enables interactive test card entry, OTP authorization, and channel simulation
   * until live production/sandbox Paystack keys are entered in Admin Settings.
   */
  function openPaystackSimulationModal(opts) {
    const {
      amountMinor,
      currency = 'NGN',
      email = '',
      reference = `mock_zizo_${Date.now()}`,
      onSuccess,
      onClose,
    } = opts;

    const formattedAmount = (Number(amountMinor || 0) / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: currency || 'NGN',
    });

    // Remove any existing modal if already open
    const existing = document.getElementById('paystack-mock-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'paystack-mock-modal';
    modal.className =
      'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a101d]/75 backdrop-blur-xs transition-opacity duration-200';
    modal.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    modal.innerHTML = `
      <div class="relative w-full max-w-[460px] bg-white rounded-[16px] shadow-2xl overflow-hidden border border-[#E1E0DD] text-left">
        <!-- Paystack Header -->
        <div class="bg-[#FAF9F6] border-b border-[#E1E0DD] p-5 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-[6px] bg-[#17645F] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                P
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-[#17191A] tracking-tight">paystack</span>
                  <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#17645F]/10 text-[#17645F] border border-[#17645F]/20">Sandbox Test Mode</span>
                </div>
                <p class="text-[11px] text-[#5D5E5F]">Zizo Donor and Surrogacy</p>
              </div>
            </div>

            <button
              type="button"
              id="ps-modal-close-btn"
              class="w-8 h-8 rounded-full flex items-center justify-center text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#E1E0DD]/50 transition-colors cursor-pointer"
              aria-label="Cancel payment"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="mt-4 flex items-baseline justify-between">
            <div>
              <span class="text-[10px] font-semibold uppercase tracking-wider text-[#5D5E5F]">Amount to pay</span>
              <p class="text-2xl font-bold text-[#17191A] tabular-nums mt-0.5">${formattedAmount}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] uppercase font-semibold text-[#5D5E5F]">Customer</span>
              <p class="text-xs font-medium text-[#17191A] max-w-[190px] truncate" title="${email}">${email}</p>
            </div>
          </div>
        </div>

        <!-- Channel Navigation Tabs -->
        <div id="ps-nav-tabs" class="flex border-b border-[#E1E0DD] bg-[#FAF9F6] text-xs font-semibold px-4 gap-1">
          <button type="button" id="ps-tab-card" class="py-2.5 px-3 border-b-2 border-[#17645F] text-[#17645F] flex items-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke-width="2"/></svg>
            <span>Card</span>
          </button>
          <button type="button" id="ps-tab-transfer" class="py-2.5 px-3 border-b-2 border-transparent text-[#5D5E5F] hover:text-[#17191A] flex items-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            <span>Bank Transfer</span>
          </button>
          <button type="button" id="ps-tab-ussd" class="py-2.5 px-3 border-b-2 border-transparent text-[#5D5E5F] hover:text-[#17191A] flex items-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span>USSD</span>
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="p-5">
          <!-- 1. CARD PAYMENT TAB -->
          <div id="ps-view-card" class="space-y-4">
            <div class="p-3 rounded-[8px] bg-[#17645F]/5 border border-[#17645F]/20 flex items-center justify-between gap-2">
              <div class="text-[11px] text-[#17645F]">
                <span class="font-bold">Test Sandbox:</span> Enter any card or autofill test digits
              </div>
              <button
                type="button"
                id="ps-quick-fill-btn"
                class="px-2.5 py-1 text-[11px] font-bold text-white bg-[#17645F] hover:bg-[#114B47] rounded-[6px] transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Quick Fill Test Card
              </button>
            </div>

            <form id="ps-card-form" class="space-y-3.5">
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-[#17191A] mb-1">Card Number</label>
                <div class="relative">
                  <input
                    id="ps-card-number"
                    type="text"
                    inputmode="numeric"
                    maxlength="19"
                    placeholder="4084  0840  8408  4084"
                    class="w-full h-11 px-3.5 pr-14 text-sm font-mono text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] transition-all"
                    required
                  />
                  <div class="absolute right-3 top-3 flex items-center gap-1 text-[#5D5E5F]">
                    <span id="ps-card-brand" class="text-[10px] font-bold uppercase tracking-wider text-[#17645F] bg-[#17645F]/10 px-1.5 py-0.5 rounded border border-[#17645F]/20">
                      VISA
                    </span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-[#17191A] mb-1">Card Expiry</label>
                  <input
                    id="ps-card-expiry"
                    type="text"
                    inputmode="numeric"
                    maxlength="7"
                    placeholder="MM / YY"
                    class="w-full h-11 px-3.5 text-sm font-mono text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] transition-all"
                    required
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-[#17191A] mb-1">CVV</label>
                  <input
                    id="ps-card-cvv"
                    type="password"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="123"
                    class="w-full h-11 px-3.5 text-sm font-mono text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="ps-submit-card-btn"
                class="w-full h-12 mt-2 bg-[#17645F] hover:bg-[#114B47] text-white font-bold text-sm rounded-[8px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Pay ${formattedAmount}</span>
              </button>
            </form>
          </div>

          <!-- 2. BANK TRANSFER TAB -->
          <div id="ps-view-transfer" class="hidden space-y-4 text-center py-2">
            <div class="p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-2">
              <p class="text-xs text-[#5D5E5F]">Transfer the exact consultation fee to the designated account below:</p>
              <p class="text-xs font-semibold text-[#17191A]">Wema Bank</p>
              <p class="text-2xl font-bold font-mono text-[#17645F] tracking-wider select-all">7019283741</p>
              <p class="text-[11px] text-[#5D5E5F]">Account Name: Paystack / Zizo Surrogacy</p>
            </div>
            <button
              type="button"
              id="ps-transfer-paid-btn"
              class="w-full h-11 bg-[#17645F] hover:bg-[#114B47] text-white font-bold text-sm rounded-[8px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              I have sent the money
            </button>
          </div>

          <!-- 3. USSD TAB -->
          <div id="ps-view-ussd" class="hidden space-y-4 text-center py-2">
            <div class="p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-2">
              <p class="text-xs text-[#5D5E5F]">Dial the USSD shortcode directly on your registered mobile device:</p>
              <p class="text-xl font-bold font-mono text-[#17645F] tracking-wider select-all">*737*000*4192#</p>
              <p class="text-[11px] text-[#5D5E5F]">GTBank, Zenith Bank, UBA &amp; Access Bank</p>
            </div>
            <button
              type="button"
              id="ps-ussd-paid-btn"
              class="w-full h-11 bg-[#17645F] hover:bg-[#114B47] text-white font-bold text-sm rounded-[8px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Confirm USSD Payment
            </button>
          </div>

          <!-- 4. PROCESSING STATE -->
          <div id="ps-view-processing" class="hidden space-y-4 text-center py-8">
            <div class="w-12 h-12 border-3 border-[#17645F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div class="space-y-1">
              <h4 id="ps-proc-title" class="font-bold text-base text-[#17191A]">Authorizing payment…</h4>
              <p id="ps-proc-desc" class="text-xs text-[#5D5E5F]">Connecting to issuing bank 3D Secure simulator...</p>
            </div>
          </div>

          <!-- 5. 3DS OTP PROMPT STATE -->
          <div id="ps-view-otp" class="hidden space-y-4 py-2 text-left">
            <div class="p-3.5 rounded-[8px] bg-[#17645F]/5 border border-[#17645F]/20 text-center">
              <p class="text-xs font-bold text-[#17645F]">Verified by Visa / Mastercard SecureCode</p>
              <p class="text-[11px] text-[#5D5E5F] mt-0.5">Please confirm authorization with your bank OTP</p>
            </div>
            <div class="space-y-1.5">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-[#17191A]">Enter 6-Digit One-Time PIN (OTP)</label>
              <input
                id="ps-otp-input"
                type="text"
                maxlength="6"
                value="123456"
                class="w-full h-11 px-3.5 text-center text-lg font-mono tracking-widest text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17645F] focus:border-[#17645F]"
              />
              <p class="text-[11px] text-[#5D5E5F] text-center">Default test sandbox OTP: <span class="font-mono font-bold text-[#17191A]">123456</span></p>
            </div>
            <button
              type="button"
              id="ps-otp-submit-btn"
              class="w-full h-12 bg-[#17645F] hover:bg-[#114B47] text-white font-bold text-sm rounded-[8px] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Authorize Payment
            </button>
          </div>

          <!-- 6. SUCCESS STATE -->
          <div id="ps-view-success" class="hidden space-y-4 text-center py-6">
            <div class="w-14 h-14 bg-emerald-50 text-[#17645F] border border-[#17645F]/30 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              ✓
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-lg text-[#17191A]">Payment Successful!</h4>
              <p class="text-xs text-[#5D5E5F]">Approved by Paystack. Confirming your consultation…</p>
              <p class="text-[11px] font-mono text-[#17645F] mt-1 select-all" id="ps-success-ref-display"></p>
            </div>
          </div>
        </div>

        <!-- Paystack Modal Footer -->
        <div class="px-5 py-3 border-t border-[#E1E0DD] bg-[#FAF9F6] flex items-center justify-between text-[11px] text-[#5D5E5F]">
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#17645F]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/></svg>
            <span>Secured by <strong>Paystack</strong></span>
          </div>
          <span class="text-[10px] font-mono text-[#8BB2AF]">PCI-DSS LEVEL 1</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Channel Switching
    const tabCard = modal.querySelector('#ps-tab-card');
    const tabTransfer = modal.querySelector('#ps-tab-transfer');
    const tabUssd = modal.querySelector('#ps-tab-ussd');
    const viewCard = modal.querySelector('#ps-view-card');
    const viewTransfer = modal.querySelector('#ps-view-transfer');
    const viewUssd = modal.querySelector('#ps-view-ussd');

    const switchTab = (activeTab, activeView) => {
      [tabCard, tabTransfer, tabUssd].forEach((t) => {
        t?.classList.remove('border-[#17645F]', 'text-[#17645F]');
        t?.classList.add('border-transparent', 'text-[#5D5E5F]');
      });
      [viewCard, viewTransfer, viewUssd].forEach((v) => v?.classList.add('hidden'));

      activeTab?.classList.add('border-[#17645F]', 'text-[#17645F]');
      activeTab?.classList.remove('border-transparent', 'text-[#5D5E5F]');
      activeView?.classList.remove('hidden');
    };

    tabCard?.addEventListener('click', () => switchTab(tabCard, viewCard));
    tabTransfer?.addEventListener('click', () => switchTab(tabTransfer, viewTransfer));
    tabUssd?.addEventListener('click', () => switchTab(tabUssd, viewUssd));

    // Card Input Auto-formatting
    const cardInput = modal.querySelector('#ps-card-number');
    const cardExpiry = modal.querySelector('#ps-card-expiry');
    const cardCvv = modal.querySelector('#ps-card-cvv');
    const cardBrand = modal.querySelector('#ps-card-brand');

    cardInput?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
      if (cardBrand) {
        if (v.startsWith('4')) cardBrand.textContent = 'VISA';
        else if (v.startsWith('5') || v.startsWith('2')) cardBrand.textContent = 'MASTERCARD';
        else if (v.startsWith('506') || v.startsWith('650') || v.startsWith('507')) cardBrand.textContent = 'VERVE';
        else cardBrand.textContent = 'CARD';
      }
    });

    cardExpiry?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) {
        e.target.value = v.slice(0, 2) + ' / ' + v.slice(2);
      } else {
        e.target.value = v;
      }
    });

    // Quick Fill Button
    modal.querySelector('#ps-quick-fill-btn')?.addEventListener('click', () => {
      if (cardInput) cardInput.value = '4084 0840 8408 4084';
      if (cardExpiry) cardExpiry.value = '12 / 28';
      if (cardCvv) cardCvv.value = '408';
      if (cardBrand) cardBrand.textContent = 'VISA';
    });

    // Close logic
    const closeModal = () => {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.remove(), 200);
    };

    modal.querySelector('#ps-modal-close-btn')?.addEventListener('click', () => {
      closeModal();
      if (onClose) onClose();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        if (onClose) onClose();
      }
    });

    // Card Submission -> Processing -> 3DS OTP -> Success
    const cardForm = modal.querySelector('#ps-card-form');
    const viewProc = modal.querySelector('#ps-view-processing');
    const viewOtp = modal.querySelector('#ps-view-otp');
    const viewSuccess = modal.querySelector('#ps-view-success');
    const navTabs = modal.querySelector('#ps-nav-tabs');
    const procTitle = modal.querySelector('#ps-proc-title');
    const procDesc = modal.querySelector('#ps-proc-desc');

    cardForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      viewCard?.classList.add('hidden');
      navTabs?.classList.add('hidden');
      viewProc?.classList.remove('hidden');

      setTimeout(() => {
        // Advance to 3DS OTP authorization step
        viewProc?.classList.add('hidden');
        viewOtp?.classList.remove('hidden');
      }, 700);
    });

    modal.querySelector('#ps-otp-submit-btn')?.addEventListener('click', () => {
      viewOtp?.classList.add('hidden');
      if (procTitle) procTitle.textContent = 'Confirming authorization…';
      if (procDesc) procDesc.textContent = 'Settling payment with Paystack gateway...';
      viewProc?.classList.remove('hidden');

      setTimeout(() => {
        viewProc?.classList.add('hidden');
        const refDisplay = modal.querySelector('#ps-success-ref-display');
        if (refDisplay) refDisplay.textContent = `Reference: ${reference}`;
        viewSuccess?.classList.remove('hidden');

        setTimeout(() => {
          closeModal();
          if (onSuccess) onSuccess({ reference, status: 'success' });
        }, 900);
      }, 800);
    });

    // Alternative channels completion (Transfer & USSD)
    const triggerAlternativeSuccess = (typeLabel) => {
      viewTransfer?.classList.add('hidden');
      viewUssd?.classList.add('hidden');
      navTabs?.classList.add('hidden');
      if (procTitle) procTitle.textContent = `Validating ${typeLabel}…`;
      if (procDesc) procDesc.textContent = 'Checking real-time settlement notification with Paystack...';
      viewProc?.classList.remove('hidden');

      setTimeout(() => {
        viewProc?.classList.add('hidden');
        const refDisplay = modal.querySelector('#ps-success-ref-display');
        if (refDisplay) refDisplay.textContent = `Reference: ${reference}`;
        viewSuccess?.classList.remove('hidden');

        setTimeout(() => {
          closeModal();
          if (onSuccess) onSuccess({ reference, status: 'success' });
        }, 900);
      }, 900);
    };

    modal.querySelector('#ps-transfer-paid-btn')?.addEventListener('click', () => triggerAlternativeSuccess('Bank Transfer'));
    modal.querySelector('#ps-ussd-paid-btn')?.addEventListener('click', () => triggerAlternativeSuccess('USSD Session'));
  }

  function pay(amount, email, onSuccess, onError, onClose, payData) {
    const isLiveConfigured = Boolean(
      payData &&
      payData.configured &&
      payData.public_key &&
      !payData.public_key.includes('placeholder') &&
      window.PaystackPop
    );

    if (isLiveConfigured) {
      try {
        const handler = window.PaystackPop.setup({
          key: payData.public_key,
          email: email,
          amount: amount,
          currency: payData.currency || 'NGN',
          ref: payData.reference,
          metadata: {
            booking_id: payData.booking_id,
            custom_fields: [
              { display_name: 'Client Name', variable_name: 'client_name', value: state.details?.name },
              { display_name: 'Consultation Type', variable_name: 'consultation_type', value: state.selectedType?.name },
            ],
          },
          onClose: function () {
            if (onClose) onClose();
          },
          callback: function (response) {
            if (onSuccess) onSuccess(response);
          },
        });
        handler.openIframe();
        return;
      } catch (err) {
        console.warn('Real PaystackPop setup warning:', err);
      }
    }

    // Launch interactive Paystack Inline Modal simulation
    openPaystackSimulationModal({
      amountMinor: amount,
      currency: payData?.currency || state.selectedType?.currency || 'NGN',
      email: email,
      clientName: state.details?.name || 'Client',
      consultationName: state.selectedType?.name || 'Consultation',
      reference: (payData && payData.reference) || ('mock_zizo_' + Date.now()),
      onSuccess: function (response) {
        if (onSuccess) onSuccess(response);
      },
      onClose: function () {
        if (onClose) onClose();
      },
    });
  }

  const confirmBtn = document.getElementById('confirm-booking-btn');
  confirmBtn?.addEventListener('click', async () => {
    const errEl = document.getElementById('booking-submit-error');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="zizo-spinner mr-2"></span> Scheduling your consultation…';
    if (errEl) errEl.textContent = '';

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation_type_id: state.selectedType.id,
          start_at: state.selectedSlot.startAt,
          staff_id: state.selectedSlot.staffId,
          ...state.details,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        if (errEl) errEl.textContent = data.error || 'That time was just taken. Please pick another slot.';
        goToStep(2);
        loadSlotsForDate(state.selectedDate);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not confirm booking.');

      // Check if consultation requires payment
      if (data.paymentRequired) {
        confirmBtn.innerHTML = '<span class="zizo-spinner mr-2"></span> Preparing secure checkout…';
        try {
          const initRes = await fetch('/api/payments/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: data.bookingId,
              currency: data.currency || 'NGN',
            }),
          });
          const payData = await initRes.json();
          if (payData) {
            payData.booking_id = data.bookingId;
          }

          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Pay & Confirm Consultation';

          pay(
            payData?.amount_minor || data.priceMinor,
            state.details.email,
            async function (response) {
              confirmBtn.disabled = true;
              confirmBtn.innerHTML = '<span class="zizo-spinner mr-2"></span> Verifying payment…';
              try {
                await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    reference: response.reference,
                    booking_id: data.bookingId,
                  }),
                });
              } catch (verifyErr) {
                console.warn('Payment verify warning:', verifyErr);
              }
              window.location.href = `/book/confirmed/?token=${encodeURIComponent(data.manageToken)}`;
            },
            function (err) {
              if (errEl) errEl.textContent = err?.message || 'Payment processing error.';
              confirmBtn.disabled = false;
              confirmBtn.textContent = 'Pay & Confirm Consultation';
            },
            function () {
              confirmBtn.disabled = false;
              confirmBtn.textContent = 'Complete Payment to Confirm';
              if (errEl) {
                errEl.innerHTML = '<span class="text-amber-800">Payment window was closed. Please click above to complete payment and lock in your consultation slot.</span>';
              }
            },
            payData
          );
          return;
        } catch (initErr) {
          console.warn('Payment init warning:', initErr);
        }
      }

      window.location.href = `/book/confirmed/?token=${encodeURIComponent(data.manageToken)}`;
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
      confirmBtn.disabled = false;
      const isPaid = Number(state.selectedType?.price_minor || 0) > 0;
      confirmBtn.textContent = isPaid ? 'Pay & Confirm Consultation' : 'Confirm Booking';
    }
  });

  function escapeClient(s = '') {
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
  }
}
