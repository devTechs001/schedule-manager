import assert from 'node:assert/strict';
import {
  publishActivity,
  getActivitySnapshot,
  subscribeActivity,
  resetActivitySnapshot,
} from '../src/services/store/activitySnapshot.js';

let pass = 0;
const t = (n, fn) => { try { fn(); pass++; console.log('  ✓', n); } catch (e) { console.log('  ✗', n, '-', e.message); process.exitCode = 1; } };

console.log('\nActivity snapshot store');
resetActivitySnapshot();

t('starts empty', () => {
  const s = getActivitySnapshot();
  assert.deepEqual(s.tasks, []);
  assert.deepEqual(s.events, []);
});

t('notifies subscribers on publish', () => {
  let calls = 0;
  const unsub = subscribeActivity(() => { calls++; });
  publishActivity({ tasks: [{ _id: 't1' }] });
  assert.equal(calls, 1);
  assert.equal(getActivitySnapshot().tasks.length, 1);
  unsub();
});

t('merges partial updates without dropping other keys', () => {
  publishActivity({ events: [{ _id: 'e1' }] });
  const s = getActivitySnapshot();
  assert.equal(s.tasks.length, 1, 'tasks were dropped');
  assert.equal(s.events.length, 1);
});

t('does not notify when the same reference is republished', () => {
  const tasks = [{ _id: 'same' }];
  publishActivity({ tasks });
  let calls = 0;
  const unsub = subscribeActivity(() => { calls++; });
  publishActivity({ tasks }); // identical reference
  assert.equal(calls, 0);
  unsub();
});

t('unsubscribe stops notifications', () => {
  let calls = 0;
  const unsub = subscribeActivity(() => { calls++; });
  unsub();
  publishActivity({ tasks: [{ _id: 'x' }] });
  assert.equal(calls, 0);
});

t('supports multiple independent subscribers', () => {
  let a = 0, b = 0;
  const ua = subscribeActivity(() => { a++; });
  const ub = subscribeActivity(() => { b++; });
  publishActivity({ tasks: [{ _id: 'y' }] });
  assert.equal(a, 1);
  assert.equal(b, 1);
  ua(); ub();
});

console.log(`\nSnapshot store: ${pass} passed\n`);
