import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('RLS Migration 002_rls.sql enforces strict privacy and role boundaries', () => {
  const rlsSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '002_rls.sql'), 'utf8');

  // 1. Verify RLS is enabled on all tables
  const requiredTables = [
    'site_settings',
    'staff',
    'audit_log',
    'consultation_types',
    'availability_rules',
    'availability_exceptions',
    'bookings',
    'inquiries',
    'applications',
    'reviews',
    'review_edits',
    'categories',
    'tags',
    'posts',
    'post_tags',
    'post_revisions',
    'faqs',
    'subscribers',
    'media',
  ];

  for (const table of requiredTables) {
    const hasRls = rlsSql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    assert.equal(hasRls, true, `Missing ENABLE ROW LEVEL SECURITY on table ${table}`);
  }

  // 2. Verify anonymous users have NO SELECT policy on private tables
  const privateTables = ['bookings', 'inquiries', 'applications', 'subscribers', 'audit_log', 'staff'];
  for (const table of privateTables) {
    const publicReadPattern = new RegExp(`CREATE\\s+POLICY\\s+["'][^"']*Public\\s+read[^"']*["']\\s+ON\\s+${table}`, 'i');
    assert.equal(publicReadPattern.test(rlsSql), false, `Forbidden public read policy found on private table ${table}`);
  }

  // 3. Verify public read policies on content tables are scoped
  assert.ok(rlsSql.includes("CREATE POLICY \"Public read published posts\" ON posts FOR SELECT USING (status = 'published');"));
  assert.ok(rlsSql.includes("CREATE POLICY \"Public read approved reviews\" ON reviews FOR SELECT USING (status = 'approved');"));
  assert.ok(rlsSql.includes("CREATE POLICY \"Public read published faqs\" ON faqs FOR SELECT USING (published = true);"));
  assert.ok(rlsSql.includes("CREATE POLICY \"Public read active consultation types\" ON consultation_types FOR SELECT USING (active = true);"));

  // 4. Verify site_settings restricts public to safe keys
  assert.ok(rlsSql.includes("key IN ('brand_name'"));

  // 5. Verify role boundaries
  assert.ok(rlsSql.includes("current_staff_role() = 'owner'"));
  assert.ok(rlsSql.includes("current_staff_role() IN ('owner', 'coordinator')"));
  assert.ok(rlsSql.includes("current_staff_role() IN ('owner', 'editor')"));

  // 6. Verify storage bucket policies
  assert.ok(rlsSql.includes("bucket_id = 'site-media'"));
  assert.ok(rlsSql.includes("bucket_id = 'private-docs'"));
});

test('Postgres schema 001_schema.sql defines exclusion constraint against double bookings', () => {
  const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '001_schema.sql'), 'utf8');

  // Verify btree_gist extension and gist exclusion constraint
  assert.ok(schemaSql.includes('CREATE EXTENSION IF NOT EXISTS "btree_gist";'));
  assert.ok(schemaSql.includes('CONSTRAINT no_double_booking EXCLUDE USING gist'));
  assert.ok(schemaSql.includes('tstzrange(start_at, end_at) WITH &&'));
  assert.ok(schemaSql.includes("(status NOT IN ('cancelled', 'no_show'))"));
});
