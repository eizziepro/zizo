import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { hashPassword } from './tokens';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'zizo.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  seedIfEmpty(db);
  dbInstance = db;
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner', 'editor', 'coordinator')),
      full_name TEXT NOT NULL,
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT,
      diff TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultation_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      duration_min INTEGER NOT NULL,
      buffer_min INTEGER NOT NULL DEFAULT 10,
      channels TEXT NOT NULL,
      price_minor INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'NGN',
      intro TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS availability_rules (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL,
      weekday INTEGER NOT NULL CHECK(weekday >= 0 AND weekday <= 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Africa/Lagos'
    );

    CREATE TABLE IF NOT EXISTS availability_exceptions (
      id TEXT PRIMARY KEY,
      staff_id TEXT,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      is_blocked INTEGER NOT NULL DEFAULT 1,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      consultation_type_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      country TEXT NOT NULL,
      audience TEXT NOT NULL,
      channel TEXT NOT NULL,
      note TEXT,
      internal_notes TEXT,
      token_hash TEXT UNIQUE,
      review_token_hash TEXT UNIQUE,
      review_token_used INTEGER NOT NULL DEFAULT 0,
      meeting_url TEXT,
      payment_status TEXT NOT NULL DEFAULT 'not_required',
      reminder_24h_sent INTEGER NOT NULL DEFAULT 0,
      reminder_1h_sent INTEGER NOT NULL DEFAULT 0,
      followup_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      country TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT,
      notes TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL CHECK(kind IN ('surrogate', 'egg_donor')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      age_range TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      answers TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT,
      notes TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      token_hash TEXT,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Intended Parent', 'Surrogate', 'Egg Donor')),
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      country TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'archived')),
      featured INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'public',
      admin_reply TEXT,
      consent_publish INTEGER NOT NULL DEFAULT 1,
      confirm_permission INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      approved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS review_edits (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL,
      editor TEXT NOT NULL,
      before TEXT NOT NULL,
      after TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      body_md TEXT NOT NULL,
      featured_image_url TEXT,
      featured_image_alt TEXT,
      category_id TEXT,
      author_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'published', 'archived')),
      publish_at TEXT,
      seo_title TEXT,
      meta_description TEXT,
      canonical_url TEXT,
      og_image_url TEXT,
      noindex INTEGER NOT NULL DEFAULT 0,
      reading_minutes INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS post_revisions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      body_md TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      audience TEXT NOT NULL CHECK(audience IN ('Intended Parents', 'Surrogates', 'Donors', 'Legal and Costs')),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort INTEGER NOT NULL DEFAULT 0,
      show_on_home INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'unsubscribed')),
      confirm_token_hash TEXT,
      confirmed_at TEXT,
      unsubscribed_at TEXT,
      consent_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      alt TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_text TEXT NOT NULL,
      has_ics INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function seedIfEmpty(db: Database.Database): void {
  const nowIso = new Date().toISOString();

  // 1. Site Settings
  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM site_settings').get() as { c: number }).c;
  if (settingsCount === 0) {
    const defaultSettings: Record<string, unknown> = {
      brand_name: 'Zizo Donor and Surrogacy',
      short_name: 'Zizo Surrogacy',
      contact_address: '{{ADDRESS_LAGOS}}',
      contact_email: '{{EMAIL}}',
      contact_phone: '{{PHONE}}',
      whatsapp_number: '{{WHATSAPP_NUMBER}}',
      notification_emails: 'coordinator@zizodonorandsurrogacy.com',
      business_hours: 'Monday – Friday, 09:00 – 17:00 WAT (Africa/Lagos)',
      social_instagram: 'https://instagram.com/',
      social_linkedin: 'https://linkedin.com/',
      stats_experience: '12+ years',
      stats_families_helped: '{{FAMILIES_HELPED}}',
      stats_regions: '5 regions',
      stats_support_24_7: '',
      booking_min_notice_hours: 12,
      booking_horizon_days: 60,
      booking_slot_interval_min: 30,
      booking_daily_cap: 8,
      cancel_cutoff_hours: 24,
      auto_confirm_bookings: true,
      payment_enabled: false,
      gcal_sync_enabled: false,
      founder_photo_url: '',
      analytics_domain: '',
    };
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    const tx = db.transaction(() => {
      for (const [k, v] of Object.entries(defaultSettings)) {
        insertSetting.run(k, JSON.stringify(v));
      }
    });
    tx();
  }

  // 2. Staff
  const staffCount = (db.prepare('SELECT COUNT(*) as c FROM staff').get() as { c: number }).c;
  if (staffCount === 0) {
    const insertStaff = db.prepare(
      `INSERT INTO staff (id, user_id, email, password_hash, role, full_name, totp_secret, totp_enabled, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertStaff.run(
      'staff-owner',
      'staff-owner',
      'owner@zizodonorandsurrogacy.com',
      hashPassword('ZizoOwner2026!'),
      'owner',
      'Chizaram Ata',
      null,
      0,
      1,
      nowIso
    );
    insertStaff.run(
      'staff-coord',
      'staff-coord',
      'coordinator@zizodonorandsurrogacy.com',
      hashPassword('ZizoCoord2026!'),
      'coordinator',
      'Adaeze Nwosu',
      null,
      0,
      1,
      nowIso
    );
    insertStaff.run(
      'staff-editor',
      'staff-editor',
      'editor@zizodonorandsurrogacy.com',
      hashPassword('ZizoEditor2026!'),
      'editor',
      'Tunde Balogun',
      null,
      0,
      1,
      nowIso
    );
  }

  // 3. Consultation Types
  const ctCount = (db.prepare('SELECT COUNT(*) as c FROM consultation_types').get() as { c: number }).c;
  if (ctCount === 0) {
    const insertCt = db.prepare(
      `INSERT INTO consultation_types (id, name, slug, duration_min, buffer_min, channels, price_minor, currency, intro, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const items = [
      [
        'ct-ip',
        'Intended Parent Consultation',
        'intended-parent-consultation',
        30,
        15,
        JSON.stringify(['Google Meet', 'Phone call', 'WhatsApp call']),
        0,
        'NGN',
        'A private, unhurried conversation about your family-building goals, cross-border coordination options, and initial next steps.',
        1,
        1,
      ],
      [
        'ct-surr',
        'Surrogate Information Call',
        'surrogate-information-call',
        20,
        10,
        JSON.stringify(['WhatsApp call', 'Phone call', 'Google Meet']),
        0,
        'NGN',
        'Speak confidentially with a coordinator about surrogate eligibility, screening, compensation transparency, and personal support.',
        1,
        2,
      ],
      [
        'ct-donor',
        'Egg Donor Information Call',
        'egg-donor-information-call',
        20,
        10,
        JSON.stringify(['WhatsApp call', 'Phone call', 'Google Meet']),
        0,
        'NGN',
        'Learn how anonymous ovum donation screening works, what appointments involve, and how donor wellbeing is protected.',
        1,
        3,
      ],
      [
        'ct-plan',
        'Cost and Program Planning',
        'cost-and-program-planning',
        45,
        15,
        JSON.stringify(['Google Meet', 'Phone call']),
        0,
        'NGN',
        'Review programme pathways across Nigeria, Europe, Asia, Canada, and the United States along with coordination structure and planning.',
        1,
        4,
      ],
    ];
    for (const row of items) {
      insertCt.run(...row);
    }
  }

  // 4. Availability Rules (Mon-Fri 09:00-17:00 WAT)
  const ruleCount = (db.prepare('SELECT COUNT(*) as c FROM availability_rules').get() as { c: number }).c;
  if (ruleCount === 0) {
    const insertRule = db.prepare(
      `INSERT INTO availability_rules (id, staff_id, weekday, start_time, end_time, timezone)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (let weekday = 1; weekday <= 5; weekday++) {
      insertRule.run(`rule-coord-${weekday}`, 'staff-coord', weekday, '09:00', '17:00', 'Africa/Lagos');
    }
  }

  // 5. Reviews (3 seeded source testimonials)
  const reviewCount = (db.prepare('SELECT COUNT(*) as c FROM reviews').get() as { c: number }).c;
  if (reviewCount === 0) {
    const insertReview = db.prepare(
      `INSERT INTO reviews (id, display_name, role, rating, title, body, country, status, featured, verified, source, consent_publish, confirm_permission, created_at, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    insertReview.run(
      'rev-legacy-1',
      'Parent AJ',
      'Intended Parent',
      5,
      'Always grateful for steady, compassionate care',
      'From our first conversation to bringing our child home, Zizo handled every detail with warmth, discretion, and professionalism. We are forever grateful.',
      'United Kingdom',
      'approved',
      1,
      0,
      'legacy',
      1,
      0, // Flagged "confirm permission to publish" in admin
      nowIso,
      nowIso
    );
    insertReview.run(
      'rev-legacy-2',
      'Parent SS & MV',
      'Intended Parent',
      5,
      'Seamless coordination across borders',
      'Coordinating a cross-border journey felt overwhelming until we spoke with Chizaram and the Zizo team. Every medical and legal step was explained clearly and thoughtfully.',
      'United States',
      'approved',
      1,
      0,
      'legacy',
      1,
      0,
      nowIso,
      nowIso
    );
    insertReview.run(
      'rev-legacy-3',
      'B.O., Surrogate Mother, Lagos',
      'Surrogate',
      5,
      'Respected, supported, and genuinely cared for',
      'As a surrogate in Lagos, I felt genuinely valued and protected at every appointment. My case manager checked in thoughtfully and my privacy was respected throughout.',
      'Nigeria',
      'approved',
      1,
      0,
      'legacy',
      1,
      0,
      nowIso,
      nowIso
    );
  }

  // 6. FAQs
  const faqCount = (db.prepare('SELECT COUNT(*) as c FROM faqs').get() as { c: number }).c;
  if (faqCount === 0) {
    const insertFaq = db.prepare(
      `INSERT INTO faqs (id, audience, question, answer, sort, show_on_home, published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const faqs = [
      [
        'faq-1',
        'Intended Parents',
        'How does Zizo coordinate surrogacy and donor care across borders?',
        'Zizo serves as your dedicated coordination partner from Lagos, connecting intended parents with vetted fertility clinics, independent reproductive legal counsel, and thoroughly screened surrogates or egg donors across Nigeria, Europe, Asia, Canada, and the United States.',
        1,
        1,
        1,
      ],
      [
        'faq-2',
        'Intended Parents',
        'How are surrogates and egg donors screened?',
        'Every prospective surrogate and egg donor completes comprehensive medical, psychological, and background evaluations conducted through qualified clinical and counseling professionals before joining our matching programme.',
        2,
        1,
        1,
      ],
      [
        'faq-3',
        'Intended Parents',
        'How is privacy and anonymity protected during matching?',
        'Confidentiality is foundational at Zizo. Profiles shared during personalized matching omit identifying personal details, and all consultations, records, and communications follow strict data-protection protocols.',
        3,
        1,
        1,
      ],
      [
        'faq-4',
        'Surrogates',
        'What support does a surrogate receive during pregnancy?',
        'Surrogates receive dedicated case-manager coordination, access to independent emotional counseling, transparent milestone compensation schedules, and close collaboration with obstetric care teams throughout pregnancy and postpartum recovery.',
        4,
        1,
        1,
      ],
      [
        'faq-5',
        'Donors',
        'Who can apply to become an egg donor with Zizo?',
        'Women in good general and reproductive health who meet clinical age and screening criteria may submit an initial inquiry. Our team conducts a private information call before any medical screening begins.',
        5,
        1,
        1,
      ],
      [
        'faq-6',
        'Legal and Costs',
        'When should we speak with independent legal counsel?',
        'Independent legal advice is essential before signing any matching or clinical agreement. Zizo coordinates introductions to experienced reproductive law practitioners in your relevant jurisdictions. Information on this website is general information and not legal or medical advice.',
        6,
        1,
        1,
      ],
      [
        'faq-7',
        'Intended Parents',
        'Does Zizo work with single parents and international couples?',
        'Yes. We work with individuals and couples of all backgrounds, including single intended parents and international families seeking calm, structured cross-border coordination.',
        7,
        0,
        1,
      ],
      [
        'faq-8',
        'Intended Parents',
        'How long does the surrogacy matching and coordination process take?',
        'Timelines vary depending on your chosen country programme, medical readiness, and matching preferences. During your initial consultation, we outline expected phases once clinic and legal assessments are confirmed ({{CLIENT_TO_CONFIRM}}).',
        8,
        0,
        1,
      ],
      [
        'faq-9',
        'Surrogates',
        'Do I need to upload medical records or ID on the website?',
        'No. Our public application asks only for basic contact and general eligibility details. Sensitive medical or identity documents are requested later through a secure, coordinator-led process.',
        9,
        0,
        1,
      ],
      [
        'faq-10',
        'Legal and Costs',
        'How are programme costs structured?',
        'Programme costs depend on the destination country, clinical services required, legal representation, and surrogate compensation structure. You can request a personalised estimate or book a Cost and Program Planning call.',
        10,
        0,
        1,
      ],
    ];
    for (const f of faqs) insertFaq.run(...f);
  }

  // 7. Categories, Tags, and 3 Seeded Draft Blog Posts
  const catCount = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, slug, name) VALUES (?, ?, ?)');
    insertCat.run('cat-surrogacy', 'surrogacy-guides', 'Surrogacy Guides');
    insertCat.run('cat-surrogate-care', 'surrogate-care', 'Surrogate Care');
    insertCat.run('cat-egg-donation', 'egg-donation', 'Egg Donation');
    insertCat.run('cat-legal', 'cross-border-planning', 'Cross-Border Planning');

    const insertTag = db.prepare('INSERT INTO tags (id, slug, name) VALUES (?, ?, ?)');
    insertTag.run('tag-lagos', 'lagos', 'Lagos');
    insertTag.run('tag-screening', 'screening', 'Screening');
    insertTag.run('tag-intended-parents', 'intended-parents', 'Intended Parents');

    const insertPost = db.prepare(
      `INSERT INTO posts (id, slug, title, excerpt, body_md, featured_image_url, featured_image_alt, category_id, author_id, status, publish_at, seo_title, meta_description, reading_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    insertPost.run(
      'post-draft-1',
      'how-surrogacy-works-from-consultation-to-birth',
      'How surrogacy works from consultation to birth',
      'A calm overview of the five coordination phases intended parents move through with Zizo, from private consultation to welcoming your child.',
      `> *Note: This article provides general informational guidance only and does not constitute medical or legal advice.*\n\n## 1. Private initial consultation\n\nEvery journey begins with an unhurried, confidential conversation. During your consultation, our coordination team listens to your family-building history, preferred regions, and questions so you can decide on next steps with clarity.\n\n## 2. Screening and personalized matching\n\nOnce clinical prerequisites are reviewed with your chosen fertility clinic, matching focuses on compatibility, shared expectations, medical history review, and cultural preferences. Identifying personal details remain protected throughout.\n\n## 3. Medical and independent legal coordination\n\nBefore any clinical cycle begins, intended parents and gestational carriers work with independent legal counsel in the applicable jurisdictions to ensure clarity on rights, responsibilities, and parental documentation.\n\n## 4. Pregnancy care and case-manager support\n\nThroughout pregnancy, dedicated case managers maintain steady communication between clinics, intended parents, and the gestational carrier, alongside access to counseling support.\n\n## 5. Birth and homecoming planning\n\nAs the due date approaches, hospital coordination and post-birth administrative steps are prepared in advance so families can focus on welcoming their newborn.`,
      '/assets/img/blog-default-1920w.webp',
      'Linen notebook and stoneware vase on a warm oak desk in soft morning light',
      'cat-surrogacy',
      'staff-owner',
      'draft',
      null,
      'How Surrogacy Works from Consultation to Birth | Zizo',
      'Understand the five calm, structured phases of surrogacy coordination with Zizo Donor and Surrogacy.',
      3,
      nowIso,
      nowIso
    );

    insertPost.run(
      'post-draft-2',
      'what-to-expect-as-a-first-time-surrogate',
      'What to expect as a first-time surrogate',
      'Understanding eligibility, medical and psychological evaluations, privacy protections, and day-to-day support when considering gestational surrogacy.',
      `> *Note: This article provides general informational guidance only and does not constitute medical advice.*\n\n## Respect, privacy, and informed consent\n\nBecoming a surrogate is a deeply thoughtful commitment. At Zizo, prospective gestational carriers begin with a confidential information call where every question about expectations, medical steps, and support is answered openly.\n\n## Thorough screening before matching\n\nBefore any match is proposed, clinics and independent mental health professionals conduct thorough medical, psychological, and background evaluations to prioritise your physical and emotional wellbeing.\n\n### Dedicated case-manager support\n\nEvery surrogate is paired with a dedicated case manager who checks in regularly, coordinates appointments, and ensures milestone compensation schedules remain transparent and prompt.`,
      '/assets/img/become-a-surrogate-1920w.webp',
      'Warm portrait of a Nigerian woman seated near a sunlit window in cream linen',
      'cat-surrogate-care',
      'staff-owner',
      'draft',
      null,
      'What to Expect as a First-Time Surrogate | Zizo',
      'Learn how Zizo supports first-time surrogates through screening, privacy protection, and case management.',
      2,
      nowIso,
      nowIso
    );

    insertPost.run(
      'post-draft-3',
      'understanding-egg-donation-screening',
      'Understanding egg donation screening',
      'An introduction to how prospective egg donors are screened, profiled anonymously, and supported at every clinical stage.',
      `> *Note: This article provides general informational guidance only and does not constitute medical advice.*\n\n## Why careful screening matters\n\nThoughtful egg donor screening protects both the donor's health and the clarity of the intended parents' clinical path. Clinical evaluations review general health, family medical history, and emotional readiness.\n\n## Anonymous profiling and matching\n\nZizo maintains strict anonymity standards. Intended parents review curated, non-identifying donor profiles focused on health history, background, and compatibility preferences.\n\n### Counseling at every step\n\nIndependent counseling is available to donors before, during, and after their cycle so every decision feels informed and supported.`,
      '/assets/img/service-ovum-donation-1920w.webp',
      'Two women speaking calmly in a sunlit private consultation room',
      'cat-egg-donation',
      'staff-owner',
      'draft',
      null,
      'Understanding Egg Donation Screening | Zizo',
      'How anonymous egg donation screening, profiling, and counseling work at Zizo Donor and Surrogacy.',
      2,
      nowIso,
      nowIso
    );
  }

  // 8. Media Library seed
  const mediaCount = (db.prepare('SELECT COUNT(*) as c FROM media').get() as { c: number }).c;
  if (mediaCount === 0) {
    const insertMedia = db.prepare('INSERT INTO media (id, path, alt, width, height, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    const seededMedia = [
      ['med-1', '/assets/img/hero-family-1920w.webp', 'Nigerian American couple seated on a warm cream sofa holding their newborn wrapped in a neutral blanket', 1920, 1080],
      ['med-2', '/assets/img/service-surrogacy-1920w.webp', 'Expectant woman resting comfortably in a sunlit modern Lagos living room', 1920, 1080],
      ['med-3', '/assets/img/service-ovum-donation-1920w.webp', 'Coordinator speaking softly with a prospective egg donor in a private consultation room', 1920, 1440],
      ['med-4', '/assets/img/service-matching-1920w.webp', 'Care coordinator reviewing a linen profile folder with a couple across an oak table', 1920, 1440],
      ['med-5', '/assets/img/service-counseling-1920w.webp', 'Couple seated holding hands in a calm counseling conversation', 1920, 1080],
      ['med-6', '/assets/img/become-a-surrogate-1920w.webp', 'Portrait of a Nigerian woman in cream linen seated near a sunlit window', 1920, 1440],
      ['med-7', '/assets/img/how-it-works-1920w.webp', 'Parents hands gently cradling a newborn hand in a cream woven blanket', 1920, 1080],
      ['med-8', '/assets/img/blog-default-1920w.webp', 'Linen notebook, pen, ceramic cup, and olive stem on an oak desk', 1920, 1080],
    ];
    for (const [id, p, alt, w, h] of seededMedia) {
      insertMedia.run(id, p, alt, w, h, nowIso);
    }
  }
}

export function logAudit(
  actor: string,
  action: string,
  tableName: string,
  recordId: string | null,
  diff: Record<string, unknown>
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO audit_log (id, actor, action, table_name, record_id, diff, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), actor, action, tableName, recordId, JSON.stringify(diff), new Date().toISOString());
}

export function getPublicSettings(): Record<string, unknown> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{
    key: string;
    value: string;
  }>;
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}
