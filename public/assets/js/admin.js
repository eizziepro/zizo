const authScreen = document.getElementById('admin-auth-screen');
const workspace = document.getElementById('admin-workspace');
const loginForm = document.getElementById('admin-login-form');
const adminContent = document.getElementById('admin-content');
const sectionTitle = document.getElementById('admin-section-title');
const topActions = document.getElementById('admin-top-actions');
const modal = document.getElementById('admin-modal');
const modalTitle = document.getElementById('admin-modal-title');
const modalBody = document.getElementById('admin-modal-body');

let currentStaff = null;
let currentTab = 'overview';
let pendingChallengeToken = null;
let idleSecondsLeft = 1800; // 30 minutes
let idleInterval = null;
let autosaveTimer = null;

const ROLE_TABS = {
  owner: ['overview', 'bookings', 'availability', 'inquiries', 'reviews', 'blog', 'faqs', 'subscribers', 'settings', 'audit'],
  coordinator: ['overview', 'bookings', 'availability', 'inquiries', 'reviews'],
  editor: ['overview', 'blog', 'faqs', 'reviews'],
};

function toast(msg) {
  const el = document.getElementById('zizo-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 4000);
}

function esc(str = '') {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 401 && currentStaff) {
    handleSessionExpired();
    throw new Error('Session expired. Please sign in again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function openModal(title, html) {
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = html;
  modal?.classList.remove('hidden');
  refreshIcons();
}

function closeModal() {
  modal?.classList.add('hidden');
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}

document.getElementById('admin-modal-close')?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
});

function startIdleTimer() {
  idleSecondsLeft = 1800;
  const reset = () => {
    idleSecondsLeft = 1800;
  };
  ['mousemove', 'keydown', 'click', 'scroll'].forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

  clearInterval(idleInterval);
  idleInterval = setInterval(() => {
    idleSecondsLeft--;
    const timerEl = document.getElementById('session-idle-timer');
    if (timerEl) {
      const m = String(Math.floor(idleSecondsLeft / 60)).padStart(2, '0');
      const s = String(idleSecondsLeft % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }
    if (idleSecondsLeft <= 0) {
      logout();
    }
  }, 1000);
}

function handleSessionExpired() {
  currentStaff = null;
  clearInterval(idleInterval);
  workspace?.classList.add('hidden');
  authScreen?.classList.remove('hidden');
  toast('Session locked after inactivity.');
}

async function logout() {
  await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
  handleSessionExpired();
}

document.getElementById('admin-logout-btn')?.addEventListener('click', logout);

// Auth Steps
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = document.getElementById('auth-login-error');
  const fd = new FormData(loginForm);
  if (err) err.textContent = '';

  try {
    const data = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(fd.get('email') || '').trim(),
        password: String(fd.get('password') || ''),
      }),
    }).then(async (r) => {
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Sign in failed');
      return j;
    });

    if (data.ok && data.staff) {
      enterWorkspace(data.staff);
    }
  } catch (ex) {
    if (err) err.textContent = ex.message;
  }
});

function enterWorkspace(staff) {
  currentStaff = staff;
  authScreen?.classList.add('hidden');
  workspace?.classList.remove('hidden');
  document.getElementById('admin-user-name').textContent = staff.full_name;
  document.getElementById('admin-user-role').textContent = staff.role;

  const allowed = ROLE_TABS[staff.role] || ['overview'];
  document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
    const ok = allowed.includes(btn.dataset.adminTab);
    btn.classList.toggle('hidden', !ok);
  });

  startIdleTimer();
  switchTab('overview');
  refreshIcons();
}

document.querySelectorAll('[data-admin-tab]').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.adminTab));
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('[data-admin-tab]').forEach((b) => {
    const active = b.dataset.adminTab === tab;
    b.classList.toggle('bg-[#17645F]', active);
    b.classList.toggle('text-[#FAF9F6]', active);
  });
  const titles = {
    overview: 'Overview',
    bookings: 'Bookings & Calendar',
    availability: 'Availability & Consultation Types',
    inquiries: 'Inquiries & Applications',
    reviews: 'Reviews & Legacy Testimonials',
    blog: 'Blog CMS',
    faqs: 'FAQs',
    subscribers: 'Subscribers',
    settings: 'Site Settings',
    audit: 'Audit Log',
  };
  if (sectionTitle) sectionTitle.textContent = titles[tab] || 'Dashboard';
  if (topActions) topActions.innerHTML = '';
  if (adminContent) adminContent.innerHTML = '<p class="text-[#5D5E5F]">Loading…</p>';

  const loaders = {
    overview: loadOverview,
    bookings: loadBookings,
    availability: loadAvailability,
    inquiries: loadInquiries,
    reviews: loadReviews,
    blog: loadBlog,
    faqs: loadFaqs,
    subscribers: loadSubscribers,
    settings: loadSettings,
    audit: loadAudit,
  };
  loaders[tab]?.();
}

// 1. OVERVIEW
async function loadOverview() {
  try {
    const data = await api('/api/admin/overview');
    adminContent.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 bg-[#FAF9F6]">
          <p class="text-xs text-[#5D5E5F] uppercase tracking-[0.08em]">Active Bookings</p>
          <p class="font-display text-3xl mt-1 tabular-nums">${data.counts.bookings}</p>
        </div>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 bg-[#FAF9F6]">
          <p class="text-xs text-[#5D5E5F] uppercase tracking-[0.08em]">New Inquiries &amp; Apps</p>
          <p class="font-display text-3xl mt-1 tabular-nums">${data.counts.newLeads}</p>
        </div>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 bg-[#FAF9F6]">
          <p class="text-xs text-[#5D5E5F] uppercase tracking-[0.08em]">Pending Reviews</p>
          <p class="font-display text-3xl mt-1 tabular-nums">${data.counts.pendingReviews}</p>
        </div>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 bg-[#FAF9F6]">
          <p class="text-xs text-[#5D5E5F] uppercase tracking-[0.08em]">Blog Articles</p>
          <p class="font-display text-3xl mt-1 tabular-nums">${data.counts.posts}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-3">
          <h2 class="display text-lg">Upcoming Bookings</h2>
          ${
            data.upcomingBookings.length === 0
              ? '<p class="text-sm text-[#5D5E5F]">No upcoming bookings yet.</p>'
              : `<ul class="divide-y divide-[#E1E0DD] text-sm">
              ${data.upcomingBookings
                .map(
                  (b) => `<li class="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p class="font-medium">${esc(b.name)} · <span class="text-[#5D5E5F]">${esc(b.type_name)}</span></p>
                  <p class="text-xs text-[#5D5E5F] tabular-nums">${esc(b.start_at.slice(0, 16).replace('T', ' '))} UTC · ${esc(b.channel)}</p>
                </div>
                <span class="text-xs font-semibold text-[#17645F] capitalize">${esc(b.status)}</span>
              </li>`
                )
                .join('')}
            </ul>`
          }
        </div>

        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-3">
          <h2 class="display text-lg">Recent Transactional Email Outbox</h2>
          ${
            data.emails.length === 0
              ? '<p class="text-sm text-[#5D5E5F]">No emails logged yet.</p>'
              : `<ul class="divide-y divide-[#E1E0DD] text-sm">
              ${data.emails
                .map(
                  (em) => `<li class="py-2.5">
                <p class="font-medium">${esc(em.subject)}</p>
                <p class="text-xs text-[#5D5E5F]">To: ${esc(em.to_email)} · ${em.has_ics ? 'Includes .ics · ' : ''}${esc(em.status)}</p>
              </li>`
                )
                .join('')}
            </ul>`
          }
        </div>
      </div>
    `;
  } catch (err) {
    adminContent.innerHTML = `<p class="text-red-700">${esc(err.message)}</p>`;
  }
}

// 2. BOOKINGS
async function loadBookings() {
  topActions.innerHTML = `
    <button type="button" id="btn-export-bookings" class="btn-secondary !py-2 !px-4">Export CSV</button>
    <button type="button" id="btn-new-manual-booking" class="btn-primary !py-2 !px-4">Manual Booking</button>
  `;
  const data = await api('/api/admin/bookings');
  const types = data.consultationTypes || [];
  const rows = data.bookings || [];

  adminContent.innerHTML = `
    <div class="flex flex-wrap gap-3 mb-4">
      <select id="filter-bk-status" class="input-field !w-auto">
        <option value="all">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No show</option>
      </select>
    </div>
    <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] text-xs uppercase tracking-[0.06em] text-[#5D5E5F]">
          <tr>
            <th class="p-3">Client</th>
            <th class="p-3">Type</th>
            <th class="p-3">Start (UTC)</th>
            <th class="p-3">Channel</th>
            <th class="p-3">Status</th>
            <th class="p-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#E1E0DD]" id="bookings-tbody">
          ${rows
            .map(
              (b) => `<tr data-bk-status="${esc(b.status)}">
            <td class="p-3">
              <p class="font-medium">${esc(b.name)}</p>
              <p class="text-xs text-[#5D5E5F]">${esc(b.email)} · ${esc(b.country)}</p>
            </td>
            <td class="p-3">${esc(b.type_name)}</td>
            <td class="p-3 tabular-nums">${esc(b.start_at.slice(0, 16).replace('T', ' '))}</td>
            <td class="p-3">${esc(b.channel)}</td>
            <td class="p-3 capitalize font-medium text-[#17645F]">${esc(b.status)}</td>
            <td class="p-3">
              <div class="flex flex-wrap gap-2">
                <button type="button" data-edit-bk="${esc(b.id)}" class="text-xs font-semibold text-[#17645F] underline">Manage</button>
              </div>
            </td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('filter-bk-status')?.addEventListener('change', (e) => {
    const val = e.target.value;
    document.querySelectorAll('#bookings-tbody tr').forEach((tr) => {
      tr.classList.toggle('hidden', val !== 'all' && tr.dataset.bkStatus !== val);
    });
  });

  document.getElementById('btn-export-bookings')?.addEventListener('click', () => {
    window.location.href = '/api/admin/bookings/export';
  });

  document.getElementById('btn-new-manual-booking')?.addEventListener('click', () => {
    openModal(
      'Create Manual Booking',
      `<form id="manual-bk-form" class="space-y-3">
        <div>
          <label class="block text-xs font-medium mb-1">Consultation Type</label>
          <select name="consultation_type_id" class="input-field">${types
            .map((t) => `<option value="${esc(t.id)}">${esc(t.name)} (${t.duration_min}m)</option>`)
            .join('')}</select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium mb-1">Start ISO (UTC)</label><input name="start_at" type="datetime-local" required class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Channel</label><select name="channel" class="input-field"><option>Google Meet</option><option>Phone call</option><option>WhatsApp call</option></select></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium mb-1">Full name</label><input name="name" required class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Email</label><input name="email" type="email" required class="input-field" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium mb-1">Phone</label><input name="phone" required class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Country</label><input name="country" value="Nigeria" required class="input-field" /></div>
        </div>
        <button type="submit" class="btn-primary">Create Booking</button>
      </form>`
    );
    document.getElementById('manual-bk-form')?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      const localDt = String(fd.get('start_at'));
      const startIso = new Date(localDt).toISOString();
      try {
        await api('/api/admin/bookings', {
          method: 'POST',
          body: JSON.stringify({
            consultation_type_id: fd.get('consultation_type_id'),
            start_at: startIso,
            name: fd.get('name'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            country: fd.get('country'),
            audience: 'Intended Parent',
            channel: fd.get('channel'),
          }),
        });
        closeModal();
        toast('Manual booking created.');
        loadBookings();
      } catch (ex) {
        toast(ex.message);
      }
    });
  });

  document.querySelectorAll('[data-edit-bk]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const b = rows.find((x) => x.id === btn.dataset.editBk);
      if (!b) return;
      openModal(
        `Manage Booking: ${b.name}`,
        `<form id="edit-bk-form" class="space-y-4">
          <p class="text-xs text-[#5D5E5F]">Scheduled: ${esc(b.start_at)} · Note: ${esc(b.note || 'None')}</p>
          <div>
            <label class="block text-xs font-medium mb-1">Status</label>
            <select name="status" class="input-field">
              ${['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
                .map((s) => `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Meeting URL (if applicable)</label>
            <input name="meeting_url" value="${esc(b.meeting_url || '')}" class="input-field" placeholder="https://meet.google.com/..." />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Internal coordinator notes</label>
            <textarea name="internal_notes" rows="3" class="input-field">${esc(b.internal_notes || '')}</textarea>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <button type="submit" class="btn-primary">Save Changes</button>
            <button type="button" id="send-review-invite-btn" class="btn-secondary">Send Verified Review Invite</button>
          </div>
        </form>`
      );

      document.getElementById('edit-bk-form')?.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        await api(`/api/admin/bookings/${b.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: fd.get('status'),
            meeting_url: fd.get('meeting_url'),
            internal_notes: fd.get('internal_notes'),
          }),
        });
        closeModal();
        toast('Booking updated.');
        loadBookings();
      });

      document.getElementById('send-review-invite-btn')?.addEventListener('click', async () => {
        const res = await api(`/api/admin/bookings/${b.id}/review-invite`, { method: 'POST' });
        toast(`Verified review link generated & emailed.`);
        openModal(
          'Verified Review Invite Link',
          `<p class="text-sm mb-2">Single-use verified review URL (also logged to email outbox):</p>
           <input type="text" readonly value="${esc(res.reviewUrl)}" class="input-field font-mono text-xs" />`
        );
      });
    });
  });
}

// 3. AVAILABILITY & CONSULTATION TYPES
async function loadAvailability() {
  const data = await api('/api/admin/availability');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  adminContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="display text-lg">Weekly Working Hours (Africa/Lagos)</h2>
        <div class="space-y-2 text-sm">
          ${data.rules
            .map(
              (r) => `<div class="flex items-center justify-between border border-[#E1E0DD] rounded p-3">
            <span><strong>${weekdays[r.weekday]}</strong>: ${esc(r.start_time)} – ${esc(r.end_time)}</span>
            <button type="button" data-del-rule="${esc(r.id)}" class="text-xs text-red-700 underline">Remove</button>
          </div>`
            )
            .join('')}
        </div>
        <form id="add-rule-form" class="grid grid-cols-3 gap-2 pt-2 border-t border-[#E1E0DD]">
          <select name="weekday" class="input-field text-sm">${weekdays
            .map((w, i) => `<option value="${i}">${w}</option>`)
            .join('')}</select>
          <input name="start_time" type="time" value="09:00" class="input-field text-sm" />
          <input name="end_time" type="time" value="17:00" class="input-field text-sm" />
          <button type="submit" class="col-span-3 btn-secondary !py-2">Add Working Window</button>
        </form>
      </div>

      <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="display text-lg">Date Exceptions / Block-Outs</h2>
        <div class="space-y-2 text-sm">
          ${
            data.exceptions.length === 0
              ? '<p class="text-[#5D5E5F]">No blocked dates.</p>'
              : data.exceptions
                  .map(
                    (ex) => `<div class="flex items-center justify-between border border-[#E1E0DD] rounded p-3">
                  <span><strong>${esc(ex.date)}</strong> ${ex.start_time ? `(${ex.start_time}–${ex.end_time})` : '(Full day)'} · ${esc(ex.note || '')}</span>
                  <button type="button" data-del-ex="${esc(ex.id)}" class="text-xs text-red-700 underline">Remove</button>
                </div>`
                  )
                  .join('')
          }
        </div>
        <form id="add-ex-form" class="space-y-2 pt-2 border-t border-[#E1E0DD]">
          <div class="grid grid-cols-2 gap-2">
            <input name="date" type="date" required class="input-field text-sm" />
            <input name="note" placeholder="Holiday or leave note" class="input-field text-sm" />
          </div>
          <button type="submit" class="btn-secondary w-full !py-2">Block Date</button>
        </form>
      </div>
    </div>

    <div class="mt-6 border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
      <h2 class="display text-lg">Consultation Types</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${data.consultationTypes
          .map(
            (ct) => `<form data-ct-form="${esc(ct.id)}" class="border border-[#E1E0DD] rounded p-4 space-y-2.5 text-sm">
          <div class="flex items-center justify-between">
            <input name="name" value="${esc(ct.name)}" class="input-field font-medium" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <label class="text-xs">Duration (min)<input name="duration_min" type="number" value="${ct.duration_min}" class="input-field mt-1" /></label>
            <label class="text-xs">Buffer (min)<input name="buffer_min" type="number" value="${ct.buffer_min}" class="input-field mt-1" /></label>
          </div>
          <textarea name="intro" rows="2" class="input-field text-xs">${esc(ct.intro)}</textarea>
          <button type="submit" class="btn-primary !py-2 !px-4">Update Type</button>
        </form>`
          )
          .join('')}
      </div>
    </div>
  `;

  document.getElementById('add-rule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/api/admin/availability/rules', {
      method: 'POST',
      body: JSON.stringify({
        weekday: Number(fd.get('weekday')),
        start_time: fd.get('start_time'),
        end_time: fd.get('end_time'),
      }),
    });
    toast('Working window added.');
    loadAvailability();
  });

  document.querySelectorAll('[data-del-rule]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/availability/rules/${b.dataset.delRule}`, { method: 'DELETE' });
      loadAvailability();
    })
  );

  document.getElementById('add-ex-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api('/api/admin/availability/exceptions', {
      method: 'POST',
      body: JSON.stringify({ date: fd.get('date'), note: fd.get('note'), is_blocked: true }),
    });
    toast('Date blocked.');
    loadAvailability();
  });

  document.querySelectorAll('[data-del-ex]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/availability/exceptions/${b.dataset.delEx}`, { method: 'DELETE' });
      loadAvailability();
    })
  );

  document.querySelectorAll('[data-ct-form]').forEach((f) =>
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      await api(`/api/admin/consultation-types/${f.dataset.ctForm}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: fd.get('name'),
          duration_min: Number(fd.get('duration_min')),
          buffer_min: Number(fd.get('buffer_min')),
          intro: fd.get('intro'),
        }),
      });
      toast('Consultation type saved.');
    })
  );
}

// 4. INQUIRIES & APPLICATIONS
async function loadInquiries() {
  const data = await api('/api/admin/leads');
  const stages = ['new', 'contacted', 'screening', 'matched', 'on_hold', 'closed'];

  adminContent.innerHTML = `
    <div class="space-y-8">
      <div class="space-y-3">
        <h2 class="display text-lg">Surrogate &amp; Egg Donor Applications</h2>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] text-xs uppercase text-[#5D5E5F]">
              <tr><th class="p-3">Applicant</th><th class="p-3">Kind</th><th class="p-3">Location / Age</th><th class="p-3">Stage</th><th class="p-3">Notes</th></tr>
            </thead>
            <tbody class="divide-y divide-[#E1E0DD]">
              ${
                data.applications.length === 0
                  ? '<tr><td colspan="5" class="p-4 text-[#5D5E5F]">No applications yet.</td></tr>'
                  : data.applications
                      .map(
                        (a) => `<tr>
                    <td class="p-3"><p class="font-medium">${esc(a.name)}</p><p class="text-xs text-[#5D5E5F]">${esc(a.email)} · ${esc(a.phone)}</p></td>
                    <td class="p-3 capitalize">${esc(a.kind.replace('_', ' '))}</td>
                    <td class="p-3">${esc(a.city)}, ${esc(a.country)} · ${esc(a.age_range)}</td>
                    <td class="p-3">
                      <select data-lead-stage="applications:${esc(a.id)}" class="input-field !py-1.5 text-xs">
                        ${stages.map((s) => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                      </select>
                    </td>
                    <td class="p-3">
                      <button type="button" data-lead-note="applications:${esc(a.id)}" data-current-note="${esc(a.notes || '')}" class="text-xs text-[#17645F] underline">Edit note</button>
                    </td>
                  </tr>`
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <h2 class="display text-lg">Contact &amp; Cost Estimate Inquiries</h2>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] text-xs uppercase text-[#5D5E5F]">
              <tr><th class="p-3">Sender</th><th class="p-3">Type</th><th class="p-3">Message</th><th class="p-3">Stage</th><th class="p-3">Notes</th></tr>
            </thead>
            <tbody class="divide-y divide-[#E1E0DD]">
              ${
                data.inquiries.length === 0
                  ? '<tr><td colspan="5" class="p-4 text-[#5D5E5F]">No inquiries yet.</td></tr>'
                  : data.inquiries
                      .map(
                        (inq) => `<tr>
                    <td class="p-3"><p class="font-medium">${esc(inq.name)}</p><p class="text-xs text-[#5D5E5F]">${esc(inq.email)}</p></td>
                    <td class="p-3">${esc(inq.type)}</td>
                    <td class="p-3 max-w-xs text-xs">${esc(inq.message)}</td>
                    <td class="p-3">
                      <select data-lead-stage="inquiries:${esc(inq.id)}" class="input-field !py-1.5 text-xs">
                        ${stages.map((s) => `<option value="${s}" ${inq.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                      </select>
                    </td>
                    <td class="p-3">
                      <button type="button" data-lead-note="inquiries:${esc(inq.id)}" data-current-note="${esc(inq.notes || '')}" class="text-xs text-[#17645F] underline">Edit note</button>
                    </td>
                  </tr>`
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('[data-lead-stage]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const [kind, id] = sel.dataset.leadStage.split(':');
      await api(`/api/admin/leads/${kind}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value }),
      });
      toast('Pipeline stage updated.');
    });
  });

  document.querySelectorAll('[data-lead-note]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [kind, id] = btn.dataset.leadNote.split(':');
      openModal(
        'Internal Coordinator Notes',
        `<form id="lead-note-form" class="space-y-3">
          <textarea name="notes" rows="4" class="input-field">${esc(btn.dataset.currentNote || '')}</textarea>
          <button type="submit" class="btn-primary">Save Note</button>
        </form>`
      );
      document.getElementById('lead-note-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const notes = new FormData(e.target).get('notes');
        await api(`/api/admin/leads/${kind}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ notes }),
        });
        closeModal();
        toast('Notes saved.');
        loadInquiries();
      });
    });
  });
}

// 5. REVIEWS & TESTIMONIALS
async function loadReviews() {
  const data = await api('/api/admin/reviews');
  const reviews = data.reviews || [];

  adminContent.innerHTML = `
    <div class="space-y-4">
      ${reviews
        .map(
          (r) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-3 bg-[#FAF9F6]">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-display text-lg">${esc(r.title)} <span class="text-xs font-sans text-[#5D5E5F]">· ${'★'.repeat(r.rating)}</span></p>
            <p class="text-xs text-[#5D5E5F]">${esc(r.display_name)} · ${esc(r.role)} · Source: ${esc(r.source)}${r.verified ? ' · Verified client' : ''}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-[#E1E0DD] font-semibold capitalize">${esc(r.status)}</span>
            ${r.featured ? '<span class="px-2.5 py-1 rounded bg-[#17645F] text-[#FAF9F6]">Featured on Home</span>' : ''}
            ${r.source === 'legacy' && !r.confirm_permission ? '<span class="px-2.5 py-1 rounded border border-amber-700 text-amber-800">Confirm permission to publish</span>' : ''}
          </div>
        </div>
        <p class="text-sm text-[#2E3031]">“${esc(r.body)}”</p>
        ${r.admin_reply ? `<p class="text-xs text-[#17645F]"><strong>Zizo Reply:</strong> ${esc(r.admin_reply)}</p>` : ''}
        <div class="flex flex-wrap gap-2 pt-2 border-t border-[#E1E0DD]">
          ${r.status !== 'approved' ? `<button type="button" data-rev-act="approve:${esc(r.id)}" class="btn-primary !py-1.5 !px-3 !min-h-0 text-xs">Approve</button>` : ''}
          ${r.status !== 'rejected' ? `<button type="button" data-rev-act="reject:${esc(r.id)}" class="btn-secondary !py-1.5 !px-3 !min-h-0 text-xs">Reject</button>` : ''}
          <button type="button" data-rev-act="toggle_feature:${esc(r.id)}" class="btn-secondary !py-1.5 !px-3 !min-h-0 text-xs">${r.featured ? 'Unfeature' : 'Feature on Home'}</button>
          <button type="button" data-rev-edit="${esc(r.id)}" class="btn-secondary !py-1.5 !px-3 !min-h-0 text-xs">Edit / Redact &amp; Reply</button>
          ${r.source === 'legacy' && !r.confirm_permission ? `<button type="button" data-rev-act="confirm_perm:${esc(r.id)}" class="btn-secondary !py-1.5 !px-3 !min-h-0 text-xs">Mark Permission Confirmed</button>` : ''}
        </div>
      </div>`
        )
        .join('')}
    </div>
  `;

  document.querySelectorAll('[data-rev-act]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const [action, id] = btn.dataset.revAct.split(':');
      await api(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      toast('Review updated.');
      loadReviews();
    });
  });

  document.querySelectorAll('[data-rev-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const r = reviews.find((x) => x.id === btn.dataset.revEdit);
      if (!r) return;
      openModal(
        'Edit / Redact Review',
        `<form id="edit-rev-form" class="space-y-3">
          <div><label class="block text-xs font-medium mb-1">Display Label (anonymised)</label><input name="display_name" value="${esc(r.display_name)}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Title</label><input name="title" value="${esc(r.title)}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Review Text (redact any identifying info)</label><textarea name="body" rows="4" class="input-field">${esc(r.body)}</textarea></div>
          <div><label class="block text-xs font-medium mb-1">Public Reply from Zizo</label><textarea name="admin_reply" rows="2" class="input-field">${esc(r.admin_reply || '')}</textarea></div>
          <button type="submit" class="btn-primary">Save Edit (Logged)</button>
        </form>`
      );
      document.getElementById('edit-rev-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api(`/api/admin/reviews/${r.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            action: 'edit',
            display_name: fd.get('display_name'),
            title: fd.get('title'),
            body: fd.get('body'),
            admin_reply: fd.get('admin_reply'),
          }),
        });
        closeModal();
        toast('Review edited and logged.');
        loadReviews();
      });
    });
  });
}

// 6. BLOG CMS
async function loadBlog() {
  topActions.innerHTML = `<button type="button" id="btn-new-post" class="btn-primary !py-2 !px-4">New Article</button>`;
  const data = await api('/api/admin/posts');
  const posts = data.posts || [];
  const categories = data.categories || [];
  const media = data.media || [];

  adminContent.innerHTML = `
    <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] text-xs uppercase text-[#5D5E5F]">
          <tr><th class="p-3">Title</th><th class="p-3">Category</th><th class="p-3">Status</th><th class="p-3">Updated</th><th class="p-3">Actions</th></tr>
        </thead>
        <tbody class="divide-y divide-[#E1E0DD]">
          ${posts
            .map(
              (p) => `<tr>
            <td class="p-3"><p class="font-medium">${esc(p.title)}</p><p class="text-xs text-[#5D5E5F]">/resources/blog/${esc(p.slug)}/</p></td>
            <td class="p-3">${esc(p.category_name || 'Uncategorized')}</td>
            <td class="p-3 capitalize font-medium text-[#17645F]">${esc(p.status)}</td>
            <td class="p-3 text-xs tabular-nums">${esc((p.updated_at || '').slice(0, 10))}</td>
            <td class="p-3">
              <div class="flex flex-wrap gap-2 text-xs">
                <button type="button" data-edit-post="${esc(p.id)}" class="text-[#17645F] font-semibold underline">Edit</button>
                <button type="button" data-dup-post="${esc(p.id)}" class="text-[#5D5E5F] underline">Duplicate</button>
                ${p.status === 'published' ? `<a href="/resources/blog/${esc(p.slug)}/" target="_blank" class="text-[#17645F] underline">View</a>` : ''}
              </div>
            </td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  function openPostEditor(post = null) {
    const isNew = !post;
    const p = post || {
      title: '',
      slug: '',
      excerpt: '',
      body_md: '## Section Heading\n\nWrite calm, general informational guidance here.',
      featured_image_url: '/assets/img/blog-default-1920w.webp',
      featured_image_alt: 'Warm oak desk with linen notebook',
      category_id: categories[0]?.id || '',
      status: 'draft',
      publish_at: '',
      seo_title: '',
      meta_description: '',
    };

    openModal(
      isNew ? 'Create Blog Article' : `Edit: ${p.title}`,
      `<form id="blog-editor-form" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium mb-1">Title</label><input id="ed-title" name="title" value="${esc(p.title)}" required class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Slug</label><input id="ed-slug" name="slug" value="${esc(p.slug)}" required class="input-field font-mono text-xs" /></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">Category</label>
            <select name="category_id" class="input-field">${categories
              .map((c) => `<option value="${esc(c.id)}" ${p.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
              .join('')}</select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Status</label>
            <select name="status" class="input-field">
              ${['draft', 'scheduled', 'published', 'archived']
                .map((s) => `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1">Publish At (for scheduled)</label>
            <input name="publish_at" type="datetime-local" value="${esc((p.publish_at || '').slice(0, 16))}" class="input-field text-xs" />
          </div>
        </div>
        <div><label class="block text-xs font-medium mb-1">Excerpt</label><textarea name="excerpt" rows="2" required class="input-field">${esc(p.excerpt)}</textarea></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium mb-1">Featured Image</label>
            <select name="featured_image_url" class="input-field text-xs">
              ${media
                .map((m) => `<option value="${esc(m.path)}" ${p.featured_image_url === m.path ? 'selected' : ''}>${esc(m.path)}</option>`)
                .join('')}
            </select>
          </div>
          <div><label class="block text-xs font-medium mb-1">Image Alt Text (required)</label><input name="featured_image_alt" value="${esc(p.featured_image_alt || '')}" required class="input-field text-xs" /></div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-medium">Markdown Body</label>
            <button type="button" id="toggle-md-preview" class="text-xs text-[#17645F] underline">Refresh Live Preview</button>
          </div>
          <textarea id="ed-body-md" name="body_md" rows="8" required class="input-field font-mono text-xs">${esc(p.body_md)}</textarea>
          <div id="ed-live-preview" class="mt-2 p-3 border border-[#E1E0DD] rounded bg-[#FAF9F6] zizo-prose text-sm max-h-48 overflow-y-auto"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="block text-xs font-medium mb-1">SEO Title</label><input name="seo_title" value="${esc(p.seo_title || '')}" class="input-field text-xs" /></div>
          <div><label class="block text-xs font-medium mb-1">Meta Description</label><input name="meta_description" value="${esc(p.meta_description || '')}" class="input-field text-xs" /></div>
        </div>
        <div class="flex items-center justify-between gap-3 pt-2">
          <button type="submit" class="btn-primary">Save &amp; Prerender Site</button>
          <span id="autosave-status" class="text-xs text-[#5D5E5F]"></span>
        </div>
      </form>`
    );

    const titleEl = document.getElementById('ed-title');
    const slugEl = document.getElementById('ed-slug');
    const mdEl = document.getElementById('ed-body-md');
    const previewEl = document.getElementById('ed-live-preview');

    function renderPreview() {
      if (!previewEl || !mdEl) return;
      if (window.marked && window.DOMPurify) {
        previewEl.innerHTML = window.DOMPurify.sanitize(window.marked.parse(mdEl.value || ''));
      } else {
        previewEl.textContent = mdEl.value;
      }
    }
    renderPreview();
    document.getElementById('toggle-md-preview')?.addEventListener('click', renderPreview);
    mdEl?.addEventListener('input', renderPreview);

    if (isNew) {
      titleEl?.addEventListener('input', () => {
        slugEl.value = titleEl.value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      });
    }

    // 30-second autosave when editing existing draft
    if (!isNew) {
      autosaveTimer = setInterval(async () => {
        const fd = new FormData(document.getElementById('blog-editor-form'));
        await api(`/api/admin/posts/${p.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...Object.fromEntries(fd.entries()), autosave: true }),
        }).catch(() => {});
        const st = document.getElementById('autosave-status');
        if (st) st.textContent = `Autosaved at ${new Date().toLocaleTimeString()}`;
      }, 30000);
    }

    document.getElementById('blog-editor-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      if (isNew) {
        await api('/api/admin/posts', { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await api(`/api/admin/posts/${p.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      }
      closeModal();
      toast('Article saved and static pages rebuilt.');
      loadBlog();
    });
  }

  document.getElementById('btn-new-post')?.addEventListener('click', () => openPostEditor(null));
  document.querySelectorAll('[data-edit-post]').forEach((b) =>
    b.addEventListener('click', () => openPostEditor(posts.find((x) => x.id === b.dataset.editPost)))
  );
  document.querySelectorAll('[data-dup-post]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/posts/${b.dataset.dupPost}/duplicate`, { method: 'POST' });
      toast('Post duplicated as draft.');
      loadBlog();
    })
  );
}

// 7. FAQS
async function loadFaqs() {
  topActions.innerHTML = `<button type="button" id="btn-new-faq" class="btn-primary !py-2 !px-4">Add FAQ</button>`;
  const data = await api('/api/admin/faqs');
  const faqs = data.faqs || [];

  adminContent.innerHTML = `
    <div class="space-y-3">
      ${faqs
        .map(
          (f) => `<div class="border border-[#E1E0DD] rounded-[var(--radius)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p class="text-xs text-[#5D5E5F]">${esc(f.audience)} · Sort #${f.sort} ${f.show_on_home ? '· Shown on Home' : ''}</p>
          <p class="font-display text-lg">${esc(f.question)}</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" data-toggle-home-faq="${esc(f.id)}" class="btn-secondary !py-1.5 !px-3 !min-h-0 text-xs">${f.show_on_home ? 'Remove from Home' : 'Show on Home'}</button>
          <button type="button" data-del-faq="${esc(f.id)}" class="text-xs text-red-700 underline">Delete</button>
        </div>
      </div>`
        )
        .join('')}
    </div>
  `;

  document.getElementById('btn-new-faq')?.addEventListener('click', () => {
    openModal(
      'Add FAQ',
      `<form id="new-faq-form" class="space-y-3">
        <select name="audience" class="input-field">
          <option>Intended Parents</option><option>Surrogates</option><option>Donors</option><option>Legal and Costs</option>
        </select>
        <input name="question" placeholder="Question" required class="input-field" />
        <textarea name="answer" rows="3" placeholder="Answer" required class="input-field"></textarea>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="show_on_home" class="accent-[#17645F]" /> Show on Home</label>
        <button type="submit" class="btn-primary">Save FAQ</button>
      </form>`
    );
    document.getElementById('new-faq-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await api('/api/admin/faqs', {
        method: 'POST',
        body: JSON.stringify({
          audience: fd.get('audience'),
          question: fd.get('question'),
          answer: fd.get('answer'),
          show_on_home: fd.get('show_on_home') === 'on',
        }),
      });
      closeModal();
      toast('FAQ added and site rebuilt.');
      loadFaqs();
    });
  });

  document.querySelectorAll('[data-toggle-home-faq]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/faqs/${b.dataset.toggleHomeFaq}`, { method: 'PATCH', body: JSON.stringify({ toggleHome: true }) });
      loadFaqs();
    })
  );
  document.querySelectorAll('[data-del-faq]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/faqs/${b.dataset.delFaq}`, { method: 'DELETE' });
      loadFaqs();
    })
  );
}

// 8. SUBSCRIBERS
async function loadSubscribers() {
  topActions.innerHTML = `<button type="button" id="btn-export-subs" class="btn-secondary !py-2 !px-4">Export CSV</button>`;
  const data = await api('/api/admin/subscribers');
  adminContent.innerHTML = `
    <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] text-xs uppercase text-[#5D5E5F]">
          <tr><th class="p-3">Email</th><th class="p-3">Name</th><th class="p-3">Status</th><th class="p-3">Action</th></tr>
        </thead>
        <tbody class="divide-y divide-[#E1E0DD]">
          ${
            data.subscribers.length === 0
              ? '<tr><td colspan="4" class="p-4 text-[#5D5E5F]">No subscribers yet.</td></tr>'
              : data.subscribers
                  .map(
                    (s) => `<tr>
                <td class="p-3">${esc(s.email)}</td>
                <td class="p-3">${esc(s.name || '')}</td>
                <td class="p-3 capitalize">${esc(s.status)}</td>
                <td class="p-3">${s.status !== 'unsubscribed' ? `<button type="button" data-unsub="${esc(s.id)}" class="text-xs text-red-700 underline">Unsubscribe</button>` : ''}</td>
              </tr>`
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('btn-export-subs')?.addEventListener('click', () => {
    window.location.href = '/api/admin/subscribers/export';
  });
  document.querySelectorAll('[data-unsub]').forEach((b) =>
    b.addEventListener('click', async () => {
      await api(`/api/admin/subscribers/${b.dataset.unsub}`, { method: 'PATCH' });
      loadSubscribers();
    })
  );
}

// 9. SITE SETTINGS
async function loadSettings() {
  const data = await api('/api/admin/settings');
  const s = data.settings || {};

  adminContent.innerHTML = `
    <form id="settings-form" class="space-y-6 max-w-3xl">
      <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="display text-lg">Contact Details &amp; Channels</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><label class="block text-xs font-medium mb-1">Lagos Address (Confirm before launch)</label><input name="contact_address" value="${esc(s.contact_address || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Public Email (Confirm before launch)</label><input name="contact_email" value="${esc(s.contact_email || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Phone Number</label><input name="contact_phone" value="${esc(s.contact_phone || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">WhatsApp Number (digits with country code)</label><input name="whatsapp_number" value="${esc(s.whatsapp_number || '')}" class="input-field" /></div>
        </div>
      </div>

      <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="display text-lg">Trust Statistics Placeholders (Flagged for Client Confirmation)</h2>
        <p class="text-xs text-[#5D5E5F]">Values starting with {{ or left blank are automatically hidden on the public Home page until confirmed.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><label class="block text-xs font-medium mb-1">Experience</label><input name="stats_experience" value="${esc(s.stats_experience || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Families Helped (Confirm before launch)</label><input name="stats_families_helped" value="${esc(s.stats_families_helped || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Regions</label><input name="stats_regions" value="${esc(s.stats_regions || '')}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">24/7 Case-Manager Support (blank = hidden)</label><input name="stats_support_24_7" value="${esc(s.stats_support_24_7 || '')}" class="input-field" /></div>
        </div>
      </div>

      <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-4">
        <h2 class="display text-lg">Booking Rules &amp; Integrations</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><label class="block text-xs font-medium mb-1">Minimum Notice (hours)</label><input name="booking_min_notice_hours" type="number" value="${Number(s.booking_min_notice_hours ?? 12)}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Cancel Cutoff (hours)</label><input name="cancel_cutoff_hours" type="number" value="${Number(s.cancel_cutoff_hours ?? 24)}" class="input-field" /></div>
          <div><label class="block text-xs font-medium mb-1">Daily Cap</label><input name="booking_daily_cap" type="number" value="${Number(s.booking_daily_cap ?? 8)}" class="input-field" /></div>
        </div>
        <div class="flex flex-wrap gap-5 pt-2 text-sm">
          <label class="flex items-center gap-2"><input type="checkbox" name="auto_confirm_bookings" ${s.auto_confirm_bookings ? 'checked' : ''} class="accent-[#17645F]" /> Auto-confirm bookings (off = request &amp; approve)</label>
          <label class="flex items-center gap-2"><input type="checkbox" name="payment_enabled" ${s.payment_enabled ? 'checked' : ''} class="accent-[#17645F]" /> Enable Paystack/Stripe paid consultations</label>
          <label class="flex items-center gap-2"><input type="checkbox" name="gcal_sync_enabled" ${s.gcal_sync_enabled ? 'checked' : ''} class="accent-[#17645F]" /> Google Calendar &amp; Meet sync</label>
        </div>
      </div>

      <button type="submit" class="btn-primary">Save Settings &amp; Rebuild Site</button>
    </form>
  `;

  document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      contact_address: fd.get('contact_address'),
      contact_email: fd.get('contact_email'),
      contact_phone: fd.get('contact_phone'),
      whatsapp_number: fd.get('whatsapp_number'),
      stats_experience: fd.get('stats_experience'),
      stats_families_helped: fd.get('stats_families_helped'),
      stats_regions: fd.get('stats_regions'),
      stats_support_24_7: fd.get('stats_support_24_7'),
      booking_min_notice_hours: Number(fd.get('booking_min_notice_hours')),
      cancel_cutoff_hours: Number(fd.get('cancel_cutoff_hours')),
      booking_daily_cap: Number(fd.get('booking_daily_cap')),
      auto_confirm_bookings: fd.get('auto_confirm_bookings') === 'on',
      payment_enabled: fd.get('payment_enabled') === 'on',
      gcal_sync_enabled: fd.get('gcal_sync_enabled') === 'on',
    };
    await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) });
    toast('Settings saved and static pages rebuilt.');
  });
}

// 10. AUDIT LOG
async function loadAudit() {
  const data = await api('/api/admin/audit');
  adminContent.innerHTML = `
    <div class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#E1E0DD]/50 border-b border-[#E1E0DD] uppercase text-[#5D5E5F]">
          <tr><th class="p-3">Time</th><th class="p-3">Actor</th><th class="p-3">Action</th><th class="p-3">Table</th><th class="p-3">Details</th></tr>
        </thead>
        <tbody class="divide-y divide-[#E1E0DD]">
          ${data.logs
            .map(
              (l) => `<tr>
            <td class="p-3 tabular-nums">${esc(l.created_at.slice(0, 19).replace('T', ' '))}</td>
            <td class="p-3 font-medium">${esc(l.actor)}</td>
            <td class="p-3">${esc(l.action)}</td>
            <td class="p-3">${esc(l.table_name)}</td>
            <td class="p-3 font-mono max-w-xs truncate">${esc(l.diff || '')}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Check existing session on load
fetch('/api/admin/auth/me')
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => {
    if (d?.staff) {
      enterWorkspace(d.staff);
    }
  })
  .catch(() => {});
