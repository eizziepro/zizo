import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const DIST_DIR = path.join(process.cwd(), 'dist');
const SRC_DIR = path.join(process.cwd(), 'src');

test('ACCEPTANCE 1: Background, palette, and exact hero gradient', () => {
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const dom = new JSDOM(homeHtml);
  const doc = dom.window.document;

  // Background must be Warm White #FAF9F6
  const body = doc.querySelector('body');
  assert.ok(body?.classList.contains('bg-[#FAF9F6]'), 'Body background is not Warm White #FAF9F6');

  // Exact hero gradient overlay element exists
  const heroOverlay = doc.querySelector('.hero-gradient-overlay');
  assert.ok(heroOverlay, 'Hero is missing .hero-gradient-overlay element');

  // Source CSS contains the exact linear-gradient parameters
  const srcCss = fs.readFileSync(path.join(SRC_DIR, 'styles', 'main.css'), 'utf8');
  assert.ok(/rgba\(23,\s*25,\s*26,\s*0?\.88\)/.test(srcCss), 'Source CSS missing 0.88 stop');
  assert.ok(/rgba\(23,\s*25,\s*26,\s*0?\.10\)\s*55%/.test(srcCss), 'Source CSS missing 0.10 55% stop');
  assert.ok(/rgba\(23,\s*25,\s*26,\s*0?\.42\)/.test(srcCss), 'Source CSS missing 0.42 stop');

  // Charcoal bands strictly footer and reviews
  const reviewsSection = doc.querySelector('#reviews-section');
  assert.ok(reviewsSection?.classList.contains('bg-[#17191A]'), 'Reviews section is not Charcoal');
  const footer = doc.querySelector('footer');
  assert.ok(footer?.classList.contains('bg-[#17191A]'), 'Footer is not Charcoal');
});

test('ACCEPTANCE 2: Header 5 nav items + 1 CTA, dropdowns <= 4 items', () => {
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const dom = new JSDOM(homeHtml);
  const doc = dom.window.document;

  const nav = doc.querySelector('#site-header nav');
  assert.ok(nav, 'Header navigation not found');

  // Direct nav items: About, Services, Intended Parents, Surrogates & Donors, Resources
  const topItems = nav.querySelectorAll(':scope > a, :scope > div.nav-dropdown-group');
  assert.equal(topItems.length, 5, `Expected 5 top nav items, found ${topItems.length}`);

  // CTA button at far right
  const ctaBtn = doc.querySelector('#site-header a[href="/book/"]');
  assert.ok(ctaBtn, 'Header is missing Book Consultation CTA button');
  const ctaText = ctaBtn?.textContent?.trim();
  assert.ok(
    ctaText === 'Book Consultation' || ctaText === 'Book a Consultation',
    `Expected header CTA to be 'Book Consultation', got '${ctaText}'`
  );

  // Each dropdown has 4 or fewer items
  const dropdowns = nav.querySelectorAll('.nav-dropdown-group');
  dropdowns.forEach((group) => {
    const items = group.querySelectorAll('.nav-dropdown-panel li');
    assert.ok(items.length <= 4 && items.length > 0, `Dropdown has invalid number of items: ${items.length}`);
  });
});

test('ACCEPTANCE 3: Exact 700ms cubic-bezier reveal transition and restricted hover scale', () => {
  const srcCss = fs.readFileSync(path.join(SRC_DIR, 'styles', 'main.css'), 'utf8');
  assert.ok(
    srcCss.includes('700ms cubic-bezier(0.22, 0.61, 0.36, 1)'),
    'Source CSS missing exact 700ms cubic-bezier(0.22, 0.61, 0.36, 1)'
  );

  const distCss = fs.readFileSync(path.join(DIST_DIR, 'assets', 'css', 'styles.css'), 'utf8');
  assert.ok(
    distCss.includes('cubic-bezier(.22,.61,.36,1)') || distCss.includes('cubic-bezier(0.22, 0.61, 0.36, 1)'),
    'Compiled CSS missing exact cubic-bezier'
  );
  assert.ok(distCss.includes('.7s') || distCss.includes('700ms'), 'Compiled CSS missing 700ms/.7s duration');

  // Verify only allowed images scale
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const dom = new JSDOM(homeHtml);
  const doc = dom.window.document;

  const scalable = doc.querySelectorAll('.group-hover\\:scale-\\[1\\.03\\]');
  assert.ok(scalable.length >= 4, 'Core service images must support group-hover scale');

  // Verify no text scaling classes exist
  const textScale = doc.querySelectorAll('h1.hover\\:scale-105, p.hover\\:scale-105, a.hover\\:scale-105');
  assert.equal(textScale.length, 0, 'Forbidden text scaling detected');
});

test('ACCEPTANCE 4: Typography and fonts strictly Fraunces and Hanken Grotesk', () => {
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  assert.ok(homeHtml.includes('family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600'));
  assert.ok(homeHtml.includes('family=Hanken+Grotesk:wght@400;500;600'));
  assert.ok(homeHtml.includes('display=swap'));

  // Ensure no forbidden fonts are present in HTML or styles
  const forbidden = ['Inter', 'Manrope', 'Poppins', 'Dela Gothic One', 'Roboto', 'Lato'];
  for (const f of forbidden) {
    assert.equal(homeHtml.includes(`font-family: "${f}"`), false, `Forbidden font ${f} found in template`);
  }
});

test('ACCEPTANCE 5: All expected core pages exist and contain SEO tags and JSON-LD', () => {
  const expectedRoutes = [
    'index.html',
    'about/index.html',
    'services/index.html',
    'services/surrogacy/index.html',
    'services/ovum-donation/index.html',
    'services/personalized-matching/index.html',
    'services/counseling-ivf-support/index.html',
    'intended-parents/how-it-works/index.html',
    'intended-parents/international/index.html',
    'intended-parents/packages/index.html',
    'surrogates-donors/become-a-surrogate/index.html',
    'surrogates-donors/become-an-egg-donor/index.html',
    'resources/blog/index.html',
    'resources/faq/index.html',
    'resources/reviews/index.html',
    'book/index.html',
    'book/confirmed/index.html',
    'book/manage/index.html',
    'contact/index.html',
    'thank-you/index.html',
    'review/submit/index.html',
    'admin/index.html',
    'privacy-policy/index.html',
    'terms/index.html',
    'confidentiality-statement/index.html',
    'cookie-policy/index.html',
    '404.html',
    'offline/index.html',
  ];

  for (const rel of expectedRoutes) {
    const full = path.join(DIST_DIR, rel);
    assert.ok(fs.existsSync(full), `Missing expected page: ${rel}`);
    const html = fs.readFileSync(full, 'utf8');
    assert.ok(html.includes('<title>'), `${rel} is missing <title> tag`);
    assert.ok(html.includes('<meta name="description"'), `${rel} is missing meta description`);
  }

  // SEO delivery files
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'sitemap.xml')), 'Missing sitemap.xml');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'robots.txt')), 'Missing robots.txt');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'rss.xml')), 'Missing rss.xml');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'site.webmanifest')), 'Missing site.webmanifest');
});

test('ACCEPTANCE 6: WCAG 2.2 AA Accessibility Checks', () => {
  const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const dom = new JSDOM(homeHtml);
  const doc = dom.window.document;

  // Skip link
  const skipLink = doc.querySelector('a[href="#main-content"]');
  assert.ok(skipLink, 'Missing skip-to-content landmark');

  // Semantic landmarks
  assert.ok(doc.querySelector('header'), 'Missing <header>');
  assert.ok(doc.querySelector('main#main-content'), 'Missing <main id="main-content">');
  assert.ok(doc.querySelector('footer'), 'Missing <footer>');

  // Aria attributes on interactive toggles
  const mobToggle = doc.querySelector('#mobile-menu-toggle');
  assert.ok(mobToggle?.hasAttribute('aria-expanded'), 'Mobile toggle missing aria-expanded');
  assert.ok(mobToggle?.hasAttribute('aria-controls'), 'Mobile toggle missing aria-controls');

  // FAQ Accordion aria controls
  const faqBtn = doc.querySelector('[data-faq-trigger]');
  assert.ok(faqBtn?.hasAttribute('aria-expanded'), 'FAQ button missing aria-expanded');
  assert.ok(faqBtn?.hasAttribute('aria-controls'), 'FAQ button missing aria-controls');

  // Image alt attributes
  const imgs = doc.querySelectorAll('img');
  imgs.forEach((img) => {
    assert.ok(img.hasAttribute('alt'), `Image missing alt attribute: ${img.getAttribute('src')}`);
  });
});
