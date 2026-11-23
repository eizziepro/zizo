import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { validatePaystackSignature, maskApiKey, testPaystackConnection, testRemitaConnection } from './payments.js';
import { getDb } from './database.js';

test('PAYMENTS: validatePaystackSignature verifies HMAC SHA-512 signatures accurately', () => {
  const secretKey = 'sk_test_mock_secret_key_12345';
  const payload = JSON.stringify({
    event: 'charge.success',
    data: {
      reference: 'ref_123456789',
      amount: 5000000,
      currency: 'NGN',
    },
  });

  const validSignature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
  assert.equal(validatePaystackSignature(payload, validSignature, secretKey), true);

  // Buffer rawBody payload
  assert.equal(validatePaystackSignature(Buffer.from(payload), validSignature, secretKey), true);

  // Tampered payload
  const tamperedPayload = JSON.stringify({
    event: 'charge.success',
    data: {
      reference: 'ref_123456789',
      amount: 1000, // modified amount
      currency: 'NGN',
    },
  });
  assert.equal(validatePaystackSignature(tamperedPayload, validSignature, secretKey), false);

  // Wrong secret key
  assert.equal(validatePaystackSignature(payload, validSignature, 'sk_test_different_key'), false);

  // Missing or corrupted signature
  assert.equal(validatePaystackSignature(payload, '', secretKey), false);
  assert.equal(validatePaystackSignature(payload, undefined, secretKey), false);
  assert.equal(validatePaystackSignature(payload, 'short_invalid_sig', secretKey), false);
});

test('PAYMENTS: maskApiKey safely masks secrets for UI display', () => {
  assert.equal(maskApiKey(''), '');
  assert.equal(maskApiKey(null), '');
  assert.equal(maskApiKey(undefined), '');

  const secretKey = 'sk_test_9876543210abcdeffedcba';
  const masked = maskApiKey(secretKey);
  assert.ok(masked.startsWith('sk_test_'));
  assert.ok(masked.includes('••••••••'));
  assert.ok(masked.endsWith('dcba'));
  assert.ok(!masked.includes('9876543210abcdef'));

  const shortKey = '1234567';
  assert.equal(maskApiKey(shortKey), '••••••••');
});

test('PAYMENTS: testPaystackConnection validates key format defense', async () => {
  // Empty secret key
  const emptyRes = await testPaystackConnection('');
  assert.equal(emptyRes.ok, false);
  assert.ok(emptyRes.message?.includes('No Secret Key provided'));

  // Malformed key (not starting with sk_)
  const malformedRes = await testPaystackConnection('invalid_key_format');
  assert.equal(malformedRes.ok, false);
  assert.ok(malformedRes.message?.includes('Must start with sk_test_ or sk_live_'));
});

test('PAYMENTS: testRemitaConnection validates merchant credentials', async () => {
  // Missing merchant id
  const missingRes = await testRemitaConnection('', 'some_api_key');
  assert.equal(missingRes.ok, false);
  assert.ok(missingRes.message?.includes('Merchant ID and API Key are required'));

  // Valid format
  const validRes = await testRemitaConnection('25443844', 'remita_secret_api_key_test');
  assert.equal(validRes.ok, true);
  assert.ok(validRes.message?.includes('Remita credentials format verified'));
});

test('PAYMENTS: payment_transactions schema and default integration settings exist', () => {
  const db = getDb();

  // Verify payment_transactions table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='payment_transactions'").get();
  assert.ok(tableCheck, 'payment_transactions table should exist');

  // Verify table columns
  const columns = db.prepare("PRAGMA table_info('payment_transactions')").all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map((c) => c.name));
  assert.ok(columnNames.has('id'));
  assert.ok(columnNames.has('booking_id'));
  assert.ok(columnNames.has('gateway'));
  assert.ok(columnNames.has('gateway_reference'));
  assert.ok(columnNames.has('amount_minor'));
  assert.ok(columnNames.has('currency'));
  assert.ok(columnNames.has('status'));
  assert.ok(columnNames.has('paid_at'));

  // Verify site_settings has integration keys
  const settingsRows = db.prepare("SELECT key FROM site_settings WHERE key LIKE 'paystack_%' OR key LIKE 'remita_%'").all() as Array<{ key: string }>;
  const settingsKeys = new Set(settingsRows.map((s) => s.key));
  assert.ok(settingsKeys.has('paystack_enabled'));
  assert.ok(settingsKeys.has('paystack_mode'));
  assert.ok(settingsKeys.has('paystack_public_key'));
  assert.ok(settingsKeys.has('paystack_secret_key'));
  assert.ok(settingsKeys.has('remita_enabled'));

  // Verify migration 006 exists and contains SQL definitions
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '006_integrations_and_payments.sql');
  assert.ok(fs.existsSync(migrationPath), 'Migration 006 must exist');
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(migrationContent.includes('CREATE TABLE IF NOT EXISTS payment_transactions'));
  assert.ok(migrationContent.includes('paystack_enabled'));
  assert.ok(migrationContent.includes('remita_enabled'));
});
