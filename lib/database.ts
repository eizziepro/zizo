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

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_description TEXT NOT NULL,
      body_md TEXT NOT NULL,
      price_amount INTEGER NOT NULL DEFAULT 0,
      price_currency TEXT NOT NULL DEFAULT 'NGN',
      price_label TEXT DEFAULT 'From',
      price_note TEXT,
      show_price INTEGER NOT NULL DEFAULT 1,
      image_path TEXT,
      image_alt TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      seo TEXT DEFAULT '{}',
      linked_consultation_type_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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

  // 3. Consultation Types (Zero dummy consultation types seeded; entered via Staff Admin or Supabase)

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

  // 5. Reviews: Zero dummy reviews seeded (entered via client submission or verified admin moderation)

  // 6. FAQs: Zero dummy FAQs seeded (managed dynamically via Staff Admin or Supabase)

  // 7. Categories, Tags, and Blog Posts: Zero dummy items seeded (entered via Staff Admin)

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

  // 9. Bookings: Zero dummy bookings seeded (recorded via client booking or staff coordination)
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
