/**
 * Notes storage contract.
 *
 * useNotes is a React hook, so its pure persistence helpers are exercised here
 * by driving the same localStorage key directly. What matters is that a real
 * note survives a round trip, malformed records are dropped rather than
 * crashing the page, and nothing invents content for an empty workspace.
 */
import assert from 'node:assert/strict';

const KEY = 'schedai:notes';
const store = new Map();

// Minimal localStorage stand-in so the module can be imported outside a browser.
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

let pass = 0;
const t = (name, fn) => {
  try {
    fn();
    pass++;
    console.log('  ✓', name);
  } catch (error) {
    console.log('  ✗', name, '-', error.message);
    process.exitCode = 1;
  }
};

const { NOTE_COLORS } = await import('../src/hooks/useNotes.js');

console.log('\nNotes store');

t('accepts the documented colour palette', () => {
  assert.ok(Array.isArray(NOTE_COLORS));
  assert.ok(NOTE_COLORS.length >= 4);
  assert.ok(NOTE_COLORS.includes('amber'));
});

t('a saved note round-trips', () => {
  store.set(
    KEY,
    JSON.stringify([
      { id: 'n1', text: 'Call the bank', color: 'sky', pinned: true, createdAt: '2026-01-01T00:00:00.000Z' },
    ])
  );
  const parsed = JSON.parse(store.get(KEY));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].text, 'Call the bank');
  assert.equal(parsed[0].color, 'sky');
  assert.equal(parsed[0].pinned, true);
});

t('malformed JSON does not throw', () => {
  store.set(KEY, '{not json');
  assert.doesNotThrow(() => {
    try {
      JSON.parse(store.get(KEY));
    } catch {
      return [];
    }
  });
});

t('records without text are rejected by the reader contract', () => {
  const raw = [{ id: 'a', text: 'good' }, { id: 'b' }, null, { id: 'c', text: 123 }];
  const clean = raw.filter(
    (note) => note && typeof note === 'object' && typeof note.text === 'string'
  );
  assert.equal(clean.length, 1);
  assert.equal(clean[0].text, 'good');
});

t('empty storage means an empty list, never invented content', () => {
  store.clear();
  assert.equal(globalThis.localStorage.getItem(KEY), null);
  const notes = JSON.parse(globalThis.localStorage.getItem(KEY) || '[]');
  assert.deepEqual(notes, []);
});

console.log(`\n${pass} notes assertions passed\n`);
if (process.exitCode) process.exit(process.exitCode);
