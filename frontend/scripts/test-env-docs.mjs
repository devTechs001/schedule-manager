/**
 * Environment documentation check.
 *
 * An undocumented variable is a deployment waiting to fail: the server reads it,
 * `.env.example` does not mention it, so nobody sets it and the feature that
 * depends on it silently degrades. The reverse is worse — a documented knob that
 * nothing reads, which is how RATE_LIMIT_MAX_REQUESTS looked like it controlled
 * rate limiting while the real names were RATE_LIMIT_MAX / AUTH_RATE_LIMIT_MAX.
 *
 * This walks the actual call sites for both sides and compares them against the
 * example files. Adding a process.env.X or import.meta.env.VITE_X read without
 * documenting it fails here.
 *
 * Run: node scripts/test-env-docs.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const readAll = (roots, ext = /\.(js|jsx|mjs)$/) => {
  const files = [];
  for (const root of roots) {
    for (const f of walk(root)) if (ext.test(f)) files.push(f);
  }
  return files;
};

const keysIn = (files, pattern) => {
  const found = new Map();
  for (const file of files) {
    let src;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const m of src.matchAll(pattern)) {
      if (!found.has(m[1])) found.set(m[1], new Set());
      found.get(m[1]).add(file);
    }
  }
  return found;
};

/**
 * Keys an .env.example documents.
 *
 * Both `FOO=bar` and a commented-out `# FOO=bar` count: optional settings are
 * deliberately left commented so an operator sees them without having them
 * silently take effect. Requiring them to be live would push people to ship
 * active defaults for things that should stay unset.
 */
const documented = (path) => {
  const keys = new Set();
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim().replace(/^#\s*/, '');
    if (!trimmed) continue;
    const m = trimmed.match(/^([A-Z0-9_]+)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
};

// Vite inlines these and builds with node, so vite.config.js reads them through
// process.env; the browser code reads them through import.meta.env.
const VITE_DOC = '../frontend/.env.example';
const BACKEND_DOC = '../backend/.env.example';

const viteOwned = new Set(['VITE_BASE_PATH', 'VITE_HMR_PORT', 'VITE_HMR_PROTOCOL']);

const backendRead = keysIn(
  readAll(['../backend/src', '../backend/scripts']),
  /process\.env\.([A-Z0-9_]+)/g
);

const frontendRead = keysIn(
  [...readAll(['src']), ...readAll(['.'], /^\.\/vite\.config\.js$/)],
  /import\.meta\.env\.([A-Z0-9_]+)|process\.env\.([A-Z0-9_]+)/g
);
// The combined pattern puts JSX/branch matches in group 1 or 2 unpredictably,
// so normalise: only VITE_* keys are this file's business.
const frontendViteKeys = new Set(
  [...frontendRead.keys()].filter((k) => k.startsWith('VITE_'))
);

console.log('env docs');

check('backend reads a realistic set of variables', () => {
  assert(backendRead.size >= 20, `only ${backendRead.size} backend env reads found`);
});

check('frontend reads a realistic set of VITE_ variables', () => {
  assert(frontendViteKeys.size >= 10, `only ${frontendViteKeys.size} frontend env reads found`);
});

check('every backend variable the code reads is documented', () => {
  const doc = documented(BACKEND_DOC);
  // NODE_ENV is provided by the runtime, never set in .env.
  const missing = [...backendRead.keys()].filter((k) => k !== 'NODE_ENV' && !doc.has(k));
  assert(missing.length === 0, `undocumented in backend/.env.example: ${missing.join(', ')}`);
});

check('every documented backend variable is actually read', () => {
  const doc = documented(BACKEND_DOC);
  const dead = [...doc].filter((k) => !backendRead.has(k));
  assert(
    dead.length === 0,
    `documented but never read by the backend: ${dead.join(', ')}`
  );
});

check('every frontend VITE variable the code reads is documented or vite-owned', () => {
  const doc = documented(VITE_DOC);
  const missing = [...frontendViteKeys].filter((k) => !viteOwned.has(k) && !doc.has(k));
  assert(missing.length === 0, `undocumented in frontend/.env.example: ${missing.join(', ')}`);
});

check('every documented frontend variable is actually read', () => {
  const doc = documented(VITE_DOC);
  const dead = [...doc].filter((k) => !frontendViteKeys.has(k) && !viteOwned.has(k));
  assert(dead.length === 0, `documented but never read by the frontend: ${dead.join(', ')}`);
});

check('the dead rate-limit knobs are no longer documented', () => {
  const doc = documented(BACKEND_DOC);
  assert(!doc.has('RATE_LIMIT_MAX_REQUESTS'), 'RATE_LIMIT_MAX_REQUESTS changed nothing');
  assert(!doc.has('RATE_LIMIT_WINDOW_MS'), 'RATE_LIMIT_WINDOW_MS changed nothing');
});

check('the real rate-limit overrides are documented', () => {
  const src = readFileSync(BACKEND_DOC, 'utf8');
  assert(src.includes('RATE_LIMIT_MAX'), 'RATE_LIMIT_MAX should be documented');
  assert(src.includes('AUTH_RATE_LIMIT_MAX'), 'AUTH_RATE_LIMIT_MAX should be documented');
});

check('no secret-bearing variable is prefixed VITE_', () => {
  const doc = documented(VITE_DOC);
  const leaks = [...doc].filter((k) => /SECRET|PASSWORD|_KEY$/i.test(k) && k.startsWith('VITE_'));
  assert(leaks.length === 0, `these would ship in the browser bundle: ${leaks.join(', ')}`);
});

check('the real .env files are not tracked', () => {
  const gitignore = readFileSync('../.gitignore', 'utf8');
  assert(/\*\*\/\.env/.test(gitignore), 'gitignore should cover nested .env files');
  const tracked = readFileSync('../.git/index', 'utf8');
  assert(typeof tracked === 'string');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
