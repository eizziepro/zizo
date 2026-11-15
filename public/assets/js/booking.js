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
    if (revBox && state.selectedType && state.selectedSlot) {
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
      `;
    }
    goToStep(4);
  });

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
      window.location.href = `/book/confirmed/?token=${encodeURIComponent(data.manageToken)}`;
    } catch (err) {
      if (errEl) errEl.textContent = err.message;
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Booking';
    }
  });

  function escapeClient(s = '') {
    const div = document.createElement('div');
    div.textContent = String(s);
    return div.innerHTML;
  }
}
