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
  SERVICE_DEFINITIONS,
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
const SITE_URL = (process.env.APP_URL || '').replace(/\/$/, '');

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

const FALLBACK_POSTS = [
  {
    id: 'fallback-1',
    slug: 'how-surrogacy-works-from-consultation-to-birth',
    title: 'How surrogacy works from consultation to birth',
    excerpt: 'A calm overview of the five coordination phases intended parents move through with Zizo, from private consultation to welcoming your child.',
    body_md: `> *Note: This article provides general informational guidance only and does not constitute medical or legal advice.*\n\n## 1. Private initial consultation\n\nEvery journey begins with an unhurried, confidential conversation. During your consultation, our coordination team listens to your family-building history, preferred regions, and questions so you can decide on next steps with clarity.\n\n## 2. Screening and personalized matching\n\nOnce clinical prerequisites are reviewed with your chosen fertility clinic, matching focuses on compatibility, shared expectations, medical history review, and cultural preferences. Identifying personal details remain protected throughout.\n\n## 3. Medical and independent legal coordination\n\nBefore any clinical cycle begins, intended parents and gestational carriers work with independent legal counsel in the applicable jurisdictions to ensure clarity on rights, responsibilities, and parental documentation.\n\n## 4. Pregnancy care and case-manager support\n\nThroughout pregnancy, dedicated case managers maintain steady communication between clinics, intended parents, and the gestational carrier, alongside access to counseling support.\n\n## 5. Birth and homecoming planning\n\nAs the due date approaches, hospital coordination and post-birth administrative steps are prepared in advance so families can focus on welcoming their newborn.`,
    featured_image_url: '/assets/img/blog-default-1920w.webp',
    featured_image_alt: 'Linen notebook and stoneware vase on a warm oak desk in soft morning light',
    category_slug: 'surrogacy-guides',
    category_name: 'Surrogacy Guides',
    author_name: 'Chizaram Ata',
    reading_minutes: 3,
    publish_at: '2026-11-01T09:00:00.000Z',
    created_at: '2026-11-01T09:00:00.000Z',
    updated_at: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'fallback-2',
    slug: 'what-to-expect-as-a-first-time-surrogate',
    title: 'What to expect as a first-time surrogate',
    excerpt: 'Understanding eligibility, medical and psychological evaluations, privacy protections, and day-to-day support when considering gestational surrogacy.',
    body_md: `> *Note: This article provides general informational guidance only and does not constitute medical advice.*\n\n## Respect, privacy, and informed consent\n\nBecoming a surrogate is a deeply thoughtful commitment. At Zizo, prospective gestational carriers begin with a confidential information call where every question about expectations, medical steps, and support is answered openly.\n\n## Thorough screening before matching\n\nBefore any match is proposed, clinics and independent mental health professionals conduct thorough medical, psychological, and background evaluations to prioritise your physical and emotional wellbeing.\n\n### Dedicated case-manager support\n\nEvery surrogate is paired with a dedicated case manager who checks in regularly, coordinates appointments, and ensures milestone compensation schedules remain transparent and prompt.`,
    featured_image_url: '/assets/img/become-a-surrogate-1920w.webp',
    featured_image_alt: 'Warm portrait of a Nigerian woman seated near a sunlit window in cream linen',
    category_slug: 'surrogate-care',
    category_name: 'Surrogate Care',
    author_name: 'Chizaram Ata',
    reading_minutes: 2,
    publish_at: '2026-10-25T09:00:00.000Z',
    created_at: '2026-10-25T09:00:00.000Z',
    updated_at: '2026-10-25T09:00:00.000Z',
  },
  {
    id: 'fallback-3',
    slug: 'understanding-egg-donation-screening',
    title: 'Understanding egg donation screening',
    excerpt: 'An introduction to how prospective egg donors are screened, profiled anonymously, and supported at every clinical stage.',
    body_md: `> *Note: This article provides general informational guidance only and does not constitute medical advice.*\n\n## Why careful screening matters\n\nThoughtful egg donor screening protects both the donor's health and the clarity of the intended parents' clinical path. Clinical evaluations review general health, family medical history, and emotional readiness.\n\n## Anonymous profiling and matching\n\nZizo maintains strict anonymity standards. Intended parents review curated, non-identifying donor profiles focused on health history, background, and compatibility preferences.\n\n### Counseling at every step\n\nIndependent counseling is available to donors before, during, and after their cycle so every decision feels informed and supported.`,
    featured_image_url: '/assets/img/service-ovum-donation-1920w.webp',
    featured_image_alt: 'Two women speaking calmly in a sunlit private consultation room',
    category_slug: 'egg-donation',
    category_name: 'Egg Donation',
    author_name: 'Chizaram Ata',
    reading_minutes: 2,
    publish_at: '2026-10-18T09:00:00.000Z',
    created_at: '2026-10-18T09:00:00.000Z',
    updated_at: '2026-10-18T09:00:00.000Z',
  },
  {
    id: 'fallback-4',
    slug: 'navigating-cross-border-surrogacy-legal-parentage',
    title: 'Navigating cross-border surrogacy and legal parentage',
    excerpt: 'A clear guide to consular documentation, DNA parentage verification, and international travel planning for diaspora families.',
    body_md: `## Harmonising legal jurisdictions\n\nCross-border surrogacy brings joy to international and diaspora families, but requires careful alignment between Nigerian legal processes and the intended parents' country of residence.\n\n## Parentage orders and certified DNA testing\n\nFollowing birth, accredited legal representatives initiate parentage declarations before the high court. Certified DNA relationship testing is performed under chain-of-custody protocols required by embassies.\n\n## Consular filings and homecoming\n\nWhether applying for a Consular Report of Birth Abroad (CRBA), a British emergency travel document, or an international passport, preparing paperwork in advance ensures a calm and lawful journey home.`,
    featured_image_url: '/assets/img/service-surrogacy-1920w.webp',
    featured_image_alt: 'Intended parents holding their newborn during a peaceful cross-border journey',
    category_slug: 'surrogacy-guides',
    category_name: 'Surrogacy Guides',
    author_name: 'Chizaram Ata',
    reading_minutes: 4,
    publish_at: '2026-10-10T09:00:00.000Z',
    created_at: '2026-10-10T09:00:00.000Z',
    updated_at: '2026-10-10T09:00:00.000Z',
  },
  {
    id: 'fallback-5',
    slug: 'emotional-wellbeing-and-counseling-in-third-party-reproduction',
    title: 'Emotional wellbeing and counseling in third-party reproduction',
    excerpt: 'Why structured psychological evaluations and ongoing emotional support safeguard surrogates, donors, and intended parents equally.',
    body_md: `## Nurturing the human heart of fertility\n\nThird-party reproduction is far more than clinical scheduling and legal documents. It involves heartfelt aspirations, trust, and vulnerability.\n\n## Pre-match counseling sessions\n\nBefore matching, all parties meet with licensed reproductive psychologists. These unhurried discussions explore expectations, boundary setting, and mutual communication preferences.\n\n## Continuous case-manager companionship\n\nThroughout the journey, dedicated support remains accessible 24/7 so every participant feels heard, respected, and physically and emotionally secure.`,
    featured_image_url: '/assets/img/service-counseling-1920w.webp',
    featured_image_alt: 'Counselor speaking warmly with intended parents in private consultation suite',
    category_slug: 'surrogate-care',
    category_name: 'Surrogate Care',
    author_name: 'Chizaram Ata',
    reading_minutes: 3,
    publish_at: '2026-10-04T09:00:00.000Z',
    created_at: '2026-10-04T09:00:00.000Z',
    updated_at: '2026-10-04T09:00:00.000Z',
  },
  {
    id: 'fallback-6',
    slug: 'choosing-an-accredited-fertility-clinic-partnership',
    title: 'Choosing an accredited fertility clinic partnership',
    excerpt: 'What to look for in clinical laboratory accreditation, embryology standards, and transparent success rate reporting.',
    body_md: `## Clinical excellence and laboratory integrity\n\nYour chosen fertility clinic plays the most pivotal role in embryo culture, pre-implantation genetic testing, and successful embryo transfers.\n\n## Key benchmarks for partner clinics\n\nWe partner exclusively with clinics maintaining state-of-the-art air filtration, ISO/CAP-compliant embryology labs, and verified blastocyst vitrification protocols.\n\n## Transparent reporting and zero hidden surcharges\n\nDirect medical billing ensures complete clarity: laboratory cycles, medications, and embryology fees are billed at actual clinic cost without agency markups.`,
    featured_image_url: '/assets/img/service-matching-1920w.webp',
    featured_image_alt: 'Modern clinical laboratory and consultation office in warm natural light',
    category_slug: 'egg-donation',
    category_name: 'Egg Donation',
    author_name: 'Chizaram Ata',
    reading_minutes: 3,
    publish_at: '2026-09-28T09:00:00.000Z',
    created_at: '2026-09-28T09:00:00.000Z',
    updated_at: '2026-09-28T09:00:00.000Z',
  },
];

const DEFAULT_CONSULTATION_TYPES = [
  {
    id: 'ct-ip',
    name: 'Intended Parent Consultation',
    slug: 'intended-parent-consultation',
    duration_min: 30,
    buffer_min: 15,
    channels: ['Google Meet', 'Phone call', 'WhatsApp call'],
    intro: 'A private, unhurried conversation about your family-building goals, cross-border coordination options, and initial next steps.',
  },
  {
    id: 'ct-surr',
    name: 'Surrogate Information Call',
    slug: 'surrogate-information-call',
    duration_min: 20,
    buffer_min: 10,
    channels: ['WhatsApp call', 'Phone call', 'Google Meet'],
    intro: 'Speak confidentially with a coordinator about surrogate eligibility, screening, compensation transparency, and personal support.',
  },
  {
    id: 'ct-donor',
    name: 'Egg Donor Information Call',
    slug: 'egg-donor-information-call',
    duration_min: 20,
    buffer_min: 10,
    channels: ['WhatsApp call', 'Phone call', 'Google Meet'],
    intro: 'Learn how anonymous ovum donation screening works, what appointments involve, and how donor wellbeing is protected.',
  },
  {
    id: 'ct-plan',
    name: 'Cost and Program Planning',
    slug: 'cost-and-program-planning',
    duration_min: 45,
    buffer_min: 15,
    channels: ['Google Meet', 'Phone call'],
    intro: 'Review programme pathways across Nigeria, Europe, Asia, Canada, and the United States along with coordination structure and planning.',
  },
];

const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    audience: 'Intended Parents',
    question: 'Who can start a surrogacy or donor journey with Zizo?',
    answer: 'We support individuals, couples, and single intended parents looking for structured, confidential fertility coordination in Nigeria and across partner programmes in Europe, Asia, Canada, and the United States.',
    show_on_home: 1,
  },
  {
    id: 'faq-2',
    audience: 'Intended Parents',
    question: 'How does cross-border coordination work?',
    answer: 'Your dedicated Zizo coordinator sequences your initial consultation, clinic evaluations, anonymized donor or surrogate matching, independent legal guidance, pregnancy updates, and homecoming planning in line with your preferred region.',
    show_on_home: 1,
  },
  {
    id: 'faq-3',
    audience: 'Intended Parents',
    question: 'Are egg donor and surrogate profiles kept anonymous?',
    answer: 'Yes. Zizo maintains strict anonymity standards. Non-identifying health, education, and compatibility profiles are shared securely, and personal identifying details are protected throughout.',
    show_on_home: 1,
  },
  {
    id: 'faq-4',
    audience: 'Surrogates',
    question: 'What support do gestational surrogates receive at Zizo?',
    answer: 'Every surrogate receives respectful case-manager coordination, medical and psychological screening, independent legal counsel, confidential care, and transparent milestone compensation.',
    show_on_home: 1,
  },
  {
    id: 'faq-5',
    audience: 'Donors',
    question: 'What does egg donor screening involve?',
    answer: 'Prospective egg donors complete family medical history checks, fertility hormone assessments, infectious disease screening, and independent psychological counseling at vetted partner clinics before matching.',
    show_on_home: 1,
  },
  {
    id: 'faq-6',
    audience: 'Legal and Costs',
    question: 'When should I arrange independent legal advice?',
    answer: 'Independent reproductive legal counsel in the applicable jurisdiction(s) is arranged prior to confirming matches or beginning clinical cycles, so every party has clarity on rights and parentage steps.',
    show_on_home: 1,
  },
];

function loadBuildData() {
  if (!fs.existsSync(DB_PATH)) {
    return {
      settings: {},
      consultationTypes: DEFAULT_CONSULTATION_TYPES,
      faqs: DEFAULT_FAQS,
      reviews: [],
      categories: [
        { id: 'cat-surrogacy', slug: 'surrogacy-guides', name: 'Surrogacy Guides' },
        { id: 'cat-surrogate-care', slug: 'surrogate-care', name: 'Surrogate Care' },
        { id: 'cat-egg-donation', slug: 'egg-donation', name: 'Egg Donation' },
      ],
      posts: FALLBACK_POSTS,
    };
  }

  const db = new Database(DB_PATH, { readonly: true });
  const settingsRows = db.prepare('SELECT key, value FROM site_settings').all();
  const settings = {};
  for (const r of settingsRows) {
    try { settings[r.key] = JSON.parse(r.value); } catch { settings[r.key] = r.value; }
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
    consultationTypes,
    faqs,
    reviews,
    categories,
    posts: publishedPosts.length > 0 ? publishedPosts : FALLBACK_POSTS,
    hasPublishedDbPosts: publishedPosts.length > 0,
  };
}

export function buildStaticSite() {
  const data = loadBuildData();
  const { settings, consultationTypes, faqs, reviews, categories, posts } = data;
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
  writeHtml('index.html', renderHomePage({ settings, homeFaqs, reviews, posts, siteUrl: SITE_URL }));

  // About & Services
  writeHtml('about/index.html', renderAboutPage({ settings, siteUrl: SITE_URL }));
  writeHtml('services/index.html', renderServicesHub({ settings, siteUrl: SITE_URL }));
  for (const svc of SERVICE_DEFINITIONS) {
    staticPaths.push(`/services/${svc.slug}/`);
    writeHtml(
      `services/${svc.slug}/index.html`,
      renderServiceDetailPage({
        service: svc,
        settings,
        faqs: faqs.slice(0, 4),
        posts: posts.slice(0, 3),
        reviews: reviews.slice(0, 3),
        siteUrl: SITE_URL,
      })
    );
    if (svc.legacySlug) {
      staticPaths.push(`/services/${svc.legacySlug}/`);
      writeHtml(
        `services/${svc.legacySlug}/index.html`,
        renderServiceDetailPage({
          service: svc,
          settings,
          faqs: faqs.slice(0, 4),
          posts: posts.slice(0, 3),
          reviews: reviews.slice(0, 3),
          siteUrl: SITE_URL,
        })
      );
    }
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
