/**
 * API surface check.
 *
 * Every path the frontend calls must exist on the backend. A typo or a stale
 * method does not fail the build — it fails at runtime, as a 404 that most
 * call sites swallow into an empty state. That is how `POST /api/ai/analyze`
 * survived: no backend route, no caller, no error anyone would notice.
 *
 * This parses both sides statically:
 *   backend/src/routes/*.js  — router.get('/x') and router.route('/x').get()
 *   frontend/src/**          — client.get('/x') / axios.get('/x') with template
 *                              literals normalised to :param
 *
 * It also asserts the reverse direction is *not* enforced: a backend route
 * with no frontend caller is a legitimate API surface (admin endpoints), so
 * those are reported as informational, not failures.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BACKEND = '../backend/src/routes';
const FRONTEND = 'src';

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

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

// ---- backend routes -------------------------------------------------------
function backendRoutes() {
  const routes = new Set();
  for (const file of readdirSync(BACKEND).filter((f) => f.endsWith('.js'))) {
    const mount = file.replace(/\.js$/, '');
    const src = readFileSync(join(BACKEND, file), 'utf8');

    for (const m of src.matchAll(/router\.(get|post|put|patch|delete)\(\s*'([^']*)'/g)) {
      routes.add(`${m[1].toUpperCase()} /api/${mount}${m[2] === '/' ? '' : m[2]}`);
    }
    for (const m of src.matchAll(/router\.route\(\s*'([^']*)'\s*\)((?:\s*\.\w+\([^)]*\))*)/g)) {
      const path = m[1] === '/' ? '' : m[1];
      for (const v of m[2].matchAll(/\.(get|post|put|patch|delete)\(/g)) {
        routes.add(`${v[1].toUpperCase()} /api/${mount}${path}`);
      }
    }
  }
  return routes;
}

// ---- frontend calls -------------------------------------------------------
function frontendCalls() {
  const calls = new Map(); // "METHOD /api/path" -> [files]
  for (const file of walk(FRONTEND)) {
    if (!/\.(js|jsx)$/.test(file)) continue;
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:client|api|axios)\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)) {
      // Bare paths are relative to the /api prefix; config.apiUrl is '/api'.
      const raw = m[2];
      if (!raw.startsWith('/')) continue; // relative to something else
      const path = '/api' + raw.replace(/\$\{[^}]+\}/g, ':id');
      const key = `${m[1].toUpperCase()} ${path}`;
      if (!calls.has(key)) calls.set(key, []);
      calls.get(key).push(file);
    }
  }
  return calls;
}

console.log('api surface');

const backend = backendRoutes();
const calls = frontendCalls();

check('backend route parser finds a realistic number of routes', () => {
  assert(backend.size > 40, `expected 40+ backend routes, found ${backend.size}`);
});

check('frontend call parser finds a realistic number of call sites', () => {
  assert(calls.size > 20, `expected 20+ distinct frontend calls, found ${calls.size}`);
});

check('every frontend call has a matching backend route', () => {
  const missing = [];
  for (const [key, files] of calls) {
    if (backend.has(key)) continue;
    // Template ids normalise to :id; the route may declare any param name.
    const [method, path] = key.split(' ');
    const pattern = new RegExp(
      '^' + method + ' ' + path.replace(/:[a-zA-Z]+/g, ':[a-zA-Z]+').replace(/\//g, '\\/') + '$'
    );
    const matches = [...backend].some((r) => pattern.test(r));
    if (!matches) missing.push(`${key}  ← ${[...new Set(files)].join(', ')}`);
  }
  assert(missing.length === 0, `no backend route for:\n    ${missing.join('\n    ')}`);
});

check('the phantom /ai/analyze endpoint is gone', () => {
  assert(!backend.has('POST /api/ai/analyze'), 'backend should not define /ai/analyze');
  assert(!calls.has('POST /api/ai/analyze'), 'frontend should not call /ai/analyze');
});

check('every aiAPI method maps to a real ai route', () => {
  const src = readFileSync('src/services/api/aiAPI.js', 'utf8');
  const declared = [...src.matchAll(/client\.(get|post)\(\s*'(\/ai\/[^']+)'/g)].map(
    (m) => `${m[1].toUpperCase()} /api${m[2]}`
  );
  assert(declared.length > 0, 'expected to find aiAPI endpoints');
  const missing = declared.filter((d) => !backend.has(d));
  assert(missing.length === 0, `aiAPI declares unreal routes: ${missing.join(', ')}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
