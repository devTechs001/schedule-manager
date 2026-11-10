/**
 * JWT secret resolution — the single place that decides what signs a token.
 *
 * This used to be four independent copies of the same expression:
 *
 *     process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-0123456789'
 *
 * in config/app.js, authController, demoController and middleware/auth. With
 * JWT_SECRET unset the server silently signed and verified every token with
 * that literal — which is in the public repository. Anyone could mint a token
 * for any user id, including an admin, and the app would accept it. No warning
 * was printed, and because the fallback is a real string rather than a
 * placeholder check, nothing ever failed loudly enough to notice.
 *
 * The rule now:
 *   - production: no secret, or a secret that is one of the known example
 *     values, is a startup error. Refusing to boot is the only safe behaviour:
 *     running with a public secret is worse than being down.
 *   - development and test: the dev fallback is allowed, but it is announced.
 *
 * The check runs lazily on first use rather than at import time, so importing
 * this module never throws during a build or a static analysis pass.
 */

/** Example values that appear in documentation, .env.example and this repo. */
const KNOWN_INSECURE = new Set([
  'dev-only-insecure-secret-change-me-0123456789',
  'your-super-secret-jwt-key-change-this-in-production-min-32-chars',
  'your-session-secret-key',
  'secret',
  'changeme',
]);

const DEV_FALLBACK = 'dev-only-insecure-secret-change-me-0123456789';

const MIN_LENGTH = 16;

let warned = false;

export class InsecureJwtSecretError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InsecureJwtSecretError';
  }
}

/**
 * @param {object} [env] injection point for tests
 * @returns {string} the secret to sign/verify with
 * @throws {InsecureJwtSecretError} in production when no usable secret exists
 */
export const resolveJwtSecret = (env = process.env) => {
  const configured = (env.JWT_SECRET || '').trim();
  const isProduction = env.NODE_ENV === 'production';
  const weak = !configured || KNOWN_INSECURE.has(configured) || configured.length < MIN_LENGTH;

  if (!weak) return configured;

  if (isProduction) {
    throw new InsecureJwtSecretError(
      configured
        ? 'JWT_SECRET is set to a known example value or is shorter than 16 characters. ' +
          'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
        : 'JWT_SECRET is not set. The server will not sign or verify tokens without one in production.'
    );
  }

  if (!warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[auth] JWT_SECRET is unset or weak — using the development fallback. ' +
        'Tokens signed with it are forgeable; set JWT_SECRET before deploying.'
    );
  }
  return DEV_FALLBACK;
};

export default resolveJwtSecret;
