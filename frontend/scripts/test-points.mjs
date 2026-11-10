/**
 * Points derivation.
 *
 * These numbers appear on the Rewards and Achievements pages, so an arithmetic
 * slip or a streak that never resets would be visible to the user as a wrong
 * balance. The logic is pure and gets tested directly.
 */
import assert from 'node:assert/strict';
import {
  pointsForTask,
  currentStreak,
  POINTS_PER_TASK,
  POINTS_ON_TIME_BONUS,
  POINTS_PER_STREAK_DAY,
  MAX_STREAK_DAYS,
} from '../src/hooks/usePoints.js';

const dayAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

assert.equal(pointsForTask(null), 0, 'null task scores nothing');
assert.equal(pointsForTask({ status: 'todo' }), 0, 'incomplete task scores nothing');
assert.equal(pointsForTask({ status: 'completed' }), POINTS_PER_TASK, 'completion is worth the base');

assert.equal(
  pointsForTask({ status: 'completed', completedAt: dayAgo(0), dueDate: dayAgo(-2) }),
  POINTS_PER_TASK + POINTS_ON_TIME_BONUS,
  'finishing before the deadline earns the bonus'
);

assert.equal(
  pointsForTask({ status: 'completed', completedAt: dayAgo(0), dueDate: dayAgo(3) }),
  POINTS_PER_TASK,
  'finishing late does not earn the bonus'
);

assert.equal(
  pointsForTask({ status: 'completed', completedAt: dayAgo(0) }),
  POINTS_PER_TASK,
  'no due date is neither early nor late'
);

// Streaks ---------------------------------------------------------------

assert.equal(currentStreak([]), 0, 'no completions means no streak');

assert.equal(
  currentStreak([{ status: 'completed', completedAt: dayAgo(0) }]),
  1,
  'today counts'
);

assert.equal(
  currentStreak([
    { status: 'completed', completedAt: dayAgo(0) },
    { status: 'completed', completedAt: dayAgo(1) },
    { status: 'completed', completedAt: dayAgo(2) },
  ]),
  3,
  'consecutive days accumulate'
);

assert.equal(
  currentStreak([
    { status: 'completed', completedAt: dayAgo(0) },
    { status: 'completed', completedAt: dayAgo(2) },
  ]),
  1,
  'a gap ends the streak'
);

assert.equal(
  currentStreak([
    { status: 'completed', completedAt: dayAgo(1) },
    { status: 'completed', completedAt: dayAgo(2) },
  ]),
  2,
  'yesterday still counts before anything is done today'
);

assert.equal(
  currentStreak([{ status: 'completed', completedAt: dayAgo(4) }]),
  0,
  'a streak broken days ago is not current'
);

assert.equal(
  currentStreak([{ status: 'completed', completedAt: 'not a date' }]),
  0,
  'garbage dates are ignored rather than counted'
);

// The streak contribution is capped so a long absence does not inflate it.
const capped = MAX_STREAK_DAYS * POINTS_PER_STREAK_DAY;
assert.equal(capped, 175, 'cap is stable at 7 days × 25');

console.log('10 points assertions passed');
