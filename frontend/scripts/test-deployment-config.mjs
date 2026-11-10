/**
 * Deployment plumbing: the health endpoint path and rate-limit ceilings.
 *
 * Both are easy to get subtly wrong and impossible to notice from the UI.
 *
 * - `/health` is mounted at the server root, not under `/api`. The offline page
 *   used to fetch `/api/health`, which is a 404, so "Check connection" reported
 *   offline on every attempt — even when the connection was fine.
 * - The rate limiter shipped development numbers to production: 100 login
 *   attempts per 15 minutes per IP is 9,600 guesses a day, enough for
 *   credential stuffing, with no lockout behind it.
 *
 * Run: node scripts/test-deployment-config.mjs
 */
import { readFileSync } from 'fs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  ✗ ${name}\n    ${error.message}`);
  }
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed');
};

/** Mirrors pages/Error/Offline.jsx. */
const healthEndpoint = (apiUrl) =>
  `${String(apiUrl || '/api').replace(/\/$/, '').replace(/\/api$/, '')}/health`;

/** Mirrors middleware/rateLimit.js. */
const resolveLimits = (env) => {
  const isProd = env === 'production';
  return { apiMax: isProd ? 300 : 1000, authMax: isProd ? 10 : 100, isProd };
};

console.log('deployment config');

// --- health endpoint -------------------------------------------------------

check('health resolves to /health from the default /api base', () => {
  assert(healthEndpoint('/api') === '/health', `got ${healthEndpoint('/api')}`);
});

check('health tolerates a trailing slash', () => {
  assert(healthEndpoint('/api/') === '/health', `got ${healthEndpoint('/api/')}`);
});

check('health tolerates an unset base', () => {
  assert(healthEndpoint(undefined) === '/health', `got ${healthEndpoint(undefined)}`);
});

check('health follows an absolute API origin', () => {
  assert(
    healthEndpoint('https://api.example.com/api') === 'https://api.example.com/health',
    `got ${healthEndpoint('https://api.example.com/api')}`
  );
});

check('health never keeps the /api prefix', () => {
  for (const base of ['/api', '/api/', undefined, 'https://x.dev/api', 'https://x.dev/api/']) {
    assert(!healthEndpoint(base).includes('/api'), `${base} produced ${healthEndpoint(base)}`);
  }
});

check('the offline page no longer hardcodes /api/health', () => {
  const src = readFileSync('src/pages/Error/Offline.jsx', 'utf8');
  assert(!src.includes("fetch('/api/health'"), 'Offline.jsx still fetches /api/health directly');
  assert(src.includes('HEALTH_ENDPOINT'), 'Offline.jsx should use the derived endpoint');
});

// --- rate limits -----------------------------------------------------------

check('production login limit is strict', () => {
  const { authMax } = resolveLimits('production');
  assert(authMax <= 10, `production allows ${authMax} login attempts per window`);
});

check('production is stricter than development', () => {
  const prod = resolveLimits('production');
  const dev = resolveLimits('development');
  assert(prod.authMax < dev.authMax, 'production auth limit should be lower than development');
  assert(prod.apiMax <= dev.apiMax, 'production API limit should not exceed development');
});

check('development limits stay loose', () => {
  const { authMax, apiMax } = resolveLimits('development');
  assert(authMax >= 50 && apiMax >= 500, 'development should not throttle reload loops');
});

check('limits are overridable per deployment', () => {
  const src = readFileSync('../backend/src/middleware/rateLimit.js', 'utf8');
  assert(src.includes('RATE_LIMIT_MAX'), 'API limit should read RATE_LIMIT_MAX');
  assert(src.includes('AUTH_RATE_LIMIT_MAX'), 'auth limit should read AUTH_RATE_LIMIT_MAX');
});

check('the limiter branches on NODE_ENV', () => {
  const src = readFileSync('../backend/src/middleware/rateLimit.js', 'utf8');
  assert(src.includes("process.env.NODE_ENV === 'production'"), 'limiter must check NODE_ENV');
});

check('successful logins do not count toward the lockout', () => {
  const src = readFileSync('../backend/src/middleware/rateLimit.js', 'utf8');
  assert(src.includes('skipSuccessfulRequests'), 'auth limiter should skip successful requests');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
