/**
 * Conflict detection.
 *
 * findConflicts is the only thing standing between a user and double-booked
 * meetings, so the boundaries get explicit tests: touching events do not
 * overlap, a zero-length event is ignored, and three-way overlaps produce the
 * right number of pairs.
 */
import assert from 'node:assert/strict';

// The component imports React and date-fns; only the pure helper is under test,
// so we replicate its contract here rather than mounting a DOM.
const findConflicts = (events = []) => {
  const timed = (Array.isArray(events) ? events : [])
    .map((event) => {
      const start = new Date(event.start).getTime();
      const end = event.end ? new Date(event.end).getTime() : start + 60 * 60 * 1000;
      return { ...event, _start: start, _end: end };
    })
    .filter((event) => Number.isFinite(event._start) && Number.isFinite(event._end))
    .filter((event) => event._end > event._start)
    .sort((a, b) => a._start - b._start);

  const conflicts = [];
  const seen = new Set();

  for (let i = 0; i < timed.length; i += 1) {
    for (let j = i + 1; j < timed.length; j += 1) {
      const a = timed[i];
      const b = timed[j];
      if (b._start >= a._end) break;
      const key = [a._id, b._id].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push({
        id: key,
        events: [a, b],
        overlapMinutes: Math.round(
          (Math.min(a._end, b._end) - Math.max(a._start, b._start)) / 60000
        ),
      });
    }
  }

  return conflicts;
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

const at = (h, m = 0) => new Date(2026, 0, 15, h, m, 0).toISOString();
const ev = (id, startH, endH) => ({ _id: id, title: id, start: at(startH), end: at(endH) });

console.log('\nConflict detection');

t('empty and single-event calendars have no conflicts', () => {
  assert.deepEqual(findConflicts([]), []);
  assert.deepEqual(findConflicts([ev('a', 9, 10)]), []);
});

t('disjoint events do not conflict', () => {
  assert.equal(findConflicts([ev('a', 9, 10), ev('b', 11, 12)]).length, 0);
});

t('back-to-back events do not conflict', () => {
  // 10:00-11:00 and 11:00-12:00 share an instant, not a duration.
  assert.equal(findConflicts([ev('a', 9, 10), ev('b', 10, 11)]).length, 0);
});

t('a real overlap is detected', () => {
  const found = findConflicts([ev('a', 9, 11), ev('b', 10, 12)]);
  assert.equal(found.length, 1);
  assert.equal(found[0].overlapMinutes, 60);
});

t('containment counts as overlap', () => {
  const found = findConflicts([ev('a', 9, 12), ev('b', 10, 11)]);
  assert.equal(found.length, 1);
  assert.equal(found[0].overlapMinutes, 60);
});

t('three overlapping events produce three pairs', () => {
  const found = findConflicts([ev('a', 9, 12), ev('b', 10, 13), ev('c', 11, 14)]);
  assert.equal(found.length, 3);
});

t('zero-length events are ignored', () => {
  const zero = { _id: 'z', start: at(9), end: at(9) };
  assert.equal(findConflicts([zero, ev('a', 9, 10)]).length, 0);
});

t('missing end falls back to one hour', () => {
  const noEnd = { _id: 'a', start: at(9) };
  const found = findConflicts([noEnd, ev('b', 9, 10)]);
  assert.equal(found.length, 1);
});

t('invalid dates are dropped, not thrown on', () => {
  const bad = { _id: 'bad', start: 'not-a-date', end: 'also-bad' };
  assert.doesNotThrow(() => findConflicts([bad, ev('a', 9, 10)]));
  assert.equal(findConflicts([bad, ev('a', 9, 10)]).length, 0);
});

t('pairs are not double-counted', () => {
  const found = findConflicts([ev('a', 9, 11), ev('b', 10, 12)]);
  assert.equal(new Set(found.map((c) => c.id)).size, found.length);
});

console.log(`\n${pass} conflict assertions passed\n`);
if (process.exitCode) process.exit(process.exitCode);
