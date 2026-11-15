function showToast(msg) {
  const el = document.getElementById('zizo-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 4500);
}

window.zizoToast = showToast;

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function initHeaderAndParallax() {
  const header = document.getElementById('site-header');
  const heroMedia = document.getElementById('hero-media');
  const isHome = header?.dataset.home === 'true';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY || 0;
    if (header && isHome) {
      if (y > 100) {
        header.classList.remove('header-transparent');
        header.classList.add('header-scrolled');
      } else {
        header.classList.add('header-transparent');
        header.classList.remove('header-scrolled');
      }
    }
    if (heroMedia && !reducedMotion) {
      heroMedia.style.transform = `translateY(${y * 0.1}px) scale(1.03)`;
    }
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

function initMenus() {
  // Desktop dropdown keyboard navigation
  const dropdowns = document.querySelectorAll('[data-dropdown]');
  dropdowns.forEach((group) => {
    const trigger = group.querySelector('button');
    const links = Array.from(group.querySelectorAll('a'));
    if (!trigger) return;

    function setOpen(open) {
      group.setAttribute('data-open', open ? 'true' : 'false');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    trigger.addEventListener('click', () => {
      const open = group.getAttribute('data-open') === 'true';
      dropdowns.forEach((g) => {
        if (g !== group) {
          g.setAttribute('data-open', 'false');
          g.querySelector('button')?.setAttribute('aria-expanded', 'false');
        }
      });
      setOpen(!open);
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        links[0]?.focus();
      } else if (e.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    group.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const idx = links.indexOf(document.activeElement);
        if (idx !== -1) {
          e.preventDefault();
          const next = e.key === 'ArrowDown' ? (idx + 1) % links.length : (idx - 1 + links.length) % links.length;
          links[next]?.focus();
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach((group) => {
      if (!group.contains(e.target)) {
        group.setAttribute('data-open', 'false');
        group.querySelector('button')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile Menu Toggle
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconMenu = toggleBtn?.querySelector('[data-icon-menu]');
  const iconClose = toggleBtn?.querySelector('[data-icon-close]');

  function setMobileOpen(open) {
    if (!toggleBtn || !mobileMenu) return;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.classList.toggle('hidden', !open);
    iconMenu?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggleBtn?.addEventListener('click', () => {
    const open = toggleBtn.getAttribute('aria-expanded') === 'true';
    setMobileOpen(!open);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMobileOpen(false));
  });

  mobileMenu?.querySelectorAll('[data-mobile-accordion]').forEach((acc) => {
    const btn = acc.querySelector('button');
    const panel = acc.querySelector('div');
    btn?.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel?.classList.toggle('hidden', expanded);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn?.getAttribute('aria-expanded') === 'true') {
      setMobileOpen(false);
      toggleBtn.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && toggleBtn?.getAttribute('aria-expanded') === 'true') {
      setMobileOpen(false);
    }
  });
}

function initRevealObserver() {
  const els = document.querySelectorAll('.reveal');
  if (els.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => io.observe(el));
}

function initFaqAccordions() {
  document.querySelectorAll('[data-faq-group]').forEach((group) => {
    const items = group.querySelectorAll('.faq-item');
    items.forEach((item) => {
      const btn = item.querySelector('[data-faq-trigger]');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.getAttribute('data-open') === 'true';
        items.forEach((other) => {
          other.setAttribute('data-open', 'false');
          other.querySelector('[data-faq-trigger]')?.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.setAttribute('data-open', 'true');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

function initReviewsCarousel() {
  const container = document.getElementById('reviews-carousel');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  if (!container) return;

  let allReviews = [];
  let offset = 0;

  function renderSlice() {
    if (allReviews.length === 0) return;
    const count = Math.min(3, allReviews.length);
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(allReviews[(offset + i) % allReviews.length]);
    }
    container.innerHTML = items
      .map((rev) => {
        const initials = (rev.display_name || 'Z')
          .replace(/[^A-Za-z]/g, '')
          .slice(0, 2)
          .toUpperCase() || 'Z';
        const verifiedText = rev.verified ? ' · Verified client' : '';
        const countryHtml = rev.country
          ? `<p class="text-xs text-[#FAF9F6]/70">${escapeClient(rev.country)}</p>`
          : '';
        return `<article class="bg-[#FAF9F6]/5 border border-[#FAF9F6]/15 rounded-[var(--radius)] p-6 flex flex-col justify-between gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <i data-lucide="quote" class="w-6 h-6 text-[#8BB2AF]"></i>
              <span class="text-xs text-[#FAF9F6]/70">${escapeClient(rev.role)}${verifiedText}</span>
            </div>
            <p class="text-[length:var(--fs-body)] text-[#FAF9F6]/90 leading-relaxed">“${escapeClient(rev.body)}”</p>
          </div>
          <div class="flex items-center gap-3 pt-2 border-t border-[#FAF9F6]/10">
            <span class="w-10 h-10 rounded-full bg-[#8BB2AF] text-[#17191A] font-semibold text-xs inline-flex items-center justify-center shrink-0">${escapeClient(initials)}</span>
            <div>
              <p class="font-medium text-[length:var(--fs-small)] text-[#FAF9F6]">${escapeClient(rev.display_name)}</p>
              ${countryHtml}
            </div>
          </div>
        </article>`;
      })
      .join('');
    refreshIcons();
  }

  fetch('/api/reviews?featured=1')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.reviews?.length) {
        allReviews = data.reviews;
        renderSlice();
      }
    })
    .catch(() => {});

  prevBtn?.addEventListener('click', () => {
    if (allReviews.length === 0) return;
    offset = (offset - 1 + allReviews.length) % allReviews.length;
    renderSlice();
  });

  nextBtn?.addEventListener('click', () => {
    if (allReviews.length === 0) return;
    offset = (offset + 1) % allReviews.length;
    renderSlice();
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn?.click();
    if (e.key === 'ArrowLeft') prevBtn?.click();
  });
}

function escapeClient(s = '') {
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

function initFiltersAndSearch() {
  // Blog live search
  const blogInput = document.getElementById('blog-search-input');
  const blogCards = document.querySelectorAll('[data-post-card]');
  const blogEmpty = document.getElementById('blog-empty-msg');
  blogInput?.addEventListener('input', () => {
    const q = blogInput.value.trim().toLowerCase();
    let visible = 0;
    blogCards.forEach((card) => {
      const match =
        !q ||
        (card.dataset.title || '').includes(q) ||
        (card.dataset.excerpt || '').includes(q);
      card.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    blogEmpty?.classList.toggle('hidden', visible > 0);
  });

  // FAQ live search
  const faqInput = document.getElementById('faq-search-input');
  faqInput?.addEventListener('input', () => {
    const q = faqInput.value.trim().toLowerCase();
    document.querySelectorAll('[data-faq-section]').forEach((sec) => {
      let sectionMatches = 0;
      sec.querySelectorAll('.faq-item').forEach((item) => {
        const hay = item.dataset.faqSearch || '';
        const match = !q || hay.includes(q);
        item.classList.toggle('hidden', !match);
        if (match) sectionMatches++;
      });
      sec.classList.toggle('hidden', sectionMatches === 0);
    });
  });

  // Stories & Reviews role filter
  const reviewFilterBtns = document.querySelectorAll('[data-review-filter]');
  const reviewCards = document.querySelectorAll('[data-review-card]');
  reviewFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.reviewFilter;
      reviewFilterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('bg-[#17645F]', active);
        b.classList.toggle('text-[#FAF9F6]', active);
        b.classList.toggle('bg-[#E1E0DD]', !active);
        b.classList.toggle('text-[#17191A]', !active);
      });
      reviewCards.forEach((card) => {
        const match = role === 'all' || card.dataset.role === role;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  // Copy article link
  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Article link copied to clipboard.');
      } catch {
        showToast('Copy link from your browser address bar.');
      }
    });
  });
}

function initForms() {
  // Newsletter form
  const nlForm = document.getElementById('footer-newsletter-form');
  nlForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = nlForm.querySelector('[data-form-status]');
    const btn = nlForm.querySelector('button[type="submit"]');
    const fd = new FormData(nlForm);
    const payload = {
      form_kind: 'newsletter',
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      consent: fd.get('consent') === 'on',
      website_url: String(fd.get('website_url') || ''),
    };
    if (!payload.email || !payload.consent) {
      if (status) status.textContent = 'Please enter a valid email and confirm consent.';
      return;
    }
    btn.disabled = true;
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not subscribe.');
      nlForm.reset();
      if (status) status.textContent = data.message || 'Please check your email to confirm.';
      showToast('Newsletter signup received.');
    } catch (err) {
      if (status) status.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });

  // Contact, Cost Estimate, and Surrogate/Donor Application forms
  document.querySelectorAll('[data-zizo-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const status = form.querySelector('[data-form-status]');
      const btn = form.querySelector('button[type="submit"]');
      const formKind = form.dataset.zizoForm;
      const fd = new FormData(form);
      const body = Object.fromEntries(fd.entries());
      body.form_kind = formKind;
      body.consent = fd.get('consent') === 'on';

      btn.disabled = true;
      if (status) status.textContent = 'Sending securely…';

      try {
        const res = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed.');
        const ctxKind = formKind === 'application' ? body.kind || 'application' : formKind;
        window.location.href = `/thank-you/?type=${encodeURIComponent(ctxKind)}`;
      } catch (err) {
        if (status) {
          status.textContent = err.message;
          status.classList.add('text-red-700');
        }
        btn.disabled = false;
      }
    });
  });

  // Review Submission form (public & verified token)
  const revForm = document.getElementById('review-submit-form');
  revForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = revForm.querySelector('[data-form-status]');
    const btn = revForm.querySelector('button[type="submit"]');
    const fd = new FormData(revForm);
    const urlToken = new URLSearchParams(window.location.search).get('token') || '';
    const token = revForm.dataset.verifiedToken === 'url' ? urlToken : '';

    const payload = {
      token,
      display_name: String(fd.get('display_name') || ''),
      role: String(fd.get('role') || ''),
      rating: Number(fd.get('rating') || 5),
      country: String(fd.get('country') || ''),
      title: String(fd.get('title') || ''),
      body: String(fd.get('body') || ''),
      consent_publish: fd.get('consent_publish') === 'on',
      consent_anonymous: fd.get('consent_anonymous') === 'on',
      website_url: String(fd.get('website_url') || ''),
    };

    btn.disabled = true;
    if (status) {
      status.classList.remove('text-red-700');
      status.textContent = 'Submitting for moderation…';
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit review.');
      revForm.reset();
      if (status) status.textContent = data.message || 'Thank you. Your review is awaiting moderation.';
      showToast('Review submitted for moderation.');
    } catch (err) {
      if (status) {
        status.classList.add('text-red-700');
        status.textContent = err.message;
      }
    } finally {
      btn.disabled = false;
    }
  });

  // Thank You page context copy
  const tyEl = document.getElementById('thank-you-context');
  if (tyEl) {
    const type = new URLSearchParams(window.location.search).get('type');
    if (type === 'surrogate') {
      tyEl.textContent =
        'Thank you for submitting your initial surrogate interest. A Zizo coordinator will reach out discreetly to arrange a private information call.';
    } else if (type === 'egg_donor') {
      tyEl.textContent =
        'Thank you for submitting your initial egg donor interest. Our team will contact you privately to answer your questions.';
    } else if (type === 'cost_estimate') {
      tyEl.textContent =
        'Thank you. Our team has received your personalised estimate request and will respond with clear programme guidance.';
    }
  }
}

function initCookies() {
  const banner = document.getElementById('cookie-banner');
  const modal = document.getElementById('cookie-modal');
  const toggle = document.getElementById('cookie-analytics-toggle');
  const openBtn = document.getElementById('open-cookie-settings');
  const manageBtn = document.getElementById('cookie-manage-btn');
  const closeBtn = document.getElementById('cookie-modal-close');
  const acceptAllBtn = document.getElementById('cookie-accept-all');
  const essentialBtn = document.getElementById('cookie-essential-only');
  const saveBtn = document.getElementById('cookie-save-prefs');

  const STORAGE_KEY = 'zizo_cookie_consent_v1';
  let lastFocus = null;

  function saveConsent(analytics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics, savedAt: Date.now() }));
    banner?.classList.add('hidden');
    closeModal();
  }

  function openModal() {
    lastFocus = document.activeElement;
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (toggle) toggle.checked = Boolean(saved.analytics);
    modal?.classList.remove('hidden');
    closeBtn?.focus();
  }

  function closeModal() {
    modal?.classList.add('hidden');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    banner?.classList.remove('hidden');
  }

  acceptAllBtn?.addEventListener('click', () => saveConsent(true));
  essentialBtn?.addEventListener('click', () => saveConsent(false));
  manageBtn?.addEventListener('click', openModal);
  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  saveBtn?.addEventListener('click', () => saveConsent(Boolean(toggle?.checked)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  refreshIcons();
  initHeaderAndParallax();
  initMenus();
  initRevealObserver();
  initFaqAccordions();
  initReviewsCarousel();
  initFiltersAndSearch();
  initForms();
  initCookies();
});
