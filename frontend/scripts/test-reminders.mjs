/**
 * Reminder engine tests — run with:
 *   cd frontend && npx vite-node scripts/test-reminders.mjs
 *
 * Plain assertions, no test runner: this project has none configured and the
 * value here is catching date-math regressions, not tooling.
 */
import assert from 'node:assert/strict';
import {
  buildReminders,
  findEventConflicts,
  summariseReminders,
} from '../src/utils/reminders.js';

let passed = 0;
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ✗ ${name}\n    ${error.message}`);
    process.exitCode = 1;
  }
};

const NOW = new Date('2026-11-09T10:00:00.000Z');
const at = (iso) => new Date(iso);

console.log('\nReminder engine');

test('flags an overdue task as critical when high priority', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'Late thing', priority: 'high', dueDate: '2026-11-09T08:00:00.000Z' }],
  });
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, 'overdue');
  assert.equal(r[0].severity, 'critical');
  assert.match(r[0].message, /overdue/);
});

test('downgrades overdue severity for low priority', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'Late', priority: 'low', dueDate: '2026-11-09T08:00:00.000Z' }],
  });
  assert.equal(r[0].severity, 'high');
});

test('includes a task due inside the lookahead window', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'Soon', priority: 'medium', dueDate: '2026-11-09T12:00:00.000Z' }],
  });
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, 'due');
  assert.equal(r[0].minutesAway, 120);
});

test('excludes a task due beyond the lookahead window', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'Later', dueDate: '2026-12-01T12:00:00.000Z' }],
  });
  assert.equal(r.length, 0);
});

test('ignores completed tasks', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'Done', status: 'completed', dueDate: '2026-11-09T08:00:00.000Z' }],
  });
  assert.equal(r.length, 0);
});

test('surfaces undated high-priority tasks as stale', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [{ _id: 't1', title: 'No date', priority: 'high' }],
  });
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, 'stale');
});

test('does not flag undated low-priority tasks', () => {
  const r = buildReminders({ now: NOW, tasks: [{ _id: 't1', title: 'Someday', priority: 'low' }] });
  assert.equal(r.length, 0);
});

test('marks an event in progress rather than upcoming', () => {
  const r = buildReminders({
    now: NOW,
    events: [{ _id: 'e1', title: 'Standup', start: '2026-11-09T09:45:00.000Z', end: '2026-11-09T10:15:00.000Z' }],
  });
  assert.equal(r.length, 1);
  assert.equal(r[0].inProgress, true);
  assert.equal(r[0].message, 'happening now');
});

test('excludes events that already finished', () => {
  const r = buildReminders({
    now: NOW,
    events: [{ _id: 'e1', title: 'Old', start: '2026-11-09T07:00:00.000Z', end: '2026-11-09T08:00:00.000Z' }],
  });
  assert.equal(r.length, 0);
});

test('excludes cancelled events', () => {
  const r = buildReminders({
    now: NOW,
    events: [{ _id: 'e1', title: 'Cancelled', status: 'cancelled', start: '2026-11-09T11:00:00.000Z', end: '2026-11-09T12:00:00.000Z' }],
  });
  assert.equal(r.length, 0);
});

test('detects overlapping events and reports the overlap length', () => {
  const r = buildReminders({
    now: NOW,
    events: [
      { _id: 'a', title: 'Design review', start: '2026-11-09T11:00:00.000Z', end: '2026-11-09T12:00:00.000Z' },
      { _id: 'b', title: 'Client call', start: '2026-11-09T11:30:00.000Z', end: '2026-11-09T12:30:00.000Z' },
    ],
  });
  const conflict = r.find((x) => x.kind === 'conflict');
  assert.ok(conflict, 'conflict reminder missing');
  assert.equal(conflict.minutes, 30);
});

test('ignores duplicate records with the same title and start', () => {
  const conflicts = findEventConflicts([
    { _id: 'a', title: 'Same', start: '2026-11-09T11:00:00.000Z', end: '2026-11-09T12:00:00.000Z' },
    { _id: 'a', title: 'Same', start: '2026-11-09T11:00:00.000Z', end: '2026-11-09T12:00:00.000Z' },
  ]);
  assert.equal(conflicts.length, 0);
});

test('handles back-to-back events as non-conflicting', () => {
  const conflicts = findEventConflicts([
    { _id: 'a', title: 'A', start: '2026-11-09T11:00:00.000Z', end: '2026-11-09T12:00:00.000Z' },
    { _id: 'b', title: 'B', start: '2026-11-09T12:00:00.000Z', end: '2026-11-09T13:00:00.000Z' },
  ]);
  assert.equal(conflicts.length, 0);
});

test('detects a conflict against the longest open interval', () => {
  const conflicts = findEventConflicts([
    { _id: 'a', title: 'Long', start: '2026-11-09T09:00:00.000Z', end: '2026-11-09T15:00:00.000Z' },
    { _id: 'b', title: 'B', start: '2026-11-09T10:00:00.000Z', end: '2026-11-09T11:00:00.000Z' },
    { _id: 'c', title: 'C', start: '2026-11-09T11:30:00.000Z', end: '2026-11-09T12:00:00.000Z' },
  ]);
  // Both B and C overlap the long block.
  assert.equal(conflicts.length, 2);
});

test('sorts critical work ahead of medium', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [
      { _id: 'later', title: 'Due soon', priority: 'low', dueDate: '2026-11-09T18:00:00.000Z' },
      { _id: 'late', title: 'Late high', priority: 'high', dueDate: '2026-11-09T08:00:00.000Z' },
    ],
  });
  assert.equal(r[0].id, 'late');
});

test('tolerates malformed input without throwing', () => {
  const r = buildReminders({
    now: NOW,
    tasks: [null, {}, { _id: 'x', dueDate: 'not-a-date' }],
    events: [null, {}, { _id: 'y', start: 'nope', end: 'nope' }],
  });
  assert.ok(Array.isArray(r));
});

test('summarise counts by kind and urgency', () => {
  const summary = summariseReminders([
    { kind: 'overdue', severity: 'critical' },
    { kind: 'due', severity: 'medium' },
    { kind: 'upcoming', severity: 'high' },
  ]);
  assert.equal(summary.total, 3);
  assert.equal(summary.overdue, 1);
  assert.equal(summary.urgent, 2);
});

test('respects a custom lookahead window', () => {
  const tasks = [{ _id: 't', title: 'x', dueDate: '2026-11-11T10:00:00.000Z' }];
  assert.equal(buildReminders({ now: NOW, tasks, lookaheadHours: 24 }).length, 0);
  assert.equal(buildReminders({ now: NOW, tasks, lookaheadHours: 72 }).length, 1);
});

console.log(`\nReminder engine: ${passed} passed\n`);
