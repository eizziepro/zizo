import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import Database from 'better-sqlite3';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';

import { renderHomePage } from './src/site/pages/home.mjs';
import {
  renderAboutPage,
  renderServiceDetailPage,
  renderServicesHub,
} from './src/site/pages/aboutAndServices.mjs';
import {
  renderCostsPage,
  renderHowItWorksPage,
  renderLegalEthicsPage,
  renderProgramsByCountryPage,
} from './src/site/pages/intendedParents.mjs';
import {
  renderBecomeEggDonorPage,
  renderBecomeSurrogatePage,
  renderCompensationSupportPage,
} from './src/site/pages/surrogatesDonors.mjs';
import {
  render404Page,
  renderBlogIndexPage,
  renderBlogPostPage,
  renderContactPage,
  renderFaqPage,
  renderLegalPage,
  renderOfflinePage,
  renderStoriesReviewsPage,
  renderThankYouPage,
  renderVerifiedReviewPage,
} from './src/site/pages/resourcesAndForms.mjs';
import {
  renderAdminPage,
  renderBookingConfirmedPage,
  renderBookingManagePage,
  renderBookingPage,
} from './src/site/pages/bookingAndAdmin.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DB_PATH = path.join(ROOT, 'data', 'zizo.db');
const SITE_URL = (process.env.APP_URL || 'https://zizo-steel.vercel.app').replace(/\/$/, '');

const jsdomWindow = new JSDOM('').window;
const DOMPurify = createDOMPurify(jsdomWindow);

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizeMarkdown(markdown = '') {
  marked.setOptions({ gfm: true, breaks: false });
  const raw = marked.parse(markdown);
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em',
      'blockquote', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br',
    ],
    ALLOWED_ATTR: ['href', 'rel', 'target', 'src', 'alt', 'width', 'height', 'id'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form'],
  });
  DOMPurify.removeAllHooks();

  const dom = new JSDOM(`<body>${clean}</body>`);
  const toc = [];
  const seen = new Set();
  dom.window.document.querySelectorAll('h2, h3').forEach((el) => {
    const text = (el.textContent || '').trim();
    if (!text) return;
    let base = slugify(text) || 'section';
    let id = base;
    let i = 2;
    while (seen.has(id)) id = `${base}-${i++}`;
    seen.add(id);
    el.setAttribute('id', id);
    toc.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 });
  });

  return { html: dom.window.document.body.innerHTML, toc };
}

function writeHtml(relPath, html) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function loadBuildData() {
  if (!fs.existsSync(DB_PATH)) {
    return {
      settings: {},
      services: [],
      consultationTypes: [],
      faqs: [],
      reviews: [],
      categories: [],
      posts: [],
      hasPublishedDbPosts: false,
    };
  }

  const db = new Database(DB_PATH, { readonly: true });
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all();
  const settings = {};
  for (const r of settingsRows) {
    try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
  }

  let services = [];
  try {
    services = db
      .prepare("SELECT * FROM services WHERE status = 'published' ORDER BY sort_order ASC, created_at ASC")
      .all()
      .map((s) => ({
        ...s,
        featured: Boolean(s.featured),
        show_price: Boolean(s.show_price),
        seo: typeof s.seo === 'string' ? JSON.parse(s.seo || '{}') : s.seo || {},
      }));
  } catch {
    services = [];
  }

  const consultationTypes = db
    .prepare('SELECT * FROM consultation_types WHERE active = 1 ORDER BY sort ASC')
    .all();

  const faqs = db
    .prepare('SELECT * FROM faqs WHERE published = 1 ORDER BY sort ASC')
    .all();

  const reviews = db
    .prepare("SELECT * FROM reviews WHERE status = 'approved' ORDER BY featured DESC, approved_at DESC, created_at DESC")
    .all();

  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();

  const publishedPosts = db
    .prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, s.full_name AS author_name
       FROM posts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN staff s ON p.author_id = s.id
       WHERE p.status = 'published'
       ORDER BY COALESCE(p.publish_at, p.created_at) DESC`
    )
    .all();

  db.close();

  return {
    settings,
    services,
    consultationTypes,
    faqs,
    reviews,
    categories,
    posts: publishedPosts,
    hasPublishedDbPosts: publishedPosts.length > 0,
  };
}

export function buildStaticSite() {
  const data = loadBuildData();
  const { settings, services, consultationTypes, faqs, reviews, categories, posts } = data;
  const homeFaqs = faqs.filter((f) => f.show_on_home);

  // Copy static assets first
  // Compile Tailwind CSS first so fresh styles are always bundled
  try {
    execSync('npx @tailwindcss/cli -i src/styles/main.css -o public/assets/css/styles.css --minify', {
      stdio: 'ignore',
    });
  } catch (err) {
    console.warn('[build.mjs] Warning: Tailwind CSS compile warning:', err.message);
  }

  copyDir(PUBLIC_DIR, DIST);

  const staticPaths = [
    '/',
    '/about/',
    '/services/',
    '/intended-parents/how-it-works/',
    '/intended-parents/international/',
    '/intended-parents/packages/',
    '/surrogates-donors/become-a-surrogate/',
    '/surrogates-donors/become-an-egg-donor/',
    '/resources/blog/',
    '/resources/faq/',
    '/resources/reviews/',
    '/book/',
    '/contact/',
    '/privacy-policy/',
    '/terms/',
    '/confidentiality-statement/',
    '/cookie-policy/',
  ];

  // Home
  writeHtml('index.html', renderHomePage({ settings, homeFaqs, reviews, posts, services, siteUrl: SITE_URL }));

  // About & Services
  writeHtml('about/index.html', renderAboutPage({ settings, siteUrl: SITE_URL }));
  writeHtml('services/index.html', renderServicesHub({ settings, services, siteUrl: SITE_URL }));
  for (const svc of services) {
    staticPaths.push(`/services/${svc.slug}/`);
    writeHtml(
      `services/${svc.slug}/index.html`,
      renderServiceDetailPage({
        service: svc,
        settings,
        services,
        faqs: faqs.slice(0, 4),
        posts: posts.slice(0, 3),
        reviews: reviews.slice(0, 3),
        siteUrl: SITE_URL,
      })
    );
  }

  // Intended Parents
  writeHtml(
    'intended-parents/how-it-works/index.html',
    renderHowItWorksPage({ settings, faqs, siteUrl: SITE_URL })
  );
  writeHtml(
    'intended-parents/international/index.html',
    renderProgramsByCountryPage({ settings, siteUrl: SITE_URL })
  );
  writeHtml(
    'intended-parents/packages/index.html',
    renderCostsPage({ settings, faqs: faqs.filter((f) => f.audience === 'Legal and Costs'), siteUrl: SITE_URL })
  );

  // Surrogates & Donors
  writeHtml(
    'surrogates-donors/become-a-surrogate/index.html',
    renderBecomeSurrogatePage({
      settings,
      faqs: faqs.filter((f) => f.audience === 'Surrogates'),
      siteUrl: SITE_URL,
    })
  );
  writeHtml(
    'surrogates-donors/become-an-egg-donor/index.html',
    renderBecomeEggDonorPage({
      settings,
      faqs: faqs.filter((f) => f.audience === 'Donors'),
      siteUrl: SITE_URL,
    })
  );

  // Blog index, categories, and posts
  writeHtml(
    'resources/blog/index.html',
    renderBlogIndexPage({ posts, categories, settings, siteUrl: SITE_URL })
  );
  for (const cat of categories) {
    const catPosts = posts.filter((p) => p.category_slug === cat.slug || p.category_id === cat.id);
    staticPaths.push(`/resources/blog/category/${cat.slug}/`);
    writeHtml(
      `resources/blog/category/${cat.slug}/index.html`,
      renderBlogIndexPage({ posts: catPosts, categories, activeCategory: cat, settings, siteUrl: SITE_URL })
    );
  }
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const { html, toc } = sanitizeMarkdown(post.body_md || '');
    const relatedPosts = posts.filter((p) => p.slug !== post.slug && p.category_id === post.category_id);
    const prevPost = i > 0 ? posts[i - 1] : null;
    const nextPost = i < posts.length - 1 ? posts[i + 1] : null;
    if (!post.noindex) {
      staticPaths.push(`/resources/blog/${post.slug}/`);
    }
    writeHtml(
      `resources/blog/${post.slug}/index.html`,
      renderBlogPostPage({
        post,
        renderedHtml: html,
        toc,
        relatedPosts,
        prevPost,
        nextPost,
        settings,
        siteUrl: SITE_URL,
      })
    );
  }

  // Resources: FAQ & Stories
  writeHtml('resources/faq/index.html', renderFaqPage({ faqs, settings, siteUrl: SITE_URL }));
  writeHtml(
    'resources/reviews/index.html',
    renderStoriesReviewsPage({ reviews, settings, siteUrl: SITE_URL })
  );

  // Booking, Contact, Legal, Utility & Admin
  writeHtml('book/index.html', renderBookingPage({ consultationTypes, settings, siteUrl: SITE_URL }));
  writeHtml('book/confirmed/index.html', renderBookingConfirmedPage({ settings, siteUrl: SITE_URL }));
  writeHtml('book/manage/index.html', renderBookingManagePage({ settings, siteUrl: SITE_URL }));
  writeHtml('contact/index.html', renderContactPage({ settings, siteUrl: SITE_URL }));
  writeHtml('thank-you/index.html', renderThankYouPage({ settings, siteUrl: SITE_URL }));
  writeHtml('review/submit/index.html', renderVerifiedReviewPage({ settings, siteUrl: SITE_URL }));
  // Staff Portal Admin SPA (Built via Vite React 19)
  try {
    execSync('npx vite build', { stdio: 'inherit' });
  } catch (err) {
    console.warn('[build] Vite admin build fallback:', err);
    writeHtml('admin/index.html', renderAdminPage({ settings, siteUrl: SITE_URL }));
  }
  writeHtml('404.html', render404Page({ settings, siteUrl: SITE_URL }));
  writeHtml('offline/index.html', renderOfflinePage({ settings, siteUrl: SITE_URL }));

  const legalPages = [
    { slug: 'privacy-policy', title: 'Privacy Policy', summary: 'How Zizo collects, protects, and honours your privacy under NDPA 2023 and GDPR.' },
    { slug: 'terms', title: 'Terms and Conditions', summary: 'General terms governing use of the Zizo Donor and Surrogacy website.' },
    { slug: 'confidentiality-statement', title: 'Confidentiality Statement', summary: 'Our commitment to anonymised matching and discreet fertility coordination.' },
    { slug: 'cookie-policy', title: 'Cookie Policy', summary: 'Details on essential cookies and consent-gated analytics on Zizo.' },
  ];
  for (const lp of legalPages) {
    writeHtml(`${lp.slug}/index.html`, renderLegalPage({ ...lp, settings, siteUrl: SITE_URL }));
  }

  // robots.txt
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /review/\nDisallow: /book/manage/\nDisallow: /thank-you/\n${SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml\n` : 'Sitemap: /sitemap.xml\n'}`;
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');

  // sitemap.xml
  const baseUrl = SITE_URL || 'https://zizodonorandsurrogacy.com';
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPaths
    .map((p) => `  <url><loc>${baseUrl}${p}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');

  // rss.xml
  const rssItems = posts
    .map((p) => {
      const link = `${baseUrl}/resources/blog/${p.slug}/`;
      const pub = new Date(p.publish_at || p.created_at || Date.now()).toUTCString();
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pub}</pubDate>
      <description><![CDATA[${p.excerpt}]]></description>
    </item>`;
    })
    .join('\n');
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Zizo Donor and Surrogacy Journal</title>
    <link>${baseUrl}/resources/blog/</link>
    <description>Calm, practical guides on surrogacy coordination, egg donation screening, and cross-border family building.</description>
${rssItems}
  </channel>
</rss>\n`;
  fs.writeFileSync(path.join(DIST, 'rss.xml'), rssXml, 'utf8');

  // site.webmanifest
  const manifest = {
    name: 'Zizo Donor and Surrogacy',
    short_name: 'Zizo Surrogacy',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F6',
    theme_color: '#17645F',
    icons: [
      { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  fs.writeFileSync(path.join(DIST, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[build.mjs] Built ${staticPaths.length + 7} pages into dist/`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildStaticSite();
}
