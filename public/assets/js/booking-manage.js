const statusEl = document.getElementById('manage-status');
const controlsEl = document.getElementById('manage-controls');
const token = new URLSearchParams(window.location.search).get('token');
const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';

async function initManage() {
  if (!token) {
    if (statusEl) statusEl.textContent = 'Invalid or missing consultation management link.';
    return;
  }

  try {
    const res = await fetch(`/api/bookings/manage?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not verify management link.');

    const b = data.booking;
    const localFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: visitorTz,
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(b.start_at));

    if (statusEl) {
      statusEl.innerHTML = `
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 bg-[#E1E0DD]/25 space-y-1.5 text-[length:var(--fs-small)]">
          <p><strong>Consultation:</strong> ${b.type_name}</p>
          <p><strong>Scheduled:</strong> ${localFormatted} (${visitorTz})</p>
          <p><strong>Status:</strong> <span class="capitalize font-semibold text-[#17645F]">${b.status}</span></p>
        </div>
      `;
    }

    if (b.status === 'cancelled' || b.status === 'completed') {
      if (controlsEl) {
        controlsEl.classList.remove('hidden');
        controlsEl.innerHTML = `<p class="text-[length:var(--fs-small)] text-[#5D5E5F]">This consultation is ${b.status}. <a href="/book/" class="text-[#17645F] underline">Book a new consultation</a>.</p>`;
      }
      return;
    }

    if (!data.canModify) {
      if (controlsEl) {
        controlsEl.classList.remove('hidden');
        controlsEl.innerHTML = `<p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Online changes are closed within ${data.cutoffHours} hours of the start time. Please contact our coordinator directly.</p>`;
      }
      return;
    }

    if (controlsEl) {
      controlsEl.classList.remove('hidden');
      controlsEl.innerHTML = `
        <div class="space-y-4">
          <h2 class="display text-[length:var(--fs-h3)]">Reschedule to a new time</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label for="resched-date" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Pick a date</label>
              <input id="resched-date" type="date" class="input-field" />
            </div>
            <button type="button" id="check-resched-slots" class="btn-secondary">Check available times</button>
          </div>
          <div id="resched-slots" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5"></div>
        </div>
        <div class="pt-6 border-t border-[#E1E0DD] flex flex-wrap items-center justify-between gap-4">
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Need to cancel instead?</p>
          <button type="button" id="cancel-booking-btn" class="btn-secondary text-red-700 border-red-700 hover:bg-red-50">Cancel Consultation</button>
        </div>
      `;

      const dateInput = document.getElementById('resched-date');
      const todayStr = new Date().toISOString().slice(0, 10);
      dateInput.min = todayStr;
      dateInput.value = todayStr;

      document.getElementById('check-resched-slots')?.addEventListener('click', async () => {
        const d = dateInput.value;
        const slotsBox = document.getElementById('resched-slots');
        slotsBox.innerHTML = '<p class="col-span-2 text-xs text-[#5D5E5F]">Loading slots…</p>';
        const avRes = await fetch(
          `/api/availability?typeId=${encodeURIComponent(b.consultation_type_id)}&date=${encodeURIComponent(d)}`
        );
        const avData = await avRes.json();
        const slots = avData.slots || [];
        if (slots.length === 0) {
          slotsBox.innerHTML = '<p class="col-span-2 text-xs text-[#5D5E5F]">No slots available on this date.</p>';
          return;
        }
        slotsBox.innerHTML = slots
          .map(
            (s) => `<button type="button" data-new-slot="${s.startAt}" data-staff="${s.staffId}" class="border border-[#E1E0DD] hover:border-[#17645F] rounded-[var(--radius)] p-2.5 text-left text-[length:var(--fs-small)]">
            <span class="font-semibold block tabular-nums">${s.clinicTime} WAT</span>
          </button>`
          )
          .join('');

        slotsBox.querySelectorAll('[data-new-slot]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const upRes = await fetch('/api/bookings/manage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                action: 'reschedule',
                start_at: btn.dataset.newSlot,
                staff_id: btn.dataset.staff,
              }),
            });
            const upData = await upRes.json();
            if (!upRes.ok) {
              window.zizoToast?.(upData.error || 'Could not reschedule.');
              return;
            }
            window.zizoToast?.('Consultation rescheduled.');
            initManage();
          });
        });
      });

      document.getElementById('cancel-booking-btn')?.addEventListener('click', async () => {
        const cRes = await fetch('/api/bookings/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'cancel' }),
        });
        const cData = await cRes.json();
        if (!cRes.ok) {
          window.zizoToast?.(cData.error || 'Could not cancel.');
          return;
        }
        window.zizoToast?.('Consultation cancelled.');
        initManage();
      });
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<p class="text-red-700">${err.message}</p>`;
  }
}

initManage();
