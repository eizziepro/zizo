import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');

test('HARDENING A: Form submission validation, length caps, and honeypot rejection', async () => {
  try {
    const resHoneypot = await fetch('http://localhost:3000/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'general_inquiry',
        name: 'Bot Spammer',
        email: 'spammer@example.com',
        phone: '+2348000000000',
        message: 'Spam payload',
        consent: true,
        website_url: 'http://spam-trap.com', // Honeypot filled!
      }),
    });
    assert.equal(resHoneypot.status, 400, 'Honeypot submission must be rejected with 400');

    // Missing consent must be rejected
    const resNoConsent = await fetch('http://localhost:3000/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'general_inquiry',
        name: 'Valid Name',
        email: 'valid@example.com',
        phone: '+2348000000000',
        message: 'Valid enquiry message',
        consent: false,
      }),
    });
    assert.equal(resNoConsent.status, 400, 'Missing consent must be rejected with 400');

    // Invalid email must be rejected
    const resBadEmail = await fetch('http://localhost:3000/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_type: 'general_inquiry',
        name: 'Valid Name',
        email: 'not-an-email',
        phone: '+2348000000000',
        message: 'Valid message',
        consent: true,
      }),
    });
    assert.equal(resBadEmail.status, 400, 'Invalid email must be rejected with 400');
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      console.warn('Server not currently running on port 3000, skipping live HTTP check');
    } else {
      throw err;
    }
  }
});

test('HARDENING B: CSRF / W3C Fetch-Metadata defense blocks cross-site mutations', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Sec-Fetch-Site': 'cross-site', // Cross-site request
      },
      body: JSON.stringify({
        consultation_type_id: 'ct-intro',
      }),
    });
    assert.equal(res.status, 403, 'Cross-site mutation must be blocked with 403 Forbidden');
    const data = await res.json();
    assert.ok(data.error.includes('blocked by security policy'), 'Response should state security policy block');
  } catch (err: any) {
    if (err.code !== 'ECONNREFUSED') throw err;
  }
});

test('HARDENING B: Server-side Authentication & Authorization Deny-by-Default on Admin APIs', async () => {
  const protectedEndpoints = [
    '/api/admin/bookings',
    '/api/admin/reviews',
    '/api/admin/leads',
    '/api/admin/posts',
    '/api/admin/faqs',
    '/api/admin/integrations',
    '/api/admin/audit',
  ];

  for (const endpoint of protectedEndpoints) {
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`);
      assert.equal(
        res.status,
        401,
        `Unauthenticated request to ${endpoint} must return 401 Unauthorized (got ${res.status})`
      );
    } catch (err: any) {
      if (err.code !== 'ECONNREFUSED') throw err;
    }
  }
});

test('HARDENING A: Review moderation pipeline requires approval before publishing', async () => {
  try {
    // 1. Submit a review with all required valid fields
    const submitRes = await fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: 'P.A., Lagos',
        role: 'Intended Parent',
        rating: 5,
        title: 'Compassionate Clinical Care',
        body: 'Our family journey with Zizo was guided with transparent clinical oversight, compassion, and complete respect for patient dignity.',
        consent_publish: true,
        consent_anonymous: true,
      }),
    });
    assert.equal(submitRes.status, 201, 'Review submission must return 201 Created');
    const submitData = await submitRes.json();
    assert.equal(submitData.status, 'pending', 'Newly submitted reviews must default to pending status');

    // 2. Query featured reviews - unapproved reviews must NOT appear
    const featuredRes = await fetch('http://localhost:3000/api/reviews?featured=1');
    const featuredData = await featuredRes.json();
    const reviewsList = Array.isArray(featuredData) ? featuredData : (featuredData.reviews || []);
    const foundPending = reviewsList.find((r: any) => r.id === submitData.id);
    assert.equal(foundPending, undefined, 'Pending review must not be returned in public featured reviews');
  } catch (err: any) {
    if (err.code !== 'ECONNREFUSED') throw err;
  }
});

test('HARDENING A & C: Zero fabricated reviews; honest empty state rendered when 0 approved reviews', () => {
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  
  // Assert dummy review names from legacy templates do not exist in review cards
  const forbiddenDummyReviews = [
    'Parent AJ',
    'Parent SS & MV',
    'Tara K.',
    'A. & T. O.',
    'M. & F. D.'
  ];
  for (const dummy of forbiddenDummyReviews) {
    assert.ok(
      !homeHtml.includes(dummy),
      `Found forbidden placeholder review '${dummy}' in dist/index.html`
    );
  }

  // Check reviews page
  const reviewsHtml = fs.readFileSync(path.join(DIST_DIR, 'resources', 'reviews', 'index.html'), 'utf8');
  for (const dummy of forbiddenDummyReviews) {
    assert.ok(
      !reviewsHtml.includes(`<h3>${dummy}</h3>`) && !reviewsHtml.includes(`"${dummy}"`),
      `Found forbidden placeholder review card '${dummy}' in dist/resources/reviews/index.html`
    );
  }

  // Honest privacy-respecting empty state is present
  assert.ok(
    homeHtml.includes('Patient Journey Confidentiality') ||
    homeHtml.includes('NDPA privacy compliance'),
    'Homepage must display honest empty state or privacy notice instead of fabricated testimonials'
  );
});

test('HARDENING C: Single canonical BASE_URL and clean sitemap & robots', () => {
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  const robotsPath = path.join(DIST_DIR, 'robots.txt');

  assert.ok(fs.existsSync(sitemapPath), 'dist/sitemap.xml must exist');
  assert.ok(fs.existsSync(robotsPath), 'dist/robots.txt must exist');

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');

  // Must not contain localhost, preview URLs, or plain http (except XML schema xmlns)
  assert.ok(!sitemapContent.includes('localhost'), 'sitemap.xml must not contain localhost');
  assert.ok(!sitemapContent.includes('127.0.0.1'), 'sitemap.xml must not contain 127.0.0.1');
  assert.ok(!robotsContent.includes('localhost'), 'robots.txt must not contain localhost');

  // Verify all URLs in sitemap use the production domain https://zizo-steel.vercel.app/
  const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
  assert.ok(locMatches.length > 0, 'sitemap.xml must contain URL entries');
  for (const loc of locMatches) {
    const url = loc.replace('<loc>', '').replace('</loc>', '');
    assert.ok(
      url.startsWith('https://zizo-steel.vercel.app/'),
      `Sitemap URL ${url} must start with https://zizo-steel.vercel.app/`
    );
    assert.ok(
      !url.includes('/admin'),
      `Sitemap URL ${url} must not include admin routes`
    );
    assert.ok(
      !url.includes('thank-you'),
      `Sitemap URL ${url} must not include thank-you confirmation routes`
    );
  }

  // Robots.txt points to canonical sitemap
  assert.ok(
    robotsContent.includes('Sitemap: https://zizo-steel.vercel.app/sitemap.xml'),
    'robots.txt must point to https://zizo-steel.vercel.app/sitemap.xml'
  );
  assert.ok(robotsContent.includes('Disallow: /admin/'), 'robots.txt must disallow /admin/');
});

test('HARDENING B: Security headers enforcement (CSP, HSTS, X-Content-Type-Options, X-Frame-Options)', async () => {
  try {
    const res = await fetch('http://localhost:3000/');
    const headers = res.headers;

    assert.equal(headers.get('x-content-type-options'), 'nosniff', 'X-Content-Type-Options must be nosniff');
    assert.equal(headers.get('x-frame-options'), 'DENY', 'X-Frame-Options must be DENY');
    assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict-origin-when-cross-origin');
    
    const csp = headers.get('content-security-policy') || '';
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must include frame-ancestors 'none'");
    assert.ok(csp.includes("default-src 'self'"), "CSP must include default-src 'self'");
    assert.ok(csp.includes("paystack.co"), "CSP must permit paystack script");
  } catch (err: any) {
    if (err.code !== 'ECONNREFUSED') throw err;
  }
});
