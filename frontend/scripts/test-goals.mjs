/**
 * Goals & habits logic.
 *
 * The streak calculation is the part most likely to be subtly wrong, so it is
 * tested directly: today counts, a gap breaks the chain, and an unticked today
 * does not reset an otherwise unbroken streak.
 */
import assert from 'node:assert/strict';

const store = new Map();
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

const { streakOf, todayKey } = await import('../src/hooks/useGoals.js');

const dayKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

console.log('\nGoals & habits');

t('todayKey is an ISO date', () => {
  assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

t('no days means no streak', () => {
  assert.equal(streakOf({}), 0);
});

t('ticking today alone is a 1-day streak', () => {
  assert.equal(streakOf({ [dayKey(0)]: true }), 1);
});

t('consecutive days accumulate', () => {
  assert.equal(streakOf({ [dayKey(0)]: true, [dayKey(-1)]: true, [dayKey(-2)]: true }), 3);
});

t('an unticked today does not break the streak', () => {
  // Yesterday + the day before, nothing yet today.
  assert.equal(streakOf({ [dayKey(-1)]: true, [dayKey(-2)]: true }), 2);
});

t('a gap breaks the chain', () => {
  // Today and 3 days ago: the 2-day gap resets it to 1.
  assert.equal(streakOf({ [dayKey(0)]: true, [dayKey(-3)]: true }), 1);
});

t('a stale streak (nothing for 3 days) is 0', () => {
  assert.equal(streakOf({ [dayKey(-3)]: true, [dayKey(-4)]: true }), 0);
});

t('completion percentage is clamped', () => {
  const pct = (progress, target) => (target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0);
  assert.equal(pct(5, 10), 50);
  assert.equal(pct(20, 10), 100);
  assert.equal(pct(1, 0), 0);
});

t('goal normalisation rejects nonsense targets', () => {
  const normalise = (goal) => ({
    target: Number.isFinite(goal.target) && goal.target > 0 ? goal.target : 1,
    progress: Number.isFinite(goal.progress) ? Math.max(0, goal.progress) : 0,
  });
  assert.equal(normalise({ target: 0 }).target, 1);
  assert.equal(normalise({ target: -5 }).target, 1);
  assert.equal(normalise({ progress: -3 }).progress, 0);
  assert.equal(normalise({ progress: 4 }).progress, 4);
});

console.log(`\n${pass} goals assertions passed\n`);
if (process.exitCode) process.exit(process.exitCode);
