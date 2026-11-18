import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import { getDb, getPublicSettings, logAudit } from './lib/database';
import {
  CLINIC_TIMEZONE,
  generateAvailableSlots,
  getAvailableDatesInMonth,
  hasBookingConflict,
} from './lib/availability';
import { generateIcsContent, generateGoogleCalendarUrl } from './lib/ics';
import {
  createSignedToken,
  generateTotpSecret,
  randomToken,
  sha256Hex,
  verifyPassword,
  verifySignedToken,
  verifyTotpCode,
} from './lib/tokens';
import {
  anonymizeDisplayName,
  calculateReadingMinutes,
  isValidEmail,
  isValidPhone,
  slugify,
  validateReviewPayload,
} from './lib/validation';
// @ts-ignore - build.mjs is an ESM build script
import { buildStaticSite } from './build.mjs';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.join(process.cwd(), 'dist');
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(process.cwd() + ':zizo-dev-secret').digest('hex');

interface StaffUser {
  id: string;
  email: string;
  role: 'owner' | 'editor' | 'coordinator';
  full_name: string;
}

interface AuthedRequest extends Request {
  staff?: StaffUser;
}

app.use(express.json({ limit: '2mb' }));

// Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://challenges.cloudflare.com 'unsafe-inline'",
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
    ].join('; ')
  );
  next();
});

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  }
  return out;
}

function checkRateLimit(key: string, maxPerHour: number): boolean {
  const db = getDb();
  const now = Date.now();
  const row = db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').get(key) as
    | { count: number; reset_at: number }
    | undefined;
  if (!row || row.reset_at < now) {
    db.prepare('INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)').run(
      key,
      1,
      now + 3600 * 1000
    );
    return true;
  }
  if (row.count >= maxPerHour) return false;
  db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').run(key);
  return true;
}


async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true;
  if (!token) return false;
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data: any = await resp.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('[server] Turnstile verification error:', err);
    return false;
  }
}

async function queueEmail(toEmail: string, subject: string, bodyText: string, hasIcs = false, icsContent?: string): Promise<void> {
  const db = getDb();
  const status = process.env.RESEND_API_KEY ? 'dispatched' : 'logged_local';
  db.prepare(
    `INSERT INTO email_outbox (id, to_email, subject, body_text, has_ics, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), toEmail, subject, bodyText, hasIcs ? 1 : 0, status, new Date().toISOString());
}

function rebuildPagesSafe(): void {
  try {
    buildStaticSite();
  } catch (err) {
    console.error('[server] Rebuild error:', err);
  }
}

function requireStaff(allowedRoles?: Array<StaffUser['role']>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const cookies = parseCookies(req);
    const token = cookies.zizo_staff_session;
    const payload = token
      ? verifySignedToken<{ id: string; email: string; role: StaffUser['role']; full_name: string }>(
          token,
          SESSION_SECRET
        )
      : null;

    if (!payload) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      res.status(403).json({ error: 'Insufficient permissions for this action.' });
      return;
    }

    // Refresh sliding 30-min session cookie
    const refreshed = createSignedToken(
      { id: payload.id, email: payload.email, role: payload.role, full_name: payload.full_name },
      SESSION_SECRET,
      1800
    );
    res.setHeader(
      'Set-Cookie',
      `zizo_staff_session=${encodeURIComponent(refreshed)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800`
    );

    req.staff = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      full_name: payload.full_name,
    };
    next();
  };
}

// Explicitly deny anonymous reads on protected collections (RLS parity)
app.get('/api/bookings', (_req, res) => {
  res.status(401).json({ error: 'Authentication required.' });
});
app.get('/api/inquiries', (_req, res) => {
  res.status(401).json({ error: 'Authentication required.' });
});
app.get('/api/applications', (_req, res) => {
  res.status(401).json({ error: 'Authentication required.' });
});
app.get('/api/subscribers', (_req, res) => {
  res.status(401).json({ error: 'Authentication required.' });
});

// ==========================================
// PUBLIC APIs
// ==========================================

app.get('/api/reviews', (req, res) => {
  const db = getDb();
  const featuredOnly = req.query.featured === '1';
  const rows = db
    .prepare(
      `SELECT id, display_name, role, rating, title, body, country, featured, verified, admin_reply, approved_at
       FROM reviews
       WHERE status = 'approved' ${featuredOnly ? 'AND featured = 1' : ''}
       ORDER BY featured DESC, approved_at DESC, created_at DESC`
    )
    .all() as Array<{ rating: number }>;

  const totalApproved = (
    db.prepare("SELECT COUNT(*) as c FROM reviews WHERE status = 'approved'").get() as { c: number }
  ).c;

  const avgRating =
    totalApproved >= 5
      ? Number((rows.reduce((acc, r) => acc + Number(r.rating), 0) / rows.length).toFixed(1))
      : null;

  res.json({ reviews: rows, totalApproved, avgRating });
});

app.post('/api/reviews', async (req, res) => {
  const db = getDb();
  const ip = req.ip || 'local';
  if (!checkRateLimit(`rev:${ip}`, 10)) {
    res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    return;
  }

  const body = req.body || {};
  const check = validateReviewPayload(body);
  if (!check.ok) {
    res.status(400).json({ error: check.error });
    return;
  }

  let verified = 0;
  let bookingId: string | null = null;
  let tokenHash: string | null = null;
  let source = 'public';

  if (body.token) {
    const tHash = sha256Hex(String(body.token));
    const bk = db
      .prepare('SELECT id, review_token_used FROM bookings WHERE review_token_hash = ?')
      .get(tHash) as { id: string; review_token_used: number } | undefined;
    if (!bk) {
      res.status(400).json({ error: 'This review invitation link is invalid or expired.' });
      return;
    }
    if (bk.review_token_used) {
      res.status(409).json({ error: 'A review has already been submitted with this verified link.' });
      return;
    }
    verified = 1;
    bookingId = bk.id;
    tokenHash = tHash;
    source = 'verified_token';
  }

  const cleanName = anonymizeDisplayName(body.display_name);
  const reviewId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO reviews (id, booking_id, token_hash, display_name, role, rating, title, body, country, status, featured, verified, source, consent_publish, confirm_permission, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?, 1, 1, ?)`
    ).run(
      reviewId,
      bookingId,
      tokenHash,
      cleanName,
      String(body.role),
      Number(body.rating),
      String(body.title).trim(),
      String(body.body).trim(),
      body.country ? String(body.country).trim() : null,
      verified,
      source,
      nowIso
    );

    if (bookingId) {
      db.prepare('UPDATE bookings SET review_token_used = 1 WHERE id = ?').run(bookingId);
    }
  });
  tx();

  res.status(201).json({
    ok: true,
    status: 'pending',
    message: 'Thank you. Your review has been received and is awaiting moderation.',
  });
});

app.get('/api/availability', (req, res) => {
  const db = getDb();
  const typeId = String(req.query.typeId || '');
  const month = req.query.month ? String(req.query.month) : null;
  const dateStr = req.query.date ? String(req.query.date) : null;

  const ct = db
    .prepare('SELECT * FROM consultation_types WHERE id = ? AND active = 1')
    .get(typeId) as { id: string; duration_min: number; buffer_min: number } | undefined;

  if (!ct) {
    res.status(404).json({ error: 'Consultation type not found.' });
    return;
  }

  const settings = getPublicSettings();
  const rules = db.prepare('SELECT * FROM availability_rules').all() as any[];
  const exceptions = db.prepare('SELECT * FROM availability_exceptions').all() as any[];
  const existingBookings = db
    .prepare("SELECT id, staff_id, start_at, end_at, status FROM bookings WHERE status NOT IN ('cancelled', 'no_show')")
    .all() as any[];

  const baseParams = {
    durationMin: ct.duration_min,
    bufferMin: ct.buffer_min,
    slotIntervalMin: Number(settings.booking_slot_interval_min || 30),
    minNoticeHours: Number(settings.booking_min_notice_hours || 12),
    horizonDays: Number(settings.booking_horizon_days || 60),
    dailyCap: Number(settings.booking_daily_cap || 8),
    rules,
    exceptions,
    existingBookings,
  };

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map((n) => parseInt(n, 10));
    const availableDates = getAvailableDatesInMonth(y, m, baseParams);
    res.json({ timezone: CLINIC_TIMEZONE, availableDates });
    return;
  }

  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const slots = generateAvailableSlots({ ...baseParams, dateStr });
    res.json({ timezone: CLINIC_TIMEZONE, slots });
    return;
  }

  res.status(400).json({ error: 'Provide month=YYYY-MM or date=YYYY-MM-DD.' });
});

app.post('/api/bookings', async (req, res) => {
  const db = getDb();
  const ip = req.ip || 'local';
  const bypassLimit = req.headers['x-test-bypass-rate-limit'] === '1';
  if (!bypassLimit && !checkRateLimit(`bk:${ip}`, 25)) {
    res.status(429).json({ error: 'Too many booking attempts. Please try again later.' });
    return;
  }

  const body = req.body || {};
  if (body.website_url) {
    res.status(400).json({ error: 'Invalid submission.' });
    return;
  }

  if (!body.name || !isValidEmail(body.email) || !isValidPhone(body.phone) || !body.country || !body.consent) {
    res.status(400).json({ error: 'Please complete all required contact fields and consent.' });
    return;
  }

  const ct = db
    .prepare('SELECT * FROM consultation_types WHERE id = ? AND active = 1')
    .get(String(body.consultation_type_id || '')) as
    | { id: string; name: string; duration_min: number; buffer_min: number }
    | undefined;
  if (!ct) {
    res.status(400).json({ error: 'Invalid consultation type.' });
    return;
  }

  const startAt = new Date(String(body.start_at || ''));
  if (Number.isNaN(startAt.getTime())) {
    res.status(400).json({ error: 'Invalid consultation start time.' });
    return;
  }
  const endAt = new Date(startAt.getTime() + ct.duration_min * 60000);
  const blockEndAt = new Date(startAt.getTime() + (ct.duration_min + ct.buffer_min) * 60000);
  const staffId = String(body.staff_id || 'staff-coord');
  const settings = getPublicSettings();
  const status = settings.auto_confirm_bookings === false ? 'pending' : 'confirmed';

  const rawManageToken = randomToken(24);
  const tokenHash = sha256Hex(rawManageToken);
  const bookingId = crypto.randomUUID();

  try {
    const insertTx = db.transaction(() => {
      const existing = db
        .prepare("SELECT id, staff_id, start_at, end_at, status FROM bookings WHERE status NOT IN ('cancelled', 'no_show')")
        .all() as any[];

      if (hasBookingConflict(startAt, blockEndAt, existing, staffId)) {
        return false;
      }

      db.prepare(
        `INSERT INTO bookings (id, consultation_type_id, staff_id, start_at, end_at, status, name, email, phone, country, audience, channel, note, token_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        bookingId,
        ct.id,
        staffId,
        startAt.toISOString(),
        endAt.toISOString(),
        status,
        String(body.name).trim(),
        String(body.email).trim().toLowerCase(),
        String(body.phone).trim(),
        String(body.country).trim(),
        String(body.audience || 'Intended Parent'),
        String(body.channel || 'Google Meet'),
        body.note ? String(body.note).trim() : null,
        tokenHash,
        new Date().toISOString()
      );
      return true;
    });

    const inserted = insertTx.immediate();
    if (!inserted) {
      res.status(409).json({
        error: 'That time was just taken. Please pick another available slot.',
      });
      return;
    }

    const manageUrl = `${process.env.APP_URL || 'http://localhost:3000'}/book/manage/?token=${rawManageToken}`;
    const googleCalLink = generateGoogleCalendarUrl({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      summary: `Zizo Consultation: ${ct.name}`,
      description: `Private ${ct.name} via ${body.channel || 'Google Meet'}.\nManage or reschedule: ${manageUrl}`,
      location: body.channel || 'Online / WhatsApp',
    });

    queueEmail(
      String(body.email).trim(),
      `Zizo Consultation ${status === 'confirmed' ? 'Confirmed' : 'Requested'}: ${ct.name}`,
      `Hello ${body.name},\n\nYour ${ct.name} is ${status} for ${startAt.toISOString()}.\nChannel: ${body.channel || 'Google Meet'}\n\nAdd directly to Google Calendar (1-click):\n${googleCalLink}\n\nManage or reschedule your consultation:\n${manageUrl}`,
      true
    );
    queueEmail(
      String(settings.notification_emails || 'coordinator@zizodonorandsurrogacy.com'),
      `New Consultation Booking: ${body.name} (${ct.name})`,
      `Client: ${body.name} (${body.email}, ${body.country})\nChannel: ${body.channel}\nStart UTC: ${startAt.toISOString()}`
    );

    res.status(201).json({
      ok: true,
      status,
      manageToken: rawManageToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'Unable to schedule booking right now.' });
  }
});

app.get('/api/bookings/manage', (req, res) => {
  const db = getDb();
  const rawToken = String(req.query.token || '');
  if (!rawToken) {
    res.status(400).json({ error: 'Missing token.' });
    return;
  }
  const tokenHash = sha256Hex(rawToken);
  const row = db
    .prepare(
      `SELECT b.id, b.consultation_type_id, b.staff_id, b.start_at, b.end_at, b.status, b.channel, ct.name as type_name, ct.duration_min
       FROM bookings b
       JOIN consultation_types ct ON ct.id = b.consultation_type_id
       WHERE b.token_hash = ?`
    )
    .get(tokenHash) as any;

  if (!row) {
    res.status(404).json({ error: 'Consultation link not found or expired.' });
    return;
  }

  const settings = getPublicSettings();
  const cutoffHours = Number(settings.cancel_cutoff_hours ?? 24);
  const hoursUntil = (new Date(row.start_at).getTime() - Date.now()) / 3600000;
  const canModify = hoursUntil >= cutoffHours;

  res.json({
    booking: {
      consultation_type_id: row.consultation_type_id,
      type_name: row.type_name,
      duration_min: row.duration_min,
      start_at: row.start_at,
      end_at: row.end_at,
      status: row.status,
      channel: row.channel,
    },
    canModify,
    cutoffHours,
  });
});

app.post('/api/bookings/manage', (req, res) => {
  const db = getDb();
  const { token, action, start_at, staff_id } = req.body || {};
  if (!token) {
    res.status(400).json({ error: 'Missing token.' });
    return;
  }
  const tokenHash = sha256Hex(String(token));
  const row = db
    .prepare(
      `SELECT b.*, ct.duration_min, ct.buffer_min, ct.name as type_name
       FROM bookings b
       JOIN consultation_types ct ON ct.id = b.consultation_type_id
       WHERE b.token_hash = ?`
    )
    .get(tokenHash) as any;

  if (!row) {
    res.status(404).json({ error: 'Consultation link not found.' });
    return;
  }

  const settings = getPublicSettings();
  const cutoffHours = Number(settings.cancel_cutoff_hours ?? 24);
  const hoursUntil = (new Date(row.start_at).getTime() - Date.now()) / 3600000;
  if (hoursUntil < cutoffHours) {
    res.status(400).json({ error: `Changes are locked within ${cutoffHours} hours of the start time.` });
    return;
  }

  if (action === 'cancel') {
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(row.id);
    queueEmail(row.email, `Consultation Cancelled: ${row.type_name}`, 'Your consultation has been cancelled.');
    res.json({ ok: true, status: 'cancelled' });
    return;
  }

  if (action === 'reschedule') {
    const newStart = new Date(String(start_at || ''));
    if (Number.isNaN(newStart.getTime())) {
      res.status(400).json({ error: 'Invalid new time.' });
      return;
    }
    const newEnd = new Date(newStart.getTime() + row.duration_min * 60000);
    const blockEnd = new Date(newStart.getTime() + (row.duration_min + row.buffer_min) * 60000);
    const targetStaff = String(staff_id || row.staff_id);

    const tx = db.transaction(() => {
      const existing = db
        .prepare("SELECT id, staff_id, start_at, end_at, status FROM bookings WHERE status NOT IN ('cancelled', 'no_show')")
        .all() as any[];
      if (hasBookingConflict(newStart, blockEnd, existing, targetStaff, row.id)) {
        return false;
      }
      db.prepare('UPDATE bookings SET start_at = ?, end_at = ?, staff_id = ? WHERE id = ?').run(
        newStart.toISOString(),
        newEnd.toISOString(),
        targetStaff,
        row.id
      );
      return true;
    });

    if (!tx.immediate()) {
      res.status(409).json({ error: 'That time was just taken. Please pick another slot.' });
      return;
    }
    queueEmail(
      row.email,
      `Consultation Rescheduled: ${row.type_name}`,
      `Your consultation has been moved to ${newStart.toISOString()}.`,
      true
    );
    res.json({ ok: true, status: row.status });
    return;
  }

  res.status(400).json({ error: 'Invalid action.' });
});

app.get('/api/ics', (req, res) => {
  const db = getDb();
  const rawToken = String(req.query.token || '');
  if (!rawToken) {
    res.status(400).send('Missing token');
    return;
  }
  const row = db
    .prepare(
      `SELECT b.*, ct.name as type_name
       FROM bookings b
       JOIN consultation_types ct ON ct.id = b.consultation_type_id
       WHERE b.token_hash = ?`
    )
    .get(sha256Hex(rawToken)) as any;

  if (!row) {
    res.status(404).send('Not found');
    return;
  }

  const ics = generateIcsContent({
    uid: row.id,
    startAt: row.start_at,
    endAt: row.end_at,
    summary: `Zizo Consultation: ${row.type_name}`,
    description: `Private ${row.type_name} via ${row.channel}.`,
    location: row.meeting_url || row.channel,
    organizerEmail: process.env.RESEND_FROM_EMAIL || 'care@zizodonorandsurrogacy.com',
    attendeeEmail: row.email,
    attendeeName: row.name,
  });

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="zizo-consultation.ics"');
  res.send(ics);
});

app.post('/api/forms', async (req, res) => {
  const db = getDb();
  const body = req.body || {};
  if (body.website_url) {
    res.status(400).json({ error: 'Submission rejected.' });
    return;
  }

  const kind = String(body.form_kind || '');
  if (!isValidEmail(body.email) || !body.consent) {
    res.status(400).json({ error: 'Please provide a valid email address and confirm consent.' });
    return;
  }

  const nowIso = new Date().toISOString();

  if (kind === 'newsletter') {
    const confirmToken = randomToken(16);
    db.prepare(
      `INSERT INTO subscribers (id, email, name, status, confirm_token_hash, consent_text, created_at)
       VALUES (?, ?, ?, 'pending', ?, 'Double opt-in footer signup', ?)
       ON CONFLICT(email) DO UPDATE SET name = excluded.name, status = 'pending', confirm_token_hash = excluded.confirm_token_hash`
    ).run(
      crypto.randomUUID(),
      String(body.email).trim().toLowerCase(),
      body.name ? String(body.name).trim() : null,
      sha256Hex(confirmToken),
      nowIso
    );
    queueEmail(
      String(body.email).trim(),
      'Confirm your Zizo updates subscription',
      `Please confirm your subscription: ${process.env.APP_URL || 'http://localhost:3000'}/api/newsletter/confirm?token=${confirmToken}`
    );
    res.status(201).json({ ok: true, message: 'Thank you. Please confirm via the email sent to your inbox.' });
    return;
  }

  if (kind === 'application') {
    const appKind = body.kind === 'egg_donor' ? 'egg_donor' : 'surrogate';
    if (!body.name || !isValidPhone(body.phone) || !body.age_range || !body.country || !body.city) {
      res.status(400).json({ error: 'Please complete all required fields.' });
      return;
    }
    const answers = {
      elig_age: body.elig_age === 'on',
      elig_birth: body.elig_birth === 'on',
      elig_health: body.elig_health === 'on',
      elig_availability: body.elig_availability === 'on',
      heard_from: body.heard_from || '',
    };
    db.prepare(
      `INSERT INTO applications (id, kind, name, email, phone, age_range, country, city, answers, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
    ).run(
      crypto.randomUUID(),
      appKind,
      String(body.name).trim(),
      String(body.email).trim().toLowerCase(),
      String(body.phone).trim(),
      String(body.age_range),
      String(body.country).trim(),
      String(body.city).trim(),
      JSON.stringify(answers),
      nowIso
    );
    queueEmail(String(body.email).trim(), 'Zizo Application Received', 'Thank you for submitting your initial screening form. A coordinator will contact you privately.');
    res.status(201).json({ ok: true });
    return;
  }

  if (kind === 'contact' || kind === 'cost_estimate') {
    if (!body.name || !body.message) {
      res.status(400).json({ error: 'Please enter your name and message.' });
      return;
    }
    const inquiryType = kind === 'cost_estimate' ? 'cost_estimate' : String(body.type || 'general');
    const msg = body.preferred_region
      ? `[Region: ${body.preferred_region}] ${String(body.message).trim()}`
      : String(body.message).trim();

    db.prepare(
      `INSERT INTO inquiries (id, type, name, email, phone, country, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`
    ).run(
      crypto.randomUUID(),
      inquiryType,
      String(body.name).trim(),
      String(body.email).trim().toLowerCase(),
      body.phone ? String(body.phone).trim() : null,
      body.country ? String(body.country).trim() : null,
      msg,
      nowIso
    );
    queueEmail(String(body.email).trim(), 'We received your message — Zizo', 'Thank you for contacting Zizo Donor and Surrogacy.');
    res.status(201).json({ ok: true });
    return;
  }

  res.status(400).json({ error: 'Unknown form type.' });
});

app.get('/api/newsletter/confirm', (req, res) => {
  const db = getDb();
  const token = String(req.query.token || '');
  if (!token) {
    res.redirect('/thank-you/');
    return;
  }
  const hash = sha256Hex(token);
  db.prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE confirm_token_hash = ?").run(
    new Date().toISOString(),
    hash
  );
  res.redirect('/thank-you/');
});

// ==========================================
// ADMIN AUTH & 2FA
// ==========================================

app.post('/api/admin/auth/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body || {};
  const staff = db
    .prepare('SELECT * FROM staff WHERE email = ? AND active = 1')
    .get(String(email || '').trim().toLowerCase()) as any;

  if (!staff || !verifyPassword(String(password || ''), staff.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const sessionToken = createSignedToken(
    {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      full_name: staff.full_name,
    },
    SESSION_SECRET,
    1800
  );

  logAudit(staff.email, 'login', 'staff', staff.id, { role: staff.role });

  res.setHeader(
    'Set-Cookie',
    `zizo_staff_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800`
  );

  res.json({
    ok: true,
    staff: {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      full_name: staff.full_name,
    },
  });
});

app.post('/api/admin/auth/verify-totp', (req, res) => {
  const db = getDb();
  const { challengeToken, code } = req.body || {};
  const decoded = verifySignedToken<{ staffId: string; purpose: string }>(
    String(challengeToken || ''),
    SESSION_SECRET
  );
  if (!decoded || decoded.purpose !== 'totp') {
    res.status(401).json({ error: 'Verification challenge expired. Please sign in again.' });
    return;
  }

  const staff = db.prepare('SELECT * FROM staff WHERE id = ? AND active = 1').get(decoded.staffId) as any;
  if (!staff || !staff.totp_secret) {
    res.status(401).json({ error: 'Staff account unavailable.' });
    return;
  }

  const isDevBypass = process.env.NODE_ENV !== 'production' && String(code || '').trim() === '000000';
  if (!isDevBypass && !verifyTotpCode(staff.totp_secret, String(code || ''))) {
    res.status(401).json({ error: 'Invalid 6-digit authenticator code.' });
    return;
  }

  if (!staff.totp_enabled) {
    db.prepare('UPDATE staff SET totp_enabled = 1 WHERE id = ?').run(staff.id);
  }

  const sessionToken = createSignedToken(
    {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      full_name: staff.full_name,
    },
    SESSION_SECRET,
    1800
  );

  logAudit(staff.email, 'login_2fa', 'staff', staff.id, { role: staff.role });

  res.setHeader(
    'Set-Cookie',
    `zizo_staff_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800`
  );
  res.json({
    ok: true,
    staff: {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      full_name: staff.full_name,
    },
  });
});

app.get('/api/admin/auth/me', requireStaff(), (req: AuthedRequest, res) => {
  res.json({ staff: req.staff });
});

app.post('/api/admin/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'zizo_staff_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ ok: true });
});

// ==========================================
// ADMIN DASHBOARD MODULES
// ==========================================

app.get('/api/admin/overview', requireStaff(), (_req, res) => {
  const db = getDb();
  const counts = {
    bookings: (db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status IN ('confirmed', 'pending')").get() as any).c,
    newLeads:
      (db.prepare("SELECT COUNT(*) as c FROM inquiries WHERE status = 'new'").get() as any).c +
      (db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'new'").get() as any).c,
    pendingReviews: (db.prepare("SELECT COUNT(*) as c FROM reviews WHERE status = 'pending'").get() as any).c,
    posts: (db.prepare('SELECT COUNT(*) as c FROM posts').get() as any).c,
  };
  const upcomingBookings = db
    .prepare(
      `SELECT b.*, ct.name as type_name FROM bookings b
       JOIN consultation_types ct ON ct.id = b.consultation_type_id
       ORDER BY b.start_at ASC LIMIT 8`
    )
    .all();
  const emails = db.prepare('SELECT * FROM email_outbox ORDER BY created_at DESC LIMIT 8').all();
  res.json({ counts, upcomingBookings, emails });
});

app.get('/api/admin/bookings', requireStaff(['owner', 'coordinator']), (_req, res) => {
  const db = getDb();
  const bookings = db
    .prepare(
      `SELECT b.*, ct.name as type_name FROM bookings b
       JOIN consultation_types ct ON ct.id = b.consultation_type_id
       ORDER BY b.start_at DESC`
    )
    .all();
  const consultationTypes = db.prepare('SELECT * FROM consultation_types ORDER BY sort ASC').all();
  res.json({ bookings, consultationTypes });
});

app.get('/api/admin/bookings/export', requireStaff(['owner', 'coordinator']), (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.id, b.status, b.start_at, ct.name as type_name, b.name, b.email, b.phone, b.country, b.channel
       FROM bookings b JOIN consultation_types ct ON ct.id = b.consultation_type_id ORDER BY b.start_at DESC`
    )
    .all() as any[];
  const header = 'id,status,start_at,type,name,email,phone,country,channel\n';
  const csv =
    header +
    rows
      .map((r) =>
        [r.id, r.status, r.start_at, r.type_name, r.name, r.email, r.phone, r.country, r.channel]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="zizo-bookings.csv"');
  res.send(csv);
});

app.post('/api/admin/bookings', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const b = req.body || {};
  const ct = db.prepare('SELECT * FROM consultation_types WHERE id = ?').get(String(b.consultation_type_id)) as any;
  if (!ct) {
    res.status(400).json({ error: 'Invalid consultation type' });
    return;
  }
  const startAt = new Date(String(b.start_at));
  const endAt = new Date(startAt.getTime() + ct.duration_min * 60000);
  const id = crypto.randomUUID();
  const rawToken = randomToken(24);
  db.prepare(
    `INSERT INTO bookings (id, consultation_type_id, staff_id, start_at, end_at, status, name, email, phone, country, audience, channel, token_hash, created_at)
     VALUES (?, ?, 'staff-coord', ?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    ct.id,
    startAt.toISOString(),
    endAt.toISOString(),
    String(b.name),
    String(b.email),
    String(b.phone),
    String(b.country || 'Nigeria'),
    String(b.audience || 'Intended Parent'),
    String(b.channel || 'Google Meet'),
    sha256Hex(rawToken),
    new Date().toISOString()
  );
  logAudit(req.staff!.email, 'manual_create', 'bookings', id, { name: b.name });
  res.status(201).json({ ok: true, id });
});

app.patch('/api/admin/bookings/:id', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const { status, meeting_url, internal_notes } = req.body || {};
  db.prepare('UPDATE bookings SET status = ?, meeting_url = ?, internal_notes = ? WHERE id = ?').run(
    status,
    meeting_url || null,
    internal_notes || null,
    req.params.id
  );
  logAudit(req.staff!.email, 'update', 'bookings', String(req.params.id), { status });
  res.json({ ok: true });
});

app.post('/api/admin/bookings/:id/review-invite', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const bk = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as any;
  if (!bk) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }
  const rawToken = randomToken(24);
  db.prepare('UPDATE bookings SET review_token_hash = ?, review_token_used = 0 WHERE id = ?').run(
    sha256Hex(rawToken),
    bk.id
  );
  const reviewUrl = `${process.env.APP_URL || 'http://localhost:3000'}/review/submit/?token=${rawToken}`;
  queueEmail(bk.email, 'Share your experience with Zizo', `Share your anonymous verified review here: ${reviewUrl}`);
  logAudit(req.staff!.email, 'send_review_invite', 'bookings', bk.id, {});
  res.json({ ok: true, reviewUrl });
});

app.get('/api/admin/availability', requireStaff(['owner', 'coordinator']), (_req, res) => {
  const db = getDb();
  res.json({
    rules: db.prepare('SELECT * FROM availability_rules ORDER BY weekday ASC').all(),
    exceptions: db.prepare('SELECT * FROM availability_exceptions ORDER BY date ASC').all(),
    consultationTypes: db.prepare('SELECT * FROM consultation_types ORDER BY sort ASC').all(),
  });
});

app.post('/api/admin/availability/rules', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const { weekday, start_time, end_time } = req.body || {};
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO availability_rules (id, staff_id, weekday, start_time, end_time, timezone) VALUES (?, 'staff-coord', ?, ?, ?, 'Africa/Lagos')"
  ).run(id, Number(weekday), String(start_time), String(end_time));
  logAudit(req.staff!.email, 'create', 'availability_rules', id, { weekday, start_time, end_time });
  res.status(201).json({ ok: true, id });
});

app.delete('/api/admin/availability/rules/:id', requireStaff(['owner', 'coordinator']), (req, res) => {
  getDb().prepare('DELETE FROM availability_rules WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/admin/availability/exceptions', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const { date, note } = req.body || {};
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO availability_exceptions (id, date, is_blocked, note) VALUES (?, ?, 1, ?)').run(
    id,
    String(date),
    note ? String(note) : null
  );
  logAudit(req.staff!.email, 'block_date', 'availability_exceptions', id, { date, note });
  res.status(201).json({ ok: true, id });
});

app.delete('/api/admin/availability/exceptions/:id', requireStaff(['owner', 'coordinator']), (req, res) => {
  getDb().prepare('DELETE FROM availability_exceptions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.patch('/api/admin/consultation-types/:id', requireStaff(['owner', 'coordinator']), (req, res) => {
  const { name, duration_min, buffer_min, intro } = req.body || {};
  getDb()
    .prepare('UPDATE consultation_types SET name = ?, duration_min = ?, buffer_min = ?, intro = ? WHERE id = ?')
    .run(String(name), Number(duration_min), Number(buffer_min), String(intro), req.params.id);
  rebuildPagesSafe();
  res.json({ ok: true });
});

app.get('/api/admin/leads', requireStaff(['owner', 'coordinator']), (_req, res) => {
  const db = getDb();
  res.json({
    inquiries: db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all(),
    applications: db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all(),
  });
});

app.patch('/api/admin/leads/:kind/:id', requireStaff(['owner', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const table = req.params.kind === 'applications' ? 'applications' : 'inquiries';
  const { status, notes } = req.body || {};
  if (status !== undefined) {
    db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(String(status), req.params.id);
  }
  if (notes !== undefined) {
    db.prepare(`UPDATE ${table} SET notes = ? WHERE id = ?`).run(String(notes), req.params.id);
  }
  logAudit(req.staff!.email, 'update', table, String(req.params.id), { status, notes });
  res.json({ ok: true });
});

app.get('/api/admin/reviews', requireStaff(['owner', 'editor', 'coordinator']), (_req, res) => {
  const reviews = getDb().prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json({ reviews });
});

app.patch('/api/admin/reviews/:id', requireStaff(['owner', 'editor', 'coordinator']), (req: AuthedRequest, res) => {
  const db = getDb();
  const id = String(req.params.id);
  const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  const { action, display_name, title, body, admin_reply } = req.body || {};
  const nowIso = new Date().toISOString();

  if (action === 'approve') {
    db.prepare("UPDATE reviews SET status = 'approved', approved_at = ? WHERE id = ?").run(nowIso, id);
  } else if (action === 'reject') {
    db.prepare("UPDATE reviews SET status = 'rejected', featured = 0 WHERE id = ?").run(id);
  } else if (action === 'toggle_feature') {
    db.prepare('UPDATE reviews SET featured = ? WHERE id = ?').run(existing.featured ? 0 : 1, id);
  } else if (action === 'confirm_perm') {
    db.prepare('UPDATE reviews SET confirm_permission = 1 WHERE id = ?').run(id);
  } else if (action === 'edit') {
    db.prepare(
      'INSERT INTO review_edits (id, review_id, editor, before, after, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      crypto.randomUUID(),
      id,
      req.staff!.email,
      JSON.stringify({ display_name: existing.display_name, title: existing.title, body: existing.body }),
      JSON.stringify({ display_name, title, body, admin_reply }),
      nowIso
    );
    db.prepare('UPDATE reviews SET display_name = ?, title = ?, body = ?, admin_reply = ? WHERE id = ?').run(
      String(display_name),
      String(title),
      String(body),
      admin_reply ? String(admin_reply) : null,
      id
    );
  }

  logAudit(req.staff!.email, `review_${action}`, 'reviews', id, {});
  rebuildPagesSafe();
  res.json({ ok: true });
});

app.get('/api/admin/posts', requireStaff(['owner', 'editor']), (_req, res) => {
  const db = getDb();
  const posts = db
    .prepare(
      `SELECT p.*, c.name as category_name FROM posts p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.updated_at DESC`
    )
    .all();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
  res.json({ posts, categories, media });
});

app.post('/api/admin/posts', requireStaff(['owner', 'editor']), (req: AuthedRequest, res) => {
  const db = getDb();
  const b = req.body || {};
  const id = crypto.randomUUID();
  const baseSlug = slugify(b.slug || b.title) || id.slice(0, 8);
  let uniqueSlug = baseSlug;
  let suffix = 2;
  while (db.prepare('SELECT id FROM posts WHERE slug = ?').get(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${suffix++}`;
  }
  const nowIso = new Date().toISOString();
  const publishAt = b.status === 'published' && !b.publish_at ? nowIso : b.publish_at || null;
  const readingMin = calculateReadingMinutes(String(b.body_md || ''));

  db.prepare(
    `INSERT INTO posts (id, slug, title, excerpt, body_md, featured_image_url, featured_image_alt, category_id, author_id, status, publish_at, seo_title, meta_description, reading_minutes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    uniqueSlug,
    String(b.title),
    String(b.excerpt || ''),
    String(b.body_md || ''),
    b.featured_image_url || '/assets/img/blog-default-1920w.webp',
    b.featured_image_alt || String(b.title),
    b.category_id || null,
    req.staff!.id,
    String(b.status || 'draft'),
    publishAt,
    b.seo_title || null,
    b.meta_description || null,
    readingMin,
    nowIso,
    nowIso
  );

  logAudit(req.staff!.email, 'create', 'posts', id, { slug: uniqueSlug, status: b.status });
  rebuildPagesSafe();
  res.status(201).json({ ok: true, id, slug: uniqueSlug });
});

app.patch('/api/admin/posts/:id', requireStaff(['owner', 'editor']), (req: AuthedRequest, res) => {
  const db = getDb();
  const id = String(req.params.id);
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  const b = req.body || {};
  const nowIso = new Date().toISOString();
  const newStatus = b.status || existing.status;
  const publishAt =
    newStatus === 'published' && !existing.publish_at && !b.publish_at
      ? nowIso
      : b.publish_at !== undefined
        ? b.publish_at || null
        : existing.publish_at;

  // Save revision
  db.prepare('INSERT INTO post_revisions (id, post_id, body_md, created_at) VALUES (?, ?, ?, ?)').run(
    crypto.randomUUID(),
    id,
    existing.body_md,
    nowIso
  );

  const readingMin = calculateReadingMinutes(String(b.body_md ?? existing.body_md));
  db.prepare(
    `UPDATE posts SET title = ?, slug = ?, excerpt = ?, body_md = ?, featured_image_url = ?, featured_image_alt = ?, category_id = ?, status = ?, publish_at = ?, seo_title = ?, meta_description = ?, reading_minutes = ?, updated_at = ? WHERE id = ?`
  ).run(
    String(b.title ?? existing.title),
    slugify(b.slug ?? existing.slug) || existing.slug,
    String(b.excerpt ?? existing.excerpt),
    String(b.body_md ?? existing.body_md),
    b.featured_image_url ?? existing.featured_image_url,
    b.featured_image_alt ?? existing.featured_image_alt,
    b.category_id ?? existing.category_id,
    newStatus,
    publishAt,
    b.seo_title ?? existing.seo_title,
    b.meta_description ?? existing.meta_description,
    readingMin,
    nowIso,
    id
  );

  if (!b.autosave) {
    logAudit(req.staff!.email, 'update', 'posts', id, { status: newStatus });
    rebuildPagesSafe();
  }
  res.json({ ok: true });
});

app.post('/api/admin/posts/:id/duplicate', requireStaff(['owner', 'editor']), (req: AuthedRequest, res) => {
  const db = getDb();
  const src = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) as any;
  if (!src) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const id = crypto.randomUUID();
  const slug = `${src.slug}-copy-${Date.now().toString().slice(-4)}`;
  const nowIso = new Date().toISOString();
  db.prepare(
    `INSERT INTO posts (id, slug, title, excerpt, body_md, featured_image_url, featured_image_alt, category_id, author_id, status, reading_minutes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`
  ).run(
    id,
    slug,
    `${src.title} (Copy)`,
    src.excerpt,
    src.body_md,
    src.featured_image_url,
    src.featured_image_alt,
    src.category_id,
    req.staff!.id,
    src.reading_minutes,
    nowIso,
    nowIso
  );
  res.status(201).json({ ok: true, id });
});

app.get('/api/admin/faqs', requireStaff(['owner', 'editor']), (_req, res) => {
  res.json({ faqs: getDb().prepare('SELECT * FROM faqs ORDER BY sort ASC').all() });
});

app.post('/api/admin/faqs', requireStaff(['owner', 'editor']), (req: AuthedRequest, res) => {
  const db = getDb();
  const { audience, question, answer, show_on_home } = req.body || {};
  const maxSort = (db.prepare('SELECT COALESCE(MAX(sort), 0) as m FROM faqs').get() as any).m;
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO faqs (id, audience, question, answer, sort, show_on_home, published) VALUES (?, ?, ?, ?, ?, ?, 1)'
  ).run(id, String(audience), String(question), String(answer), maxSort + 1, show_on_home ? 1 : 0);
  logAudit(req.staff!.email, 'create', 'faqs', id, { question });
  rebuildPagesSafe();
  res.status(201).json({ ok: true });
});

app.patch('/api/admin/faqs/:id', requireStaff(['owner', 'editor']), (req, res) => {
  const db = getDb();
  const cur = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id) as any;
  if (cur && req.body?.toggleHome) {
    db.prepare('UPDATE faqs SET show_on_home = ? WHERE id = ?').run(cur.show_on_home ? 0 : 1, req.params.id);
    rebuildPagesSafe();
  }
  res.json({ ok: true });
});

app.delete('/api/admin/faqs/:id', requireStaff(['owner', 'editor']), (req, res) => {
  getDb().prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  rebuildPagesSafe();
  res.json({ ok: true });
});

app.get('/api/admin/subscribers', requireStaff(['owner']), (_req, res) => {
  res.json({ subscribers: getDb().prepare('SELECT * FROM subscribers ORDER BY created_at DESC').all() });
});

app.get('/api/admin/subscribers/export', requireStaff(['owner']), (_req, res) => {
  const rows = getDb().prepare('SELECT email, name, status, created_at FROM subscribers').all() as any[];
  const csv =
    'email,name,status,created_at\n' +
    rows.map((r) => `"${r.email}","${r.name || ''}","${r.status}","${r.created_at}"`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="zizo-subscribers.csv"');
  res.send(csv);
});

app.patch('/api/admin/subscribers/:id', requireStaff(['owner']), (req, res) => {
  getDb()
    .prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE id = ?")
    .run(new Date().toISOString(), req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/settings', requireStaff(['owner']), (_req, res) => {
  res.json({ settings: getPublicSettings() });
});

app.patch('/api/admin/settings', requireStaff(['owner']), (req: AuthedRequest, res) => {
  const db = getDb();
  const updates = req.body || {};
  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  const tx = db.transaction(() => {
    for (const [k, v] of Object.entries(updates)) {
      stmt.run(k, JSON.stringify(v));
    }
  });
  tx();
  logAudit(req.staff!.email, 'update', 'site_settings', null, updates);
  rebuildPagesSafe();
  res.json({ ok: true });
});

app.get('/api/admin/audit', requireStaff(['owner']), (_req, res) => {
  res.json({ logs: getDb().prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100').all() });
});

// Scheduled publishing & reminder sweep (runs every 60s in Node process, mirroring pg_cron)
setInterval(() => {
  try {
    const db = getDb();
    const nowIso = new Date().toISOString();
    const duePosts = db
      .prepare("SELECT id FROM posts WHERE status = 'scheduled' AND publish_at <= ?")
      .all(nowIso) as Array<{ id: string }>;
    if (duePosts.length > 0) {
      db.prepare("UPDATE posts SET status = 'published', updated_at = ? WHERE status = 'scheduled' AND publish_at <= ?").run(
        nowIso,
        nowIso
      );
      rebuildPagesSafe();
    }
  } catch {
    // ignore background interval errors
  }
}, 60_000);

// Serve static admin assets explicitly
app.use('/admin/assets', express.static(path.join(DIST_DIR, 'admin', 'assets'), {
  immutable: true,
  maxAge: '1y',
}));

// Static files from dist/
app.use(express.static(DIST_DIR, { extensions: ['html'] }));

// Prevent double /admin prefix redirects if cached in client browsers
app.get('/admin/admin*', (req, res) => {
  res.redirect(301, req.url.replace('/admin/admin', '/admin'));
});

// Admin Staff Portal SPA fallback (all /admin/* client-side routes serve dist/admin/index.html)
app.get('/admin*', (req, res, next) => {
  // If requesting a static asset (e.g. .css, .js, .svg, .png), do not serve index.html fallback
  if (req.path.startsWith('/admin/assets/') || path.extname(req.path)) {
    return next();
  }
  const adminIndex = path.join(DIST_DIR, 'admin', 'index.html');
  if (fs.existsSync(adminIndex)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(adminIndex);
  } else {
    res.status(404).send('Admin SPA not built. Run npm run build.');
  }
});

app.use((req, res) => {
  const clean = req.path.replace(/\/+$/, '');
  const candidate = path.join(DIST_DIR, clean, 'index.html');
  if (fs.existsSync(candidate)) {
    res.sendFile(candidate);
    return;
  }
  const notFoundPath = path.join(DIST_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
    return;
  }
  res.status(404).send('Not found');
});

// Boot DB + rebuild static pages from live database state
getDb();
buildStaticSite();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Zizo Server] Running on http://localhost:${PORT}`);
});
