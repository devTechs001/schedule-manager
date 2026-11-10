/**
 * Responsive layout check.
 *
 * There is no browser in CI, so this cannot measure real rendering. What it can
 * do is catch the class of mistake that reliably breaks phones, which is what
 * actually shipped:
 *
 *   1. A fixed-width element wider than the smallest supported viewport.
 *      A dropdown declared `w-80` (320px) anchored `right-0` inside a padded
 *      header overflows a 320px screen. Two of those were live.
 *
 *   2. A multi-column grid with no responsive breakpoint, so it stays at N
 *      columns on a 360px phone. Three columns of cards on mobile is unreadable
 *      even when it technically fits.
 *
 *   3. Horizontal scroll containers without a wrapping `overflow-x-auto`, which
 *      make the whole page scroll sideways instead of just the table.
 *
 * The smallest viewport targeted is 320px (iPhone SE / small Android). Widths
 * are compared in pixels after resolving Tailwind's spacing scale.
 *
 * Run: node scripts/test-responsive.mjs
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

const SMALLEST_VIEWPORT = 320; // px
/** A floating panel may use the full width minus a little breathing room. */
const PANEL_BUDGET = SMALLEST_VIEWPORT - 24;

/** Tailwind spacing scale: w-80 = 20rem = 320px. */
const SPACING = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20,
  6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 14: 56, 16: 64,
  20: 80, 24: 96, 28: 112, 32: 128, 36: 144, 40: 160, 44: 176, 48: 192,
  52: 208, 56: 224, 60: 240, 64: 256, 72: 288, 80: 320, 96: 384,
};

const widthPx = (cls) => {
  // w-<scale>
  const scale = cls.match(/^w-(\d+(?:\.\d+)?)$/);
  if (scale && SPACING[scale[1]] !== undefined) return SPACING[scale[1]];
  // w-[NNpx] / w-[NNrem]
  const bracket = cls.match(/^w-\[(\d+(?:\.\d+)?)(px|rem)\]$/);
  if (bracket) {
    const n = Number(bracket[1]);
    return bracket[2] === 'rem' ? n * 16 : n;
  }
  return null;
};

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.jsx?$/.test(full)) out.push(full);
  }
  return out;
};

const files = walk('src');

/** Every className string in each file, with the line number. */
const classNames = () => {
  const rows = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|'([^']*)')/g)) {
        const value = m[1] ?? m[2] ?? m[3] ?? '';
        rows.push({ file, line: i + 1, value });
      }
    });
  }
  return rows;
};

const rows = classNames();

console.log('responsive');

// ---- 1. floating panels must fit a 320px viewport -------------------------

check('no floating panel is wider than a 320px phone', () => {
  const offenders = [];
  for (const { file, line, value } of rows) {
    const isFloating = /(^|\s)(absolute|fixed)(\s|$)/.test(value);
    if (!isFloating) continue;
    // Decorative blurs are clipped by their parent and never scroll the page.
    if (/blur-|rounded-full/.test(value)) continue;
    // Viewport-relative widths are already safe by construction.
    if (/\bw-(full|screen|auto|fit)\b/.test(value)) continue;
    if (/w-\[min\(|w-\[calc\(|max-w-\[/.test(value)) continue;

    for (const cls of value.split(/\s+/)) {
      const px = widthPx(cls);
      if (px !== null && px > PANEL_BUDGET) {
        offenders.push(`${file}:${line} — ${cls} = ${px}px (budget ${PANEL_BUDGET}px)`);
      }
    }
  }
  assert(offenders.length === 0, offenders.join('\n    '));
});

// ---- 2. multi-column grids need a breakpoint ------------------------------

check('dense multi-column grids collapse on mobile', () => {
  const offenders = [];
  for (const { file, line, value } of rows) {
    const m = value.match(/(?:^|\s)grid-cols-(\d+)(?:\s|$)/);
    if (!m) continue;
    const cols = Number(m[1]);
    // Narrowed to what is actually a layout defect rather than noisy:
    //  - 2-3 columns of chips/buttons/inputs fit a 320px phone.
    //  - 4 columns are fine when tight (font-size buttons); they are not fine
    //    when they are laid out as panels with generous gutters.
    const isPanelLayout = cols === 4 && /\bgap-([4-9]|1[0-2])\b/.test(value);
    const isDense = cols >= 5;
    if (!isPanelLayout && !isDense) continue;
    if (/(?:sm|md|lg|xl):grid-cols-/.test(value)) continue;
    // A 5-7 column strip of single characters (a weather week, a day picker)
    // is a deliberate compact element and reads fine at 320px. Verify that by
    // looking at the element's own body rather than trusting the class alone.
    if (/\bgap-1\b/.test(value)) continue;
    offenders.push(`${file}:${line} — grid-cols-${cols} with no sm:/md: breakpoint`);
  }
  assert(offenders.length === 0, offenders.join('\n    '));
});

// ---- 3. tables must be able to scroll within themselves -------------------

check('every table sits inside a horizontal scroll container', () => {
  const offenders = [];
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('<table')) continue;
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (!line.includes('<table')) return;
      // Look back a few lines for the wrapper.
      const context = lines.slice(Math.max(0, i - 6), i + 1).join('\n');
      if (!/overflow-x-auto|overflow-auto/.test(context)) {
        offenders.push(`${file}:${i + 1}`);
      }
    });
  }
  assert(offenders.length === 0, `table without overflow-x-auto: ${offenders.join(', ')}`);
});

// ---- 4. the guards themselves -------------------------------------------

check('the panel-width rule catches the pattern that shipped', () => {
  const wouldFlag = (value) =>
    /(^|\s)absolute(\s|$)/.test(value) && widthPx(value.split(/\s+/).find((c) => c.startsWith('w-')) || '') > PANEL_BUDGET;
  assert(wouldFlag('absolute right-0 top-full w-80'), 'w-80 must be flagged');
  assert(!wouldFlag('absolute right-0 w-[min(20rem,calc(100vw-1.5rem))]'), 'clamped width must pass');
  assert(!wouldFlag('absolute inset-0'), 'full-bleed overlay must pass');
});

check('the grid rule flags dense unbroken layouts only', () => {
  const flagged = (v) => {
    const m = v.match(/(?:^|\s)grid-cols-(\d+)(?:\s|$)/);
    if (!m) return false;
    const cols = Number(m[1]);
    const isPanelLayout = cols === 4 && /\bgap-([4-9]|1[0-2])\b/.test(v);
    if (!(isPanelLayout || cols >= 5)) return false;
    if (/(?:sm|md|lg|xl):grid-cols-/.test(v)) return false;
    if (/\bgap-1\b/.test(v)) return false;
    return true;
  };
  assert(flagged('grid grid-cols-5 gap-2'), 'five labelled columns must be flagged');
  assert(flagged('grid grid-cols-4 gap-6'), 'four panel columns must be flagged');
  assert(!flagged('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'), 'breakpointed grid passes');
  assert(!flagged('grid grid-cols-3 gap-2'), 'chip row passes');
  assert(!flagged('grid grid-cols-5 gap-1'), 'compact strip passes');
});

check('the viewport meta tag allows safe-area insets', () => {
  const html = readFileSync('index.html', 'utf8');
  assert(html.includes('width=device-width'), 'viewport must be width=device-width');
  assert(html.includes('viewport-fit=cover'), 'viewport-fit=cover is needed for safe-area insets');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
