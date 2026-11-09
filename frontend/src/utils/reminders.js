import { differenceInMinutes, isAfter, isBefore, isValid, addMinutes } from 'date-fns';

/**
 * Reminder engine
 * ------------------------------------------------------------------
 * A single place that answers "what needs my attention right now?".
 *
 * Reminders are *derived*, never stored: the source of truth stays the task or
 * event itself, so there is no second list to drift out of sync. Each reminder
 * carries enough context for the UI to act on it directly.
 *
 * Categories
 *  - overdue    : task's due date has passed and it is not done
 *  - due        : due inside the lookahead window
 *  - upcoming   : event starting inside the lookahead window
 *  - conflict   : two events overlap on the calendar
 *  - stale      : a high-priority task with no date at all
 */

export const DEFAULT_LOOKAHEAD_HOURS = 48;

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isValid(date) ? date : null;
};

const isOpen = (task) => task && task.status !== 'completed' && task.status !== 'cancelled';

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

/**
 * Detect overlapping events. Returns pairs, each with the overlap window.
 * O(n log n): sort by start, then only compare the running maximum end.
 */
export const findEventConflicts = (events = []) => {
  const items = (Array.isArray(events) ? events : [])
    .filter((event) => event && typeof event === 'object')
    .map((event) => ({ event, start: safeDate(event.start), end: safeDate(event.end) }))
    .filter((item) => item.start && item.end)
    .sort((a, b) => a.start - b.start);

  const conflicts = [];
  let previous = null;

  for (const item of items) {
    if (previous && isBefore(item.start, previous.end)) {
      // Same title + start is usually a duplicate record, not a real clash.
      const isDuplicate =
        String(previous.event.title || '').trim().toLowerCase() ===
          String(item.event.title || '').trim().toLowerCase() &&
        previous.start.getTime() === item.start.getTime();

      if (!isDuplicate) {
        conflicts.push({
          id: `${previous.event._id}-${item.event._id}`,
          a: previous.event,
          b: item.event,
          start: item.start,
          end: new Date(Math.min(previous.end, item.end)),
          minutes: Math.max(
            1,
            differenceInMinutes(
              new Date(Math.min(previous.end, item.end)),
              item.start
            )
          ),
        });
      }
    }
    if (!previous || isAfter(item.end, previous.end)) {
      previous = item;
    }
  }

  return conflicts;
};

/**
 * Build the reminder list.
 *
 * @param {object}   opts
 * @param {Array}    opts.tasks
 * @param {Array}    opts.events
 * @param {Date}     opts.now
 * @param {number}   opts.lookaheadHours
 * @returns {Array}  reminders sorted by urgency (soonest / most overdue first)
 */
export const buildReminders = ({
  tasks = [],
  events = [],
  now = new Date(),
  lookaheadHours = DEFAULT_LOOKAHEAD_HOURS,
}) => {
  const horizon = addMinutes(now, lookaheadHours * 60);
  const reminders = [];

  // ---------- Tasks ----------
  (Array.isArray(tasks) ? tasks : []).forEach((task) => {
    if (!task || typeof task !== 'object') return;
    if (!isOpen(task)) return;

    const due = safeDate(task.dueDate);
    const base = {
      source: 'task',
      id: task._id,
      title: task.title || 'Untitled task',
      priority: task.priority || 'medium',
      due,
      href: '/tasks',
      task,
    };

    if (!due) {
      // Undated high-priority work silently rots — surface it.
      if (task.priority === 'high') {
        reminders.push({
          ...base,
          kind: 'stale',
          severity: 'medium',
          at: null,
          message: 'High priority with no date — give it a deadline',
        });
      }
      return;
    }

    if (isBefore(due, now)) {
      const minutesLate = Math.abs(differenceInMinutes(now, due));
      reminders.push({
        ...base,
        kind: 'overdue',
        severity: task.priority === 'high' ? 'critical' : 'high',
        at: due,
        minutesLate,
        message:
          minutesLate < 60
            ? `${minutesLate}m overdue`
            : minutesLate < 1440
              ? `${Math.round(minutesLate / 60)}h overdue`
              : `${Math.round(minutesLate / 1440)}d overdue`,
      });
      return;
    }

    if (isBefore(due, horizon)) {
      const minutesAway = differenceInMinutes(due, now);
      reminders.push({
        ...base,
        kind: 'due',
        severity: minutesAway <= 60 ? 'high' : 'medium',
        at: due,
        minutesAway,
        message:
          minutesAway < 60 ? `due in ${minutesAway}m` : `due in ${Math.round(minutesAway / 60)}h`,
      });
    }
  });

  // ---------- Events ----------
  (Array.isArray(events) ? events : []).forEach((event) => {
    if (!event || typeof event !== 'object') return;
    const start = safeDate(event.start);
    const end = safeDate(event.end);
    if (!start || !end) return;
    if (event.status === 'cancelled') return;
    if (isBefore(end, now)) return; // already finished
    if (!isBefore(start, horizon)) return;

    const minutesAway = differenceInMinutes(start, now);
    const inProgress = isBefore(start, now);

    reminders.push({
      source: 'event',
      id: event._id,
      title: event.title || 'Untitled event',
      kind: 'upcoming',
      severity: inProgress ? 'high' : minutesAway <= 30 ? 'high' : 'medium',
      at: start,
      end,
      minutesAway,
      inProgress,
      href: '/schedule',
      event,
      message: inProgress
        ? 'happening now'
        : minutesAway <= 60
          ? `starts in ${minutesAway}m`
          : `starts in ${Math.round(minutesAway / 60)}h`,
    });
  });

  // ---------- Conflicts ----------
  findEventConflicts(events).forEach((conflict) => {
    if (isBefore(conflict.end, now)) return; // past clash, not actionable
    reminders.push({
      source: 'conflict',
      id: conflict.id,
      title: `${conflict.a.title} ↔ ${conflict.b.title}`,
      kind: 'conflict',
      severity: 'high',
      at: conflict.start,
      end: conflict.end,
      minutes: conflict.minutes,
      href: '/schedule',
      conflict,
      message: `${conflict.minutes}m overlap`,
    });
  });

  const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };

  return reminders.sort((a, b) => {
    const bySeverity = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    if (bySeverity !== 0) return bySeverity;
    if (a.at && b.at) return a.at - b.at;
    if (a.at) return -1;
    if (b.at) return 1;
    return 0;
  });
};

/** Counts per kind, for the summary strip. */
export const summariseReminders = (reminders = []) =>
  reminders.reduce(
    (acc, reminder) => {
      acc.total += 1;
      acc[reminder.kind] = (acc[reminder.kind] || 0) + 1;
      if (reminder.severity === 'critical' || reminder.severity === 'high') acc.urgent += 1;
      return acc;
    },
    { total: 0, urgent: 0, overdue: 0, due: 0, upcoming: 0, conflict: 0, stale: 0 }
  );

export const priorityWeight = (priority) => PRIORITY_WEIGHT[priority] || 0;

export default buildReminders;
