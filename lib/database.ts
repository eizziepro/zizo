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

    DROP TABLE IF EXISTS cases;

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      country TEXT,
      preferred_region TEXT,
      source TEXT NOT NULL DEFAULT 'Website form',
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
      candidate_code TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      age_range TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      answers TEXT NOT NULL,
      screening_checklist TEXT NOT NULL DEFAULT '{"medical_history": false, "infectious_panel": false, "ultrasound_amh": false, "psych_eval": false, "legal_consent": false}',
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

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      gateway TEXT NOT NULL CHECK (gateway IN ('paystack', 'remita', 'manual')),
      gateway_reference TEXT UNIQUE NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      status TEXT NOT NULL CHECK (status IN ('initialized', 'pending', 'success', 'failed', 'refunded')),
      customer_email TEXT NOT NULL,
      customer_name TEXT,
      channel TEXT,
      paid_at TEXT,
      raw_response TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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
      contact_address: 'Bode Thomas St, Surulere, Lagos',
      contact_email: 'info@zizosurrogacy.com',
      contact_phone: '09024944961',
      whatsapp_number: '2349024944961',
      notification_emails: 'info@zizosurrogacy.com',
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
      paystack_enabled: false,
      paystack_mode: 'test',
      paystack_public_key: '',
      paystack_secret_key: '',
      paystack_webhook_secret: '',
      paystack_currencies: ['NGN', 'USD', 'GBP', 'EUR'],
      remita_enabled: false,
      remita_mode: 'demo',
      remita_merchant_id: '',
      remita_service_type_id: '',
      remita_api_key: '',
      remita_public_key: '',
      hubspot_enabled: false,
      hubspot_access_token: '',
      whatsapp_enabled: false,
      google_meet_sync_enabled: false,
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
  } else {
    // Ensure integration defaults exist for previously seeded databases
    const defaultIntegrationKeys: Record<string, unknown> = {
      paystack_enabled: false,
      paystack_mode: 'test',
      paystack_public_key: '',
      paystack_secret_key: '',
      paystack_webhook_secret: '',
      paystack_currencies: ['NGN', 'USD', 'GBP', 'EUR'],
      remita_enabled: false,
      remita_mode: 'demo',
      remita_merchant_id: '',
      remita_service_type_id: '',
      remita_api_key: '',
      remita_public_key: '',
      hubspot_enabled: false,
      hubspot_access_token: '',
      whatsapp_enabled: false,
      google_meet_sync_enabled: false,
    };
    const insertOrIgnore = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
    const tx = db.transaction(() => {
      for (const [k, v] of Object.entries(defaultIntegrationKeys)) {
        insertOrIgnore.run(k, JSON.stringify(v));
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

    // Read passwords from environment variables; fallback to generated secure credentials in local development
    const ownerPass = process.env.LOCAL_OWNER_PASSWORD || crypto.randomBytes(16).toString('hex');
    const coordPass = process.env.LOCAL_COORD_PASSWORD || crypto.randomBytes(16).toString('hex');
    const editorPass = process.env.LOCAL_EDITOR_PASSWORD || crypto.randomBytes(16).toString('hex');

    if (process.env.NODE_ENV !== 'production' && !process.env.LOCAL_OWNER_PASSWORD) {
      console.info('[database] Seeded local staff with generated credentials:');
      console.info(`  Owner: owner@zizodonorandsurrogacy.com / ${ownerPass}`);
      console.info(`  Coordinator: coordinator@zizodonorandsurrogacy.com / ${coordPass}`);
      console.info(`  Editor: editor@zizodonorandsurrogacy.com / ${editorPass}`);
      console.info('Set LOCAL_OWNER_PASSWORD, LOCAL_COORD_PASSWORD, LOCAL_EDITOR_PASSWORD in .env for custom passwords.');
    }

    insertStaff.run(
      'staff-owner',
      'staff-owner',
      'owner@zizodonorandsurrogacy.com',
      hashPassword(ownerPass),
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
      hashPassword(coordPass),
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
      hashPassword(editorPass),
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
        'ct-enquiry',
        'Donor & Surrogate Enquiry',
        'donor-surrogate-enquiry',
        45,
        15,
        JSON.stringify(['Google Meet', 'Phone call', 'WhatsApp call']),
        1000000,
        'NGN',
        'A private exploratory session to review surrogate and egg donor pathways, medical and legal requirements, and journey planning.',
        1,
        1,
      ],
      [
        'ct-ivf',
        'IVF Consultation & Coordination',
        'ivf-consultation-coordination',
        60,
        15,
        JSON.stringify(['Google Meet', 'Phone call']),
        6000000,
        'NGN',
        'Clinical cycle coordination, protocol synchronization with accredited partner fertility clinics, and laboratory scheduling oversight.',
        1,
        2,
      ],
      [
        'ct-surrogacy',
        'Surrogacy Coordination',
        'surrogacy-coordination',
        60,
        15,
        JSON.stringify(['Google Meet', 'Phone call', 'WhatsApp call']),
        5000000,
        'NGN',
        'Comprehensive gestational surrogacy pathway consultation covering carrier matching, independent legal counsel, escrow milestone schedules, and obstetric milestones.',
        1,
        3,
      ],
      [
        'ct-donor',
        'Donor Profiling & Screening',
        'donor-profiling-screening',
        45,
        15,
        JSON.stringify(['WhatsApp call', 'Phone call', 'Google Meet']),
        0,
        'NGN',
        'Review vetted, non-identifying egg donor profiles with comprehensive genetic, infectious disease, and psychological screening verification at zero cost.',
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

  // 9. Consultation Bookings seed
  const hasSampleBookings = (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE id LIKE 'bk-%'").get() as { c: number }).c > 0;
  if (!hasSampleBookings) {
    const insertBooking = db.prepare(
      `INSERT INTO bookings (
        id, consultation_type_id, staff_id, start_at, end_at, status, name, email, phone, country,
        audience, channel, note, internal_notes, token_hash, meeting_url, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const nowMs = Date.now();
    const computeSqlSlot = (daysOffset: number, hours: number, min: number, dur: number) => {
      const d = new Date(nowMs + daysOffset * 86400000);
      d.setHours(hours, min, 0, 0);
      return {
        start: d.toISOString(),
        end: new Date(d.getTime() + dur * 60000).toISOString(),
      };
    };

    const initialBookings = [
      {
        id: 'bk-1',
        type_id: 'ct-1',
        staff_id: 'staff-1',
        ...computeSqlSlot(1, 10, 0, 30),
        status: 'confirmed',
        name: 'Ade & Folake M.',
        email: 'adefolake.m@example.co.uk',
        phone: '+44 7911 123456',
        country: 'United Kingdom',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'UK diaspora couple seeking gestational surrogacy pathway in Lagos.',
        internal_notes: 'Reviewed initial questionnaire. Both embryos created and vitrified at Bridge Clinic.',
        meeting_url: 'https://meet.google.com/zizo-ip-adefolake',
      },
      {
        id: 'bk-2',
        type_id: 'ct-4',
        staff_id: 'staff-1',
        ...computeSqlSlot(1, 14, 0, 45),
        status: 'confirmed',
        name: 'Dr. & Mrs. Okon',
        email: 'okon.family@example.com',
        phone: '+1 281 555 0192',
        country: 'United States',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Houston-based physician couple interested in comprehensive cost breakdown.',
        internal_notes: 'Sent 2026-2027 fee schedule v3.',
        meeting_url: 'https://meet.google.com/zizo-cost-okon',
      },
      {
        id: 'bk-3',
        type_id: 'ct-2',
        staff_id: 'staff-2',
        ...computeSqlSlot(2, 11, 0, 20),
        status: 'pending',
        name: 'Blessing O.',
        email: 'blessing.o@example.com',
        phone: '+234 809 876 5432',
        country: 'Nigeria',
        audience: 'Surrogate',
        channel: 'WhatsApp call',
        note: 'Candidate completed online intake. Mother of two uncomplicated deliveries.',
        internal_notes: 'Verify spouse consent letter and check obstetric discharge summary.',
        meeting_url: 'https://wa.me/2348098765432',
      },
      {
        id: 'bk-4',
        type_id: 'ct-3',
        staff_id: 'staff-2',
        ...computeSqlSlot(3, 15, 0, 20),
        status: 'confirmed',
        name: 'Kemi B.',
        email: 'kemi.b@example.com',
        phone: '+234 803 442 9811',
        country: 'Nigeria',
        audience: 'Egg Donor',
        channel: 'Google Meet',
        note: 'Graduate student in biochemistry. Inquiring about stimulation cycle protocol.',
        internal_notes: 'AMH test result uploaded (3.4 ng/mL). Excellent candidate profile.',
        meeting_url: 'https://meet.google.com/zizo-donor-kemi',
      },
      {
        id: 'bk-5',
        type_id: 'ct-1',
        staff_id: 'staff-1',
        ...computeSqlSlot(4, 16, 0, 30),
        status: 'confirmed',
        name: 'Sarah & Liam Jenkins',
        email: 'jenkins.family@example.ca',
        phone: '+1 416 555 8390',
        country: 'Canada',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Canadian couple reviewing African surrogacy options.',
        internal_notes: 'Explain Ontario birth certificate acquisition process.',
        meeting_url: 'https://meet.google.com/zizo-ip-jenkins',
      },
      {
        id: 'bk-6',
        type_id: 'ct-4',
        staff_id: 'staff-3',
        ...computeSqlSlot(5, 9, 30, 45),
        status: 'confirmed',
        name: 'David & Michael K.',
        email: 'david.m.k@example.com.au',
        phone: '+61 2 9876 5432',
        country: 'Australia',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Sydney-based couple. Discussing dedicated donor selection.',
        internal_notes: 'Ensure legal framework deck includes Australia Part VII family law considerations.',
        meeting_url: 'https://meet.google.com/zizo-cost-aus',
      },
      {
        id: 'bk-7',
        type_id: 'ct-2',
        staff_id: 'staff-2',
        ...computeSqlSlot(6, 12, 0, 20),
        status: 'pending',
        name: 'Grace A.',
        email: 'grace.a@example.com',
        phone: '+234 812 345 6789',
        country: 'Nigeria',
        audience: 'Surrogate',
        channel: 'Phone call',
        note: 'Registered nurse from Abuja inquiring about clinical screening requirements.',
        internal_notes: 'Nurse practitioner background; verify availability for in-person baseline scan in Lagos.',
        meeting_url: null,
      },
      {
        id: 'bk-8',
        type_id: 'ct-4',
        staff_id: 'staff-1',
        ...computeSqlSlot(-8, 11, 0, 45),
        status: 'completed',
        name: 'Parent SS & MV',
        email: 'parents.ss.mv@example.com',
        phone: '+1 415 555 2671',
        country: 'United States',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Detailed budgeting for dual embryo transfers.',
        internal_notes: 'Consultation completed successfully. Retainer agreement sent and executed.',
        meeting_url: 'https://meet.google.com/zizo-ss-mv',
      },
      {
        id: 'bk-9',
        type_id: 'ct-1',
        staff_id: 'staff-1',
        ...computeSqlSlot(-5, 14, 0, 30),
        status: 'completed',
        name: 'Tunde & Bisola E.',
        email: 'tunde.bisola@example.com',
        phone: '+234 802 334 5566',
        country: 'Nigeria',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Domestic intended parents looking for accelerated surrogate matching in Lagos.',
        internal_notes: 'Referred to Bridge Clinic for endometrial ultrasound. Matched with surrogate candidate SC-8821.',
        meeting_url: 'https://meet.google.com/zizo-tunde-bisola',
      },
      {
        id: 'bk-10',
        type_id: 'ct-2',
        staff_id: 'staff-2',
        ...computeSqlSlot(-3, 10, 0, 20),
        status: 'completed',
        name: 'Mary N.',
        email: 'mary.n@example.com',
        phone: '+234 816 778 8990',
        country: 'Nigeria',
        audience: 'Surrogate',
        channel: 'WhatsApp call',
        note: 'Initial surrogate intake call. Discussed medical checkups and family support.',
        internal_notes: 'Completed telephone interview. Candidate scored 95% on readiness checklist.',
        meeting_url: 'https://wa.me/2348167788990',
      },
      {
        id: 'bk-11',
        type_id: 'ct-1',
        staff_id: 'staff-3',
        ...computeSqlSlot(-2, 15, 0, 30),
        status: 'no_show',
        name: 'Eunice W.',
        email: 'eunice.w@example.com.gh',
        phone: '+233 24 123 4567',
        country: 'Ghana',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Ghanaian client exploring IVF clinic options in Nigeria.',
        internal_notes: 'Client did not connect on Google Meet. Sent automated follow-up email.',
        meeting_url: 'https://meet.google.com/zizo-eunice-w',
      },
      {
        id: 'bk-12',
        type_id: 'ct-3',
        staff_id: 'staff-2',
        ...computeSqlSlot(-6, 15, 0, 20),
        status: 'cancelled',
        name: 'Chioma E.',
        email: 'chioma.e@example.com',
        phone: '+234 703 111 2233',
        country: 'Nigeria',
        audience: 'Egg Donor',
        channel: 'Phone call',
        note: 'Rescheduling requested due to university semester exam timetable.',
        internal_notes: 'Candidate requested postponement until end of semester.',
        meeting_url: null,
      },
      {
        id: 'bk-13',
        type_id: 'ct-1',
        staff_id: 'staff-1',
        ...computeSqlSlot(-1, 13, 0, 30),
        status: 'cancelled',
        name: 'Mark & Elena V.',
        email: 'elena.mark.v@example.de',
        phone: '+49 170 1234567',
        country: 'Germany',
        audience: 'Intended Parent',
        channel: 'Google Meet',
        note: 'Munich-based intended parents inquiring on cross-border surrogacy feasibility.',
        internal_notes: 'Cancelled by client due to sudden international travel.',
        meeting_url: 'https://meet.google.com/zizo-mark-elena',
      },
    ];

    for (const b of initialBookings) {
      insertBooking.run(
        b.id,
        b.type_id,
        b.staff_id,
        b.start,
        b.end,
        b.status,
        b.name,
        b.email,
        b.phone,
        b.country,
        b.audience,
        b.channel,
        b.note,
        b.internal_notes,
        crypto.randomBytes(16).toString('hex'),
        b.meeting_url,
        'not_required',
        nowIso
      );
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
