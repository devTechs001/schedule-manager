/**
 * SSR smoke test — renders every page once with react-dom/server and a small
 * DOM shim. Catches runtime crashes a production build cannot detect (bad
 * hooks, undefined components, crashes on empty data).
 *
 * Run: npx vite-node scripts/ssr-smoke.jsx
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const store = new Map();
global.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
global.sessionStorage = global.localStorage;

const docEl = {
  classList: { add() {}, remove() {}, toggle() {} },
  style: {},
  dataset: {},
};
global.window = {
  location: { pathname: '/', search: '', hash: '', origin: 'http://localhost:5173', assign() {} },
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener() {},
  removeEventListener() {},
  scrollTo() {},
  innerWidth: 1440,
  innerHeight: 900,
  getComputedStyle: () => ({ getPropertyValue: () => '15 23 42' }),
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  document: {
    documentElement: docEl,
    querySelector: () => null,
    addEventListener() {},
    removeEventListener() {},
    body: { style: {} },
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }),
    head: { appendChild() {} },
  },
};
global.document = global.window.document;
Object.defineProperty(global, 'navigator', { value: { onLine: true, userAgent: 'node' }, configurable: true });
global.matchMedia = global.window.matchMedia;
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.getComputedStyle = global.window.getComputedStyle;
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.MutationObserver = class { observe() {} disconnect() {} };
global.Audio = class { play() { return Promise.resolve(); } };

const pages = import.meta.glob('../src/pages/**/*.jsx', { eager: true });
const { ThemeProvider } = await import('../src/contexts/ThemeContext.jsx');
const { AuthProvider } = await import('../src/contexts/AuthContext.jsx');
const { AIProvider } = await import('../src/contexts/AIContext.jsx');

const wrap = (Component, path) =>
  React.createElement(
    MemoryRouter,
    { initialEntries: [path] },
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        AuthProvider,
        null,
        React.createElement(AIProvider, null, React.createElement(Component))
      )
    )
  );

const results = [];
for (const [file, mod] of Object.entries(pages)) {
  const name = file.replace('../src/pages/', '').replace('.jsx', '');
  const Component = mod.default;
  if (typeof Component !== 'function') {
    results.push({ name, ok: false, error: 'no default component export' });
    continue;
  }
  if (name.endsWith('PublicLayout')) {
    results.push({ name, ok: true, length: 0, note: 'shell (has <Outlet/>)' });
    continue;
  }
  try {
    const html = renderToString(wrap(Component, `/${name.toLowerCase()}`));
    results.push({ name, ok: true, length: html.length });
  } catch (error) {
    results.push({ name, ok: false, error: String(error.message).split('\n')[0] });
  }
}

// The app shell (Header / Sidebar / CommandPalette / ShortcutSheet / FAB) is not a
// page, so render it explicitly through <Layout/> with a nested route.
try {
  const Layout = (await import('../src/components/layout/Layout.jsx')).default;
  const Shell = Layout;
  const { Routes, Route } = await import('react-router-dom');
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/dashboard'] },
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          AuthProvider,
          null,
          React.createElement(
            Routes,
            null,
            React.createElement(
              Route,
              { element: React.createElement(Shell) },
              React.createElement(Route, { path: '/dashboard', element: React.createElement('div', null, 'stub') })
            )
          )
        )
      )
    )
  );
  results.push({ name: 'components/layout/Layout', ok: html.length > 0, length: html.length });
} catch (error) {
  results.push({
    name: 'components/layout/Layout',
    ok: false,
    error: String(error.message).split('\n')[0],
  });
}

// Marketing pages carry the hero artwork classes; assert they are actually
// applied so a CSS refactor cannot silently drop the background.
try {
  const marketing = {
    Home: (await import('../src/pages/Public/Home.jsx')).default,
    Features: (await import('../src/pages/Public/Features.jsx')).default,
    About: (await import('../src/pages/Public/About.jsx')).default,
    Contact: (await import('../src/pages/Public/Contact.jsx')).default,
  };
  for (const [name, Component] of Object.entries(marketing)) {
    const html = renderToString(wrap(Component, '/'));
    results.push({
      name: `hero/${name}`,
      ok: html.includes('hero-art'),
      length: html.length,
      error: html.includes('hero-art') ? undefined : 'no hero-art class in output',
    });
  }
} catch (error) {
  results.push({ name: 'hero/registry', ok: false, error: String(error.message).split('\n')[0] });
}

const failed = results.filter((r) => !r.ok);
console.log(`\nSSR smoke: ${results.length - failed.length}/${results.length} pages rendered`);
for (const r of results) {
  console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ` — ${r.error}`}`);
}
if (failed.length) process.exitCode = 1;
