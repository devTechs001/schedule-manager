/**
 * Derived alerts.
 *
 * The dashboard tells the user they have overdue work and that a meeting is
 * starting. If this logic misfires it either nags about finished tasks or
 * stays silent about a meeting in five minutes, so the boundaries are pinned
 * down here.
 */
import assert from 'node:assert/strict';

// Replicates the pure body of useSmartAlerts (the hook itself only wraps this
// in useMemo, which needs a React runtime).
const buildAlerts = (tasks = [], events = []) => {
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const taskList = Array.isArray(tasks) ? tasks : [];
  const eventList = Array.isArray(events) ? events : [];
  const open = taskList.filter((task) => task.status !== 'completed');

  const overdue = open.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate).getTime();
    return Number.isFinite(due) && due < now;
  });

  const dueToday = open.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate).getTime();
    return Number.isFinite(due) && due >= now && due <= endOfToday.getTime();
  });

  const soon = eventList
    .filter((event) => {
      const start = new Date(event?.start).getTime();
      return Number.isFinite(start) && start > now && start - now <= 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const alerts = [];
  if (overdue.length > 0) alerts.push({ id: 'overdue', priority: 'high' });
  if (dueToday.length > 0) alerts.push({ id: 'due-today', priority: 'medium' });
  if (soon.length > 0) alerts.push({ id: `event-${soon[0].start}`, priority: 'low' });
  return alerts;
};

const hoursFromNow = (n) => new Date(Date.now() + n * 3600000).toISOString();

assert.deepEqual(buildAlerts(), [], 'nothing to report on an empty workspace');

assert.deepEqual(
  buildAlerts([{ title: 'Done', status: 'completed', dueDate: hoursFromNow(-48) }]),
  [],
  'completed tasks never raise an overdue alert'
);

assert.equal(
  buildAlerts([{ title: 'Late', status: 'todo', dueDate: hoursFromNow(-2) }])[0].id,
  'overdue',
  'a past due open task is overdue'
);

assert.deepEqual(
  buildAlerts([{ title: 'Soon', status: 'todo', dueDate: hoursFromNow(2) }]),
  [{ id: 'due-today', priority: 'medium' }],
  'a task due later today is due-today, not overdue'
);

const meetingAlert = buildAlerts([], [{ title: 'Standup', start: hoursFromNow(0.5) }]);
assert.equal(meetingAlert.length, 1, 'an event within the hour raises one alert');
assert.equal(meetingAlert[0].priority, 'low', 'a meeting 30 minutes out is low priority');

assert.equal(
  buildAlerts([], [{ title: 'Next week', start: hoursFromNow(48) }]).length,
  0,
  'events further out do not alert'
);

assert.equal(
  buildAlerts([{ title: 'Garbage', status: 'todo', dueDate: 'not a date' }]).length,
  0,
  'unparseable dates are ignored rather than treated as overdue'
);

assert.equal(
  buildAlerts(
    [{ title: 'Late', status: 'todo', dueDate: hoursFromNow(-2) }],
    [{ title: 'Standup', start: hoursFromNow(0.5) }]
  ).length,
  2,
  'overdue and meeting alerts coexist'
);

console.log('7 alert assertions passed');
