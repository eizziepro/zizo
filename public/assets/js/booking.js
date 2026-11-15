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
        ind.classList.toggle('border-[#17645F]', n === step);
        ind.classList.toggle('bg-[#8BB2AF]/20', n === step);
        ind.classList.toggle('font-semibold', n === step);
        ind.classList.toggle('text-[#17191A]', n <= step);
        ind.classList.toggle('border-[#E1E0DD]', n !== step);
      }
    });
  }

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

    if (calGrid) calGrid.innerHTML = '<p class="col-span-7 text-xs text-[#5D5E5F] py-6 text-center">Loading available dates…</p>';

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

    let html = '';
    for (let i = 0; i < firstDayWeekday; i++) {
      html += '<div></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${state.currentYear}-${String(state.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const available = state.availableDates.has(dateStr);
      const selected = state.selectedDate === dateStr;
      let cls = 'h-11 rounded-[var(--radius)] text-sm tabular-nums transition-colors ';
      if (selected) {
        cls += 'bg-[#17645F] text-[#FAF9F6] font-semibold';
      } else if (available) {
        cls += 'bg-[#8BB2AF]/30 text-[#17191A] font-semibold hover:bg-[#8BB2AF]/55 border border-[#17645F]/30';
      } else {
        cls += 'text-[#5D5E5F]/45 cursor-not-allowed';
      }
      html += `<button type="button" data-cal-date="${dateStr}" ${available ? '' : 'disabled'} class="${cls}" aria-label="${dateStr}${available ? ' available' : ' unavailable'}">${day}</button>`;
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
    if (label) label.textContent = `Available times on ${dateStr}`;
    if (list) list.innerHTML = '<p class="col-span-2 text-xs text-[#5D5E5F]">Checking slots…</p>';

    try {
      const res = await fetch(
        `/api/availability?typeId=${encodeURIComponent(state.selectedType.id)}&date=${encodeURIComponent(dateStr)}`
      );
      const data = await res.json();
      const slots = data.slots || [];
      if (slots.length === 0) {
        if (list) list.innerHTML = '<p class="col-span-2 text-[length:var(--fs-small)] text-[#5D5E5F]">No slots remain on this date. Please choose another day.</p>';
        return;
      }

      list.innerHTML = slots
        .map((s) => {
          const localTime = formatTimeInZone(s.startAt, visitorTz);
          const watTime = s.clinicTime;
          const tzSub = visitorTz === 'Africa/Lagos' ? 'WAT' : `${watTime} WAT`;
          return `<button type="button" data-slot-start="${s.startAt}" class="border border-[#E1E0DD] hover:border-[#17645F] hover:bg-[#8BB2AF]/15 rounded-[var(--radius)] p-2.5 text-left transition-colors min-h-[44px]">
            <span class="block text-[length:var(--fs-small)] font-semibold text-[#17191A] tabular-nums">${localTime}</span>
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
      if (list) list.innerHTML = '<p class="col-span-2 text-xs text-red-700">Could not load time slots. Please retry.</p>';
    }
  }

  function populateStep3() {
    const banner = document.getElementById('booking-summary-banner');
    const channelSel = document.getElementById('bk-channel');
    if (banner && state.selectedType && state.selectedSlot) {
      const dateTxt = formatDateInZone(state.selectedSlot.startAt, visitorTz);
      const localTxt = formatTimeInZone(state.selectedSlot.startAt, visitorTz);
      banner.textContent = `${state.selectedType.name} (${state.selectedType.duration_min} min) · ${dateTxt} at ${localTxt} (${visitorTz})`;
    }
    if (channelSel && state.selectedType) {
      const channels = Array.isArray(state.selectedType.channels)
        ? state.selectedType.channels
        : JSON.parse(state.selectedType.channels || '["Google Meet"]');
      channelSel.innerHTML = channels
        .map((ch) => `<option value="${ch}">${ch}</option>`)
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
    if (revBox) {
      revBox.innerHTML = `
        <p><strong>Consultation:</strong> ${state.selectedType.name} (${state.selectedType.duration_min} min)</p>
        <p><strong>Date &amp; Time:</strong> ${formatDateInZone(state.selectedSlot.startAt, visitorTz)} at ${formatTimeInZone(state.selectedSlot.startAt, visitorTz)} (${visitorTz}) / ${state.selectedSlot.clinicTime} WAT</p>
        <p><strong>Channel:</strong> ${state.details.channel}</p>
        <p><strong>Name:</strong> ${state.details.name} (${state.details.audience})</p>
        <p><strong>Contact:</strong> ${state.details.email} · ${state.details.phone}</p>
      `;
    }
    goToStep(4);
  });

  const confirmBtn = document.getElementById('confirm-booking-btn');
  confirmBtn?.addEventListener('click', async () => {
    const errEl = document.getElementById('booking-submit-error');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Scheduling…';
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
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Booking';
    }
  });
}
