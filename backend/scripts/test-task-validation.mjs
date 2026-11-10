/**
 * Task payload validation.
 *
 * PUT /api/tasks/:id used to run the same validator as POST, which requires a
 * `title`. But an update is a partial patch, and the app legitimately sends:
 *
 *   dragging a card on the board  → { status, completedAt }
 *   scheduling a task in Planner  → { dueDate }
 *   snoozing an overdue reminder  → { dueDate }
 *
 * All three were rejected with "Task title is required" — a 400 the UI mostly
 * hid, because the localStorage fallback took over when the API failed. The
 * feature looked fine offline and broken against a real server.
 *
 * These tests run the real express-validator chains, so they fail if the rules
 * drift back into requiring the title on update.
 *
 * Run: node --test scripts/test-task-validation.mjs
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validationResult } from 'express-validator';
import {
  validateTask,
  validateTaskUpdate,
  validateEvent,
  validateEventUpdate,
} from '../src/middleware/validation.js';

const errorsFor = async (chain, body) => {
  const req = { body };
  for (const rule of chain) {
    if (rule && typeof rule.run === 'function') await rule.run(req);
  }
  return validationResult(req).array();
};

// ---- partial updates (the regression) -------------------------------------

test('a status-only patch is accepted', async () => {
  const errors = await errorsFor(validateTaskUpdate, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
  assert.equal(errors.length, 0, JSON.stringify(errors.map((e) => e.msg)));
});

test('a dueDate-only patch is accepted', async () => {
  const errors = await errorsFor(validateTaskUpdate, { dueDate: new Date().toISOString() });
  assert.equal(errors.length, 0, JSON.stringify(errors.map((e) => e.msg)));
});

test('clearing dueDate with null is accepted', async () => {
  const errors = await errorsFor(validateTaskUpdate, { dueDate: null });
  assert.equal(errors.length, 0, JSON.stringify(errors.map((e) => e.msg)));
});

test('a full patch is still accepted', async () => {
  const errors = await errorsFor(validateTaskUpdate, {
    title: 'Ship the release',
    status: 'in-progress',
    priority: 'high',
  });
  assert.equal(errors.length, 0);
});

// ---- updates still reject bad values --------------------------------------

test('an invalid status is rejected on update', async () => {
  const errors = await errorsFor(validateTaskUpdate, { status: 'nonsense' });
  assert.ok(errors.length > 0, 'bad status should not validate');
  assert.match(errors.map((e) => e.msg).join(' '), /Invalid status/);
});

test('an invalid priority is rejected on update', async () => {
  const errors = await errorsFor(validateTaskUpdate, { priority: 'urgent' });
  assert.ok(errors.length > 0, 'bad priority should not validate');
});

test('a non-date dueDate is rejected on update', async () => {
  const errors = await errorsFor(validateTaskUpdate, { dueDate: 'next tuesday' });
  assert.ok(errors.length > 0, 'bad date should not validate');
});

test('a too-short title is rejected on update', async () => {
  const errors = await errorsFor(validateTaskUpdate, { title: 'ab' });
  assert.ok(errors.length > 0, 'short title should not validate');
});

test('an explicitly empty title is rejected on update', async () => {
  const errors = await errorsFor(validateTaskUpdate, { title: '   ' });
  assert.ok(errors.length > 0, 'blank title should not validate');
});

// ---- create is unchanged --------------------------------------------------

test('create still requires a title', async () => {
  const errors = await errorsFor(validateTask, { dueDate: new Date().toISOString() });
  assert.ok(errors.length > 0, 'create without a title must fail');
  assert.match(errors.map((e) => e.msg).join(' '), /Task title is required/);
});

test('create accepts a valid task', async () => {
  const errors = await errorsFor(validateTask, { title: 'Write the report' });
  assert.equal(errors.length, 0);
});

test('create rejects a one-character title', async () => {
  const errors = await errorsFor(validateTask, { title: 'a' });
  assert.ok(errors.length > 0);
});

// ---- events: the same partial-update defect -------------------------------

test('dragging an event to { start, end } is accepted', async () => {
  const errors = await errorsFor(validateEventUpdate, {
    start: '2026-11-10T09:00:00.000Z',
    end: '2026-11-10T10:00:00.000Z',
  });
  assert.equal(errors.length, 0, JSON.stringify(errors.map((e) => e.msg)));
});

test('renaming an event without touching its times is accepted', async () => {
  const errors = await errorsFor(validateEventUpdate, { title: 'Standup' });
  assert.equal(errors.length, 0, JSON.stringify(errors.map((e) => e.msg)));
});

test('an event that ends before it starts is still rejected on update', async () => {
  const errors = await errorsFor(validateEventUpdate, {
    start: '2026-11-10T10:00:00.000Z',
    end: '2026-11-10T09:00:00.000Z',
  });
  assert.ok(errors.length > 0);
  assert.match(errors.map((e) => e.msg).join(' '), /End date must be after start date/);
});

test('an invalid date is still rejected on update', async () => {
  const errors = await errorsFor(validateEventUpdate, { start: 'next tuesday' });
  assert.ok(errors.length > 0);
});

test('create still requires an event title', async () => {
  const errors = await errorsFor(validateEvent, {
    start: '2026-11-10T09:00:00.000Z',
    end: '2026-11-10T10:00:00.000Z',
  });
  assert.ok(errors.length > 0);
  assert.match(errors.map((e) => e.msg).join(' '), /Event title is required/);
});

test('create accepts a complete event', async () => {
  const errors = await errorsFor(validateEvent, {
    title: 'Standup',
    start: '2026-11-10T09:00:00.000Z',
    end: '2026-11-10T10:00:00.000Z',
  });
  assert.equal(errors.length, 0);
});
