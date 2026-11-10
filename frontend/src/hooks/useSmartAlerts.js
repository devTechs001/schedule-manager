import { useMemo } from 'react';

/**
 * Alerts derived from the user's own tasks and events.
 *
 * There is no alerting backend, so rather than invent notifications this
 * computes the few things that are genuinely knowable from local data:
 * overdue work, tasks due today, and the next event starting soon.
 *
 * Each alert matches the shape SmartAlerts renders:
 *   { id, type, priority, title, message, suggestion }
 */
export const useSmartAlerts = (tasks = [], events = []) => {
  return useMemo(() => {
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

    if (overdue.length > 0) {
      alerts.push({
        id: 'overdue',
        type: 'deadline',
        priority: 'high',
        title: `${overdue.length} overdue ${overdue.length === 1 ? 'task' : 'tasks'}`,
        message: overdue
          .slice(0, 3)
          .map((task) => task.title || 'Untitled task')
          .join(', '),
        suggestion:
          overdue.length > 1
            ? 'Reschedule them or close out anything already done.'
            : 'Reschedule it, or mark it complete if it is already done.',
      });
    }

    if (dueToday.length > 0) {
      alerts.push({
        id: 'due-today',
        type: 'deadline',
        priority: 'medium',
        title: `${dueToday.length} due today`,
        message: dueToday
          .slice(0, 3)
          .map((task) => task.title || 'Untitled task')
          .join(', '),
        suggestion: 'Block time for these before the day fills up.',
      });
    }

    if (soon.length > 0) {
      const next = soon[0];
      const minutes = Math.max(1, Math.round((new Date(next.start).getTime() - now) / 60000));
      alerts.push({
        id: `event-${next._id || next.id || next.start}`,
        type: 'meeting',
        priority: minutes <= 15 ? 'high' : 'low',
        title: next.title || 'Event starting soon',
        message: `Starts in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
        suggestion: 'Wrap up what you are doing and get ready to join.',
      });
    }

    return alerts;
  }, [tasks, events]);
};

export default useSmartAlerts;
