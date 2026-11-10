/**
 * JWT secret resolution.
 *
 * Four files used to share this expression:
 *
 *     process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-0123456789'
 *
 * With JWT_SECRET unset in production the server signed and verified every
 * token with that literal — which is committed to this repository. Anyone could
 * mint a token for any user id and the API accepted it. Nothing warned.
 *
 * These tests pin the replacement down: production refuses to run without a
 * real secret, development falls back loudly, and a secret equal to any known
 * example value counts as no secret at all.
 *
 * Run: node --test scripts/test-jwt-secret.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import {
  resolveJwtSecret,
  InsecureJwtSecretError,
} from '../src/config/jwtSecret.js';

const STRONG = 'Zm9vYmFyYmF6cXV1eDEyMzQ1Njc4OTBhYmNkZWZnaGlqaw';

// ---- production must fail closed -----------------------------------------

test('production refuses to run with no secret', () => {
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: 'production' }),
    InsecureJwtSecretError,
    'a missing secret in production must be fatal'
  );
});

test('production refuses the repository fallback value', () => {
  assert.throws(
    () => resolveJwtSecret({
      NODE_ENV: 'production',
      JWT_SECRET: 'dev-only-insecure-secret-change-me-0123456789',
    }),
    InsecureJwtSecretError,
    'the published fallback must never be accepted in production'
  );
});

test('production refuses the .env.example placeholder', () => {
  assert.throws(
    () => resolveJwtSecret({
      NODE_ENV: 'production',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production-min-32-chars',
    }),
    InsecureJwtSecretError
  );
});

test('production refuses a too-short secret', () => {
  assert.throws(
    () => resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: 'short' }),
    InsecureJwtSecretError
  );
});

test('production accepts a strong secret', () => {
  const secret = resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: STRONG });
  assert.equal(secret, STRONG);
});

// ---- development degrades loudly, never silently --------------------------

test('development falls back when unset', () => {
  const secret = resolveJwtSecret({ NODE_ENV: 'development' });
  assert.equal(typeof secret, 'string');
  assert.ok(secret.length >= 16, 'fallback should still be long enough for HMAC');
});

test('development fallback equals the documented value', () => {
  // Callers in tests may rely on it matching; keep the two in step.
  assert.equal(
    resolveJwtSecret({ NODE_ENV: 'development' }),
    'dev-only-insecure-secret-change-me-0123456789'
  );
});

test('a weak development secret does not throw', () => {
  assert.doesNotThrow(() => resolveJwtSecret({ NODE_ENV: 'development', JWT_SECRET: 'x' }));
});

// ---- the vulnerability itself --------------------------------------------

test('a token forged with the old fallback is not accepted when production has a real secret', () => {
  const forged = jwt.sign({ id: 'attacker-chosen-id' }, 'dev-only-insecure-secret-change-me-0123456789', {
    expiresIn: '7d',
  });

  // Under the fixed resolution the production verifier uses the configured
  // secret, so the forged token fails.
  const realSecret = resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: STRONG });
  assert.throws(() => jwt.verify(forged, realSecret), /invalid signature/);
});

test('the forged token would have verified under the old behaviour', () => {
  // Documents why this mattered: same secret on both sides is all it takes.
  const forged = jwt.sign({ id: 'any-user' }, 'dev-only-insecure-secret-change-me-0123456789');
  const ok = jwt.verify(forged, 'dev-only-insecure-secret-change-me-0123456789');
  assert.equal(ok.id, 'any-user');
});
