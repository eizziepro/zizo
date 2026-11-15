import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOtpAuthUri,
  createSignedToken,
  generateTotpCode,
  generateTotpSecret,
  hashPassword,
  verifyPassword,
  verifySignedToken,
  verifyTotpCode,
} from './tokens';

test('signed tokens validate and reject tampering', () => {
  const secret = 'test-secret-key';
  const token = createSignedToken({ bookingId: 'bk_123', action: 'manage' }, secret, 3600);
  const decoded = verifySignedToken<{ bookingId: string }>(token, secret);
  assert.equal(decoded?.bookingId, 'bk_123');

  const tampered = `${token.slice(0, -2)}xx`;
  assert.equal(verifySignedToken(tampered, secret), null);
});

test('TOTP 2FA generates and verifies valid 6-digit codes', () => {
  const secret = generateTotpSecret();
  const now = 1794700000000;
  const code = generateTotpCode(secret, now);
  assert.match(code, /^\d{6}$/);
  assert.equal(verifyTotpCode(secret, code, 1, now), true);
  assert.equal(verifyTotpCode(secret, '000000', 0, now + 90000), false);
  const uri = buildOtpAuthUri('admin@zizo.test', 'Zizo Admin', secret);
  assert.ok(uri.startsWith('otpauth://totp/'));
});

test('scrypt password hashing verifies matching password', () => {
  const hash = hashPassword('SecureZizoPass!2026');
  assert.equal(verifyPassword('SecureZizoPass!2026', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
});
