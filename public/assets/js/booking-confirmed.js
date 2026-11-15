const summaryEl = document.getElementById('confirmed-summary');
const actionsEl = document.getElementById('confirmed-actions');
const token = new URLSearchParams(window.location.search).get('token');

async function loadConfirmation() {
  if (!token) {
    if (summaryEl) summaryEl.innerHTML = '<p>No confirmation token was found. Please check your confirmation email.</p>';
    return;
  }
  try {
    const res = await fetch(`/api/bookings/manage?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load consultation details.');
    const b = data.booking;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos';
    const localFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(b.start_at));
    const watFormatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      timeStyle: 'short',
    }).format(new Date(b.start_at));

    if (summaryEl) {
      summaryEl.innerHTML = `
        <p><strong>Consultation:</strong> ${b.type_name} (${b.duration_min} min)</p>
        <p><strong>Status:</strong> <span class="capitalize font-semibold text-[#17645F]">${b.status}</span></p>
        <p><strong>Date &amp; Time:</strong> ${localFormatted} (${tz}) · ${watFormatted} WAT</p>
        <p><strong>Channel:</strong> ${b.channel}</p>
        <p class="text-[length:var(--fs-small)] text-[#5D5E5F] pt-2">A confirmation email with your calendar invite (.ics) has been sent.</p>
      `;
    }
    if (actionsEl) {
      actionsEl.innerHTML = `
        <a href="/api/ics?token=${encodeURIComponent(token)}" class="btn-primary">Download Calendar (.ics)</a>
        <a href="/book/manage/?token=${encodeURIComponent(token)}" class="btn-secondary">Reschedule or Cancel</a>
      `;
    }
  } catch (err) {
    if (summaryEl) summaryEl.innerHTML = `<p class="text-red-700">${err.message}</p>`;
  }
}

loadConfirmation();
