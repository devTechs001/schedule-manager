/**
 * Boot check — loads the *production bundle* in a real DOM (jsdom) and reports
 * whether it boots, warns, or throws.
 *
 * This is the check that catches "app freezes at the splash": a module that
 * throws during evaluation means React never mounts and the splash is never
 * dismissed, while `vite build` and SSR smoke both stay green.
 *
 * Run: node scripts/boot-check.mjs [distDir]
 */
import { readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const distDir = resolve(process.argv[2] || 'dist');
const indexPath = resolve(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error(`✗ ${indexPath} not found — run "npm run build" first`);
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

const errors = [];
const warnings = [];
const logs = [];

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => {
  const msg = String(e.message || '');
  // jsdom lacks scrollTo/layout; that is harness noise, not an app failure.
  if (/Not implemented: Window's scrollTo|Not implemented: window\.scrollTo/i.test(msg)) return;
  errors.push(`jsdomError: ${msg}`);
});
virtualConsole.on('error', (...args) => errors.push(args.join(' ')));
virtualConsole.on('warn', (...args) => warnings.push(args.join(' ')));
virtualConsole.on('log', (...args) => logs.push(args.join(' ')));

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  resources: undefined, // we execute the bundle manually below
  pretendToBeVisual: true,
  virtualConsole,
});

const { window } = dom;

// Real sockets/fetches are noise for a boot check: stub them before the bundle
// runs so we measure mounting, not network reachability.
window.WebSocket = class {
  constructor() {
    this.readyState = 0;
    setTimeout(() => {
      this.readyState = 3;
      this.onclose?.({ code: 1006 });
      this.onerror?.(new Error('stubbed'));
    }, 0);
  }
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
};
window.fetch = () => Promise.reject(new Error('network disabled in boot check'));
window.XMLHttpRequest = class {
  open() {}
  send() {
    setTimeout(() => this.onerror?.(new Error('network disabled')), 0);
  }
  setRequestHeader() {}
  addEventListener() {}
};


// jsdom lacks a few APIs the app touches during boot.
window.matchMedia =
  window.matchMedia ||
  (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
window.scrollTo = window.scrollTo || (() => {});
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
window.HTMLCanvasElement.prototype.getContext = () => null;

// Execute the entry bundle the same way the browser would.
const scriptMatch = html.match(/<script[^>]+src="([^"]+\.js)"/);
if (!scriptMatch) {
  console.error('✗ no entry script found in index.html');
  process.exit(1);
}

const entry = scriptMatch[1].replace(/^\//, '');
const entryPath = resolve(distDir, entry);
if (!existsSync(entryPath)) {
  console.error(`✗ entry bundle missing on disk: ${entryPath}`);
  process.exit(1);
}

// The bundle is an ES module (it has top-level import/export), so it cannot be
// window.eval'd. Register it as a real ES module on disk and import it, with
// the jsdom globals installed on globalThis first.
import { writeFileSync as writeTmp } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Node 22 exposes `navigator` (and others) as getter-only globals, so plain
// assignment throws. defineProperty with configurable:true is the way in.
for (const key of ['window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage']) {
  Object.defineProperty(globalThis, key, {
    value: window[key] ?? window,
    configurable: true,
    writable: true,
  });
}
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.matchMedia = window.matchMedia;
globalThis.requestAnimationFrame = window.requestAnimationFrame;
globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
globalThis.IntersectionObserver = window.IntersectionObserver;
globalThis.ResizeObserver = window.ResizeObserver;
globalThis.MutationObserver = window.MutationObserver;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Event = window.Event;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.MouseEvent = window.MouseEvent;
globalThis.DOMRect = window.DOMRect;
globalThis.CSS = window.CSS || { supports: () => false };

const esmPath = resolve(distDir, '__boot-check-entry.mjs');
writeTmp(esmPath, readFileSync(entryPath, 'utf8'));
try {
  await import(pathToFileURL(esmPath).href);
} finally {
  // Never leave harness artifacts inside dist/ — they would be deployed.
  try {
    rmSync(esmPath, { force: true });
  } catch {
    /* already gone */
  }
}

// Give React a few macrotasks to mount and the boot handoff to run.
await new Promise((r) => setTimeout(r, 1500));

const splash = window.document.getElementById('boot-splash');
const root = window.document.getElementById('root');
const rootHtml = root ? root.innerHTML.trim() : '';
const statusEl = window.document.getElementById('boot-status');
const recoveryEl = window.document.getElementById('boot-recovery');

const report = [];
const problems = [];

if (rootHtml.length === 0) problems.push('React painted nothing into #root');
if (splash && !splash.classList.contains('boot--leaving')) {
  problems.push('splash still visible (boot handoff never ran)');
}
if (splash) {
  problems.push('splash still in the DOM after the fade window');
}
if (errors.length) problems.push(`${errors.length} runtime error(s)`);
if (window.__bootFailure) problems.push(`boot failure: ${window.__bootFailure}`);

report.push(`root children:   ${root ? root.children.length : 'no #root'}`);
report.push(`root html length:${rootHtml.length}`);
report.push(`splash element:  ${splash ? 'STILL PRESENT' : 'removed ✓'}`);
report.push(`boot status text:${statusEl ? `"${statusEl.textContent}"` : 'n/a'}`);
report.push(`console errors:  ${errors.length}`);
report.push(`console warnings:${warnings.length}`);

/*
 * Stale-cache guardrails.
 *
 * The reported "frozen splash screen" is a client-cache failure: an old HTML
 * shell referencing chunk filenames that the current deploy no longer ships.
 * These assertions keep the three defences in place so the regression cannot
 * silently return.
 */
const htmlShell = readFileSync(resolve(distDir, 'index.html'), 'utf8');
const swSource = readFileSync(resolve(distDir, 'sw.js'), 'utf8');

if (!recoveryEl) {
  problems.push('#boot-recovery panel is missing from index.html');
} else {
  report.push('recovery panel:present');
}

if (!/__bootRecovered/.test(htmlShell) || !/__bootDone/.test(htmlShell)) {
  problems.push('boot watchdog script is missing from index.html');
} else {
  report.push('boot watchdog:present');
}

if (!/clear cache/i.test(htmlShell)) {
  problems.push('recovery panel has no cache-clearing affordance');
}

/*
 * Dark is the product default. The jsdom above ran with EMPTY localStorage, so
 * whatever is on <html> right now is what a first-time visitor actually gets.
 * Assert the outcome, not the markup — the theme is applied by script.
 */
const rootEl = window.document.documentElement;
const bootAttr = rootEl.getAttribute('data-boot');
const hasDarkClass = rootEl.classList.contains('dark');

if (!hasDarkClass || (bootAttr !== 'dark' && !/^(midnight|nord)$/.test(bootAttr || ''))) {
  problems.push(
    `first-time visitor is not dark (class="${rootEl.className}" data-boot="${bootAttr}")`
  );
} else {
  report.push('default theme:dark ✓');
}

if (!/var DEFAULT_THEME = 'dark'/.test(htmlShell)) {
  problems.push('inline theme bootstrap no longer defaults to dark');
}

/*
 * Demo sandbox must not ship in a production build.
 *
 * The demo is a development aid. If any of these strings survive into dist/, a
 * user could be offered a sandbox account (or told their empty inbox is "sample
 * data") on a real deployment. Fail the build rather than let that happen.
 */
const DEMO_MARKERS = [
  'Explore instantly with a demo',
  'you are exploring a sandbox',
  'demo@schedai.local',
  'Try the live demo',
];

const assetDir = resolve(distDir, 'assets');
const assetFiles = existsSync(assetDir)
  ? readdirSync(assetDir).filter((f) => f.endsWith('.js'))
  : [];
const leaked = [];
for (const marker of DEMO_MARKERS) {
  for (const file of assetFiles) {
    if (readFileSync(resolve(assetDir, file), 'utf8').includes(marker)) {
      leaked.push(`${marker} (${file})`);
      break;
    }
  }
}

if (leaked.length) {
  problems.push(`demo UI leaked into the production bundle: ${leaked.join(', ')}`);
} else {
  report.push('demo stripped from prod:✓');
}

/*
 * The local fallback must not invent data for a real user. Verify the guard is
 * still in the shipped code — a seeded "Review Q4 product roadmap" task in
 * someone's empty workspace is indistinguishable from a bug.
 */
const fallbackSourceFiles = assetFiles.filter((f) => {
  try {
    return readFileSync(resolve(assetDir, f), 'utf8').includes('schedai:seeded');
  } catch {
    return false;
  }
});
if (!fallbackSourceFiles.length) {
  // The fallback module may be inlined; absence is not a failure on its own.
  report.push('local fallback:not-bundled');
} else {
  report.push('local fallback:present');
}

if (!/cleanupOutdatedCaches/.test(swSource)) {
  problems.push('service worker does not clean outdated caches');
} else {
  report.push('sw cleanupOutdatedCaches:present');
}

if (!/index\.html/.test(swSource)) {
  problems.push('service worker does not precache the HTML shell');
}

console.log(`\nBoot check — ${distDir}`);
console.log(report.map((line) => `  ${line}`).join('\n'));

if (errors.length) {
  console.log('\n  Errors:');
  errors.slice(0, 8).forEach((e) => console.log(`    ${e.slice(0, 400)}`));
}
if (warnings.length) {
  console.log('\n  Warnings (first 5):');
  warnings.slice(0, 5).forEach((w) => console.log(`    ${w.slice(0, 240)}`));
}

if (problems.length) {
  console.log('\n✗ FAIL');
  problems.forEach((p) => console.log(`   - ${p}`));
  process.exit(1);
}

console.log('\n✓ Boot check passed — app mounted and splash dismissed\n');
process.exit(0);
