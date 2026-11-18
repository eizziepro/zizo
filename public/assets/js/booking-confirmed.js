const summaryEl = document.getElementById('confirmed-summary');
const actionsEl = document.getElementById('confirmed-actions');
const token = new URLSearchParams(window.location.search).get('token');

function formatUtcCompact(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}Z`
  );
}

function getGoogleCalendarUrl(b) {
  const summary = `Zizo Consultation: ${b.type_name}`;
  const manageLink = `${window.location.origin}/book/manage/?token=${encodeURIComponent(token)}`;
  const details = `Private ${b.type_name} with Zizo Donor and Surrogacy clinical coordinators via ${b.channel}.\n\nManage or reschedule consultation:\n${manageLink}`;
  const location = b.channel || 'Online / WhatsApp';
  const dates = `${formatUtcCompact(b.start_at)}/${formatUtcCompact(b.end_at)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: dates,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getOutlookCalendarUrl(b) {
  const summary = `Zizo Consultation: ${b.type_name}`;
  const manageLink = `${window.location.origin}/book/manage/?token=${encodeURIComponent(token)}`;
  const details = `Private ${b.type_name} with Zizo Donor and Surrogacy clinical coordinators via ${b.channel}.\n\nManage or reschedule consultation:\n${manageLink}`;
  const location = b.channel || 'Online / WhatsApp';

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: summary,
    startdt: new Date(b.start_at).toISOString(),
    enddt: new Date(b.end_at).toISOString(),
    body: details,
    location: location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function getYahooCalendarUrl(b) {
  const summary = `Zizo Consultation: ${b.type_name}`;
  const manageLink = `${window.location.origin}/book/manage/?token=${encodeURIComponent(token)}`;
  const details = `Private ${b.type_name} with Zizo Donor and Surrogacy clinical coordinators via ${b.channel}.\n\nManage or reschedule consultation:\n${manageLink}`;
  const location = b.channel || 'Online / WhatsApp';

  const pad = (n) => String(n).padStart(2, '0');
  const durationMinutes = Math.max(15, Math.round((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 60000));
  const durHours = pad(Math.floor(durationMinutes / 60));
  const durMins = pad(durationMinutes % 60);

  const params = new URLSearchParams({
    v: '60',
    title: summary,
    st: formatUtcCompact(b.start_at),
    dur: `${durHours}${durMins}`,
    desc: details,
    in_loc: location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

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

    const googleCalUrl = getGoogleCalendarUrl(b);
    const outlookCalUrl = getOutlookCalendarUrl(b);
    const yahooCalUrl = getYahooCalendarUrl(b);

    if (summaryEl) {
      summaryEl.innerHTML = `
        <p><strong>Consultation:</strong> ${b.type_name} (${b.duration_min} min)</p>
        <p><strong>Status:</strong> <span class="capitalize font-semibold text-[#17645F]">${b.status}</span></p>
        <p><strong>Date &amp; Time:</strong> ${localFormatted} (${tz}) · ${watFormatted} WAT</p>
        <p><strong>Channel:</strong> ${b.channel}</p>
        <p class="text-[length:var(--fs-small)] text-[#5D5E5F] pt-2">A confirmation email has been dispatched. You can add this appointment directly to your calendar below.</p>
      `;
    }

    if (actionsEl) {
      actionsEl.innerHTML = `
        <div class="space-y-4 w-full text-left">
          <div class="flex flex-wrap items-center gap-3">
            <!-- 1-Click Add to Google Calendar -->
            <a
              href="${googleCalUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary inline-flex items-center gap-2"
              title="Add directly to Google Calendar"
            >
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
              </svg>
              <span>Add to Google Calendar</span>
            </a>

            <!-- Other Calendars Dropdown -->
            <div class="relative inline-block text-left" id="cal-dropdown-container">
              <button
                type="button"
                id="cal-dropdown-btn"
                class="btn-secondary inline-flex items-center gap-1.5"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span>Other Calendars</span>
                <svg class="w-4 h-4 text-[#5D5E5F] transition-transform" id="cal-dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
              <div
                id="cal-dropdown-menu"
                class="hidden absolute left-0 mt-2 w-60 rounded-[10px] bg-white border border-[#E1E0DD] shadow-xl py-1.5 z-50 text-xs text-left"
              >
                <a
                  href="${outlookCalUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0EFEC] text-[#17191A] font-medium transition-colors"
                >
                  <svg class="w-4 h-4 text-[#0078D4] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H7V8h14v10z"/>
                  </svg>
                  <span>Outlook / Office 365 Web</span>
                </a>
                <a
                  href="/api/ics?token=${encodeURIComponent(token)}"
                  class="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0EFEC] text-[#17191A] font-medium transition-colors"
                >
                  <svg class="w-4 h-4 text-[#17645F] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
                  </svg>
                  <span>Apple Calendar / iCal</span>
                </a>
                <a
                  href="${yahooCalUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F0EFEC] text-[#17191A] font-medium transition-colors"
                >
                  <svg class="w-4 h-4 text-[#6001D2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <span>Yahoo Calendar Web</span>
                </a>
              </div>
            </div>

            <!-- Reschedule / Cancel -->
            <a href="/book/manage/?token=${encodeURIComponent(token)}" class="btn-secondary">
              Reschedule or Cancel
            </a>
          </div>

          <p class="text-xs text-[#5D5E5F]">
            Clicking <strong>Add to Google Calendar</strong> opens your calendar in a new tab with meeting details, time zones, and channels pre-filled. No manual file download needed.
          </p>
        </div>
      `;

      // Set up dropdown toggle
      const container = document.getElementById('cal-dropdown-container');
      const btn = document.getElementById('cal-dropdown-btn');
      const menu = document.getElementById('cal-dropdown-menu');
      const arrow = document.getElementById('cal-dropdown-arrow');

      if (btn && menu) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = menu.classList.contains('hidden');
          if (isHidden) {
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            if (arrow) arrow.classList.add('rotate-180');
          } else {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            if (arrow) arrow.classList.remove('rotate-180');
          }
        });

        document.addEventListener('click', (e) => {
          if (container && !container.contains(e.target)) {
            menu.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            if (arrow) arrow.classList.remove('rotate-180');
          }
        });
      }
    }
  } catch (err) {
    if (summaryEl) summaryEl.innerHTML = `<p class="text-red-700">${err.message}</p>`;
  }
}

loadConfirmation();
