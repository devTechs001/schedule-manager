import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FaBell,
  FaCalendarAlt,
  FaCalendarDay,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaExclamationTriangle,
  FaPlus,
  FaRegClock,
  FaSyncAlt,
  FaTasks,
  FaTimes,
  FaTrash,
  FaUndoAlt,
  FaBolt,
  FaFilter,
} from 'react-icons/fa';
import {
  format,
  addDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
  isAfter,
  isBefore,
  differenceInMinutes,
  isValid,
} from 'date-fns';

import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import { useAppointments, REMINDER_PRESETS, REPEAT_OPTIONS } from '@hooks/useAppointments';
import { buildReminders, summariseReminders } from '@utils/reminders';

import Card from '@components/ui/Card';
import StatCard from '@components/ui/StatCard';
import Badge from '@components/ui/Badge';
import Modal from '@components/ui/Modal';
import EmptyState from '@components/ui/EmptyState';
import { Field, Select, Textarea } from '@components/ui/Field';
import TaskForm from '@components/tasks/TaskForm';
import LocationReminders from '@components/notification/LocationReminders';
import EventForm from '@components/schedule/EventForm';

/* ------------------------------------------------------------------ *
 * Presentation helpers
 * ------------------------------------------------------------------ */

const SEVERITY_STYLES = {
  critical: { tone: 'badge-danger', dot: 'bg-rose-500', ring: 'ring-rose-500/20' },
  high: { tone: 'badge-danger', dot: 'bg-rose-500', ring: 'ring-rose-500/20' },
  medium: { tone: 'badge-warning', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
  low: { tone: 'badge-neutral', dot: 'bg-gray-400', ring: 'ring-gray-400/20' },
};

const KIND_META = {
  overdue: { label: 'Overdue', icon: FaExclamationTriangle },
  due: { label: 'Due soon', icon: FaClock },
  upcoming: { label: 'Starting', icon: FaCalendarAlt },
  conflict: { label: 'Conflict', icon: FaBolt },
  stale: { label: 'No date', icon: FaRegClock },
};

const safe = (value) => {
  const date = new Date(value);
  return isValid(date) ? date : null;
};

const relativeLabel = (date, now) => {
  if (!date) return '';
  const minutes = differenceInMinutes(date, now);
  const abs = Math.abs(minutes);
  if (abs < 1) return 'now';
  if (abs < 60) return minutes > 0 ? `in ${abs}m` : `${abs}m ago`;
  if (abs < 1440) {
    const hours = Math.round(abs / 60);
    return minutes > 0 ? `in ${hours}h` : `${hours}h ago`;
  }
  const days = Math.round(abs / 1440);
  return minutes > 0 ? `in ${days}d` : `${days}d ago`;
};

/* ------------------------------------------------------------------ *
 * Reminder form
 * ------------------------------------------------------------------ */

const ReminderForm = ({ reminder, onSubmit, onCancel }) => {
  const toLocalInput = (value) => {
    const date = safe(value) || new Date(Date.now() + 3600000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [form, setForm] = useState({
    title: reminder?.title || '',
    at: toLocalInput(reminder?.at),
    notes: reminder?.notes || '',
    notifyMinutesBefore: reminder?.notifyMinutesBefore ?? 10,
    repeat: reminder?.repeat || 'none',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key) => (event) => {
    const value = event?.target ? event.target.value : event;
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give the reminder a title so you know what it is for.');
      return;
    }
    const at = new Date(form.at);
    if (Number.isNaN(at.getTime())) {
      setError('Pick a valid date and time.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ ...form, title: form.title.trim(), at: at.toISOString() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="What is it for?" error={error} htmlFor="reminder-title" required>
        <input
          id="reminder-title"
          value={form.title}
          onChange={update('title')}
          placeholder="Call Amara about the proposal"
          className={`input ${error ? 'input-error' : ''}`}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="When" htmlFor="reminder-at" required>
          <input
            id="reminder-at"
            type="datetime-local"
            value={form.at}
            onChange={update('at')}
            className="input"
          />
        </Field>

        <Field label="Notify me" htmlFor="reminder-notify">
          <Select
            id="reminder-notify"
            value={form.notifyMinutesBefore}
            onChange={(event) => update('notifyMinutesBefore')(Number(event.target.value))}
          >
            {REMINDER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.minutes}>
                {preset.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Repeat" htmlFor="reminder-repeat">
        <Select id="reminder-repeat" value={form.repeat} onChange={update('repeat')}>
          {REPEAT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notes" hint="Optional context you will want when it fires." htmlFor="reminder-notes">
        <Textarea
          id="reminder-notes"
          rows={3}
          value={form.notes}
          onChange={update('notes')}
          placeholder="Anything to remember…"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Saving…' : reminder ? 'Save changes' : 'Set reminder'}
        </button>
      </div>
    </form>
  );
};

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */

const ActivityHub = () => {
  const { tasks, loading: tasksLoading, createTask, updateTask, toggleTask } = useTasks();
  const { events, loading: eventsLoading, createEvent, updateEvent } = useSchedule();
  const {
    active: activeReminders,
    loading: remindersLoading,
    createAppointment,
    updateAppointment,
    removeAppointment,
    completeAppointment,
    snoozeAppointment,
  } = useAppointments();

  const [now, setNow] = useState(new Date());
  const [kindFilter, setKindFilter] = useState('all');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  // Keep "time until" labels honest without re-rendering on every tick.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = 'Activity hub — SchedAI';
  }, []);

  const reminders = useMemo(
    () => buildReminders({ tasks, events, now, lookaheadHours: 48 }),
    [tasks, events, now]
  );

  const visibleReminders = useMemo(
    () =>
      reminders.filter(
        (reminder) =>
          !dismissed.includes(reminder.id) && (kindFilter === 'all' || reminder.kind === kindFilter)
      ),
    [reminders, kindFilter, dismissed]
  );

  const summary = useMemo(() => summariseReminders(reminders), [reminders]);

  /* ---------------- Today's shape ---------------- */

  const today = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    const live = list
      .map((event) => ({ event, start: safe(event.start), end: safe(event.end) }))
      .filter((item) => item.start && item.end && isSameDay(item.start, now))
      .sort((a, b) => a.start - b.start);

    const totalMinutes = live.reduce(
      (sum, item) => sum + Math.max(0, differenceInMinutes(item.end, item.start)),
      0
    );

    const tasksDue = (Array.isArray(tasks) ? tasks : []).filter((task) => {
      if (task.status === 'completed') return false;
      const due = safe(task.dueDate);
      return due && isSameDay(due, now);
    });

    // Working window 08:00–20:00 for the utilisation read-out.
    const dayStart = new Date(now);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(20, 0, 0, 0);
    const windowMinutes = Math.max(1, differenceInMinutes(dayEnd, dayStart));

    return {
      events: live,
      totalMinutes,
      utilisation: Math.min(100, Math.round((totalMinutes / windowMinutes) * 100)),
      tasksDue,
      next: live.find((item) => isAfter(item.end, now)) || null,
    };
  }, [events, tasks, now]);

  /* ---------------- 7-day outlook ---------------- */

  const outlook = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => addDays(startOfDay(now), index));
    const list = Array.isArray(events) ? events : [];
    const taskList = Array.isArray(tasks) ? tasks : [];

    return days.map((day) => {
      const dayEvents = list.filter((event) => {
        const start = safe(event.start);
        return start && isWithinInterval(start, { start: startOfDay(day), end: endOfDay(day) });
      });
      const dayTasks = taskList.filter((task) => {
        if (task.status === 'completed') return false;
        const due = safe(task.dueDate);
        return due && isSameDay(due, day);
      });
      return {
        day,
        events: dayEvents.length,
        tasks: dayTasks.length,
        load: dayEvents.length + dayTasks.length,
        isToday: isSameDay(day, now),
      };
    });
  }, [events, tasks, now]);

  const peakLoad = Math.max(1, ...outlook.map((entry) => entry.load));

  /* ---------------- Actions ---------------- */

  const handleCreateReminder = async (data) => {
    await createAppointment(data);
    setShowReminderForm(false);
  };

  const handleUpdateReminder = async (data) => {
    updateAppointment(editingReminder._id, data);
    setEditingReminder(null);
    setShowReminderForm(false);
  };

  const handleCreateTask = async (data) => {
    await createTask(data);
    setShowTaskForm(false);
  };

  const handleCreateEvent = async (data) => {
    await createEvent(data);
    setShowEventForm(false);
  };

  const handleRescheduleConflict = async (reminder) => {
    // Nudge the shorter event to start when the longer one ends.
    const { a, b, end } = reminder.conflict;
    const aStart = safe(a.start);
    const bStart = safe(b.start);
    const aEnd = safe(a.end);
    const bEnd = safe(b.end);
    const aLen = differenceInMinutes(aEnd, aStart);
    const bLen = differenceInMinutes(bEnd, bStart);
    const target = aLen <= bLen ? a : b;
    const duration = Math.min(aLen, bLen);
    const newEnd = new Date(end.getTime() + duration * 60000);

    await updateEvent(target._id, {
      start: end.toISOString(),
      end: newEnd.toISOString(),
    });
    setDismissed((prev) => [...prev, reminder.id]);
  };

  const loading = tasksLoading || eventsLoading || remindersLoading;

  const filters = [
    { id: 'all', label: 'All', count: reminders.length },
    { id: 'overdue', label: 'Overdue', count: summary.overdue },
    { id: 'due', label: 'Due', count: summary.due },
    { id: 'upcoming', label: 'Starting', count: summary.upcoming },
    { id: 'conflict', label: 'Conflicts', count: summary.conflict },
  ].filter((filter) => filter.id === 'all' || filter.count > 0);

  return (
    <div className="space-y-5">
      {/* ============ HEADER ============ */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity hub</h1>
          <p className="page-subtitle">
            {summary.total === 0
              ? 'Nothing needs you right now.'
              : `${summary.urgent} urgent · ${summary.total} total across the next 48 hours`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowReminderForm(true)} className="btn btn-primary btn-sm">
            <FaBell size={10} /> New reminder
          </button>
          <button type="button" onClick={() => setShowEventForm(true)} className="btn btn-outline btn-sm">
            <FaCalendarAlt size={10} /> Block time
          </button>
          <button type="button" onClick={() => setShowTaskForm(true)} className="btn btn-outline btn-sm">
            <FaPlus size={10} /> Task
          </button>
        </div>
      </div>

      {/* ============ STATS ============ */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Needs attention"
          value={summary.urgent}
          hint="overdue, starting or clashing"
          icon={<FaBell size={13} />}
          tone="rose"
        />
        <StatCard
          label="Scheduled today"
          value={`${Math.floor(today.totalMinutes / 60)}h ${today.totalMinutes % 60}m`}
          hint={`${today.events.length} blocks · ${today.utilisation}% of the workday`}
          icon={<FaCalendarDay size={13} />}
          tone="accent"
        />
        <StatCard
          label="Tasks due today"
          value={today.tasksDue.length}
          hint={today.tasksDue.length === 0 ? 'clear' : 'finish before the day ends'}
          icon={<FaTasks size={13} />}
          tone="amber"
        />
        <StatCard
          label="Reminders set"
          value={activeReminders.length}
          hint="standing reminders"
          icon={<FaRegClock size={13} />}
          tone="violet"
        />
      </div>

      {/* ============ NEXT UP ============ */}
      {today.next && (
        <div className="card flex flex-wrap items-center gap-3 border-l-4 border-l-primary-500 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
            <FaChevronRight size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">
              Next up
            </p>
            <p className="truncate text-sm font-semibold text-content">{today.next.event.title}</p>
            <p className="text-xs text-content-muted">
              {format(today.next.start, 'h:mm a')} – {format(today.next.end, 'h:mm a')}
              {today.next.event.location ? ` · ${today.next.event.location}` : ''}
            </p>
          </div>
          <Badge variant="accent">{relativeLabel(today.next.start, now)}</Badge>
          <Link to="/schedule" className="btn btn-ghost btn-sm">
            Open calendar
          </Link>
        </div>
      )}

      {/* ============ MAIN GRID ============ */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* ---------------- Reminder inbox ---------------- */}
        <Card
          title="Needs your attention"
          subtitle="Live, derived from your tasks and calendar"
          bodyClassName="p-0"
          action={
            <button
              type="button"
              onClick={() => setDismissed([])}
              className="btn btn-ghost btn-sm"
              disabled={dismissed.length === 0}
              title="Bring back dismissed items"
            >
              <FaUndoAlt size={9} /> Restore
            </button>
          }
        >
          <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2.5">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setKindFilter(filter.id)}
                className={`chip ${kindFilter === filter.id ? 'chip-active' : ''}`}
              >
                {filter.label}
                <span className="ml-1 opacity-60">{filter.count}</span>
              </button>
            ))}
          </div>

          {loading && reminders.length === 0 && (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-sunken" />
              ))}
            </div>
          )}

          {!loading && visibleReminders.length === 0 && (
            <EmptyState
              compact
              icon={<FaCheckCircle />}
              title={dismissed.length > 0 ? 'All handled' : 'Nothing needs you'}
              description={
                dismissed.length > 0
                  ? 'You cleared the list. Restore puts it back.'
                  : 'No overdue work, nothing starting soon and no clashes. Enjoy the quiet.'
              }
            />
          )}

          {visibleReminders.length > 0 && (
            <ul className="divide-y divide-line">
              {visibleReminders.map((reminder) => {
                const meta = KIND_META[reminder.kind] || KIND_META.due;
                const styles = SEVERITY_STYLES[reminder.severity] || SEVERITY_STYLES.medium;
                return (
                  <li
                    key={`${reminder.source}-${reminder.id}-${reminder.kind}`}
                    className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-sunken ring-1 ${styles.ring} ${reminder.severity === 'critical' || reminder.severity === 'high' ? 'text-rose-500' : 'text-amber-500'}`}
                    >
                      <meta.icon size={11} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-medium text-content">{reminder.title}</p>
                        <span className={styles.tone}>{meta.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-content-muted">
                        {reminder.message}
                        {reminder.at ? ` · ${format(reminder.at, 'EEE h:mm a')}` : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {reminder.kind === 'conflict' && (
                        <button
                          type="button"
                          onClick={() => handleRescheduleConflict(reminder)}
                          className="btn btn-ghost btn-sm"
                          title="Move the shorter event to after the overlap"
                        >
                          Fix
                        </button>
                      )}
                      {(reminder.kind === 'overdue' || reminder.kind === 'due') && (
                        <button
                          type="button"
                          onClick={() => toggleTask(reminder.task._id)}
                          className="btn btn-ghost btn-sm"
                          title="Mark done"
                        >
                          <FaCheck size={9} />
                        </button>
                      )}
                      {reminder.kind === 'overdue' && (
                        <button
                          type="button"
                          onClick={() =>
                            updateTask(reminder.task._id, {
                              dueDate: addDays(now, 1).toISOString(),
                            })
                          }
                          className="btn btn-ghost btn-sm"
                          title="Push to tomorrow"
                        >
                          <FaSyncAlt size={9} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDismissed((prev) => [...prev, reminder.id])}
                        className="btn btn-ghost btn-sm"
                        title="Dismiss"
                        aria-label={`Dismiss ${reminder.title}`}
                      >
                        <FaTimes size={9} />
                      </button>
                      <Link to={reminder.href} className="btn btn-ghost btn-sm" title="Open">
                        <FaChevronRight size={9} />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* ---------------- 7-day outlook ---------------- */}
        <Card
          title="Next 7 days"
          subtitle="Load per day — events and due tasks"
          action={
            <Link to="/planner" className="btn btn-ghost btn-sm">
              Plan <FaChevronRight size={8} />
            </Link>
          }
        >
          <ul className="space-y-2">
            {outlook.map((entry) => (
              <li key={entry.day.toISOString()} className="flex items-center gap-3">
                <span
                  className={`w-16 shrink-0 text-xs ${entry.isToday ? 'font-semibold text-primary-600' : 'text-content-muted'}`}
                >
                  {entry.isToday ? 'Today' : format(entry.day, 'EEE d')}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className={`h-full rounded-full ${entry.isToday ? 'bg-accent-gradient' : 'bg-primary-400/70'}`}
                    style={{ width: `${(entry.load / peakLoad) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[0.68rem] text-content-subtle">
                  {entry.events}e · {entry.tasks}t
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-center">
            <div>
              <p className="text-sm font-semibold text-content">
                {outlook.reduce((sum, entry) => sum + entry.events, 0)}
              </p>
              <p className="text-[0.65rem] text-content-subtle">events ahead</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-content">
                {outlook.reduce((sum, entry) => sum + entry.tasks, 0)}
              </p>
              <p className="text-[0.65rem] text-content-subtle">tasks due</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ============ STANDING REMINDERS ============ */}
      <Card
        title="Standing reminders"
        subtitle="One-off and repeating alerts you have set"
        bodyClassName="p-0"
        action={
          <button type="button" onClick={() => setShowReminderForm(true)} className="btn btn-ghost btn-sm">
            <FaPlus size={9} /> Add
          </button>
        }
      >
        {activeReminders.length === 0 ? (
          <EmptyState
            compact
            icon={<FaBell />}
            title="No reminders yet"
            description="Set one for anything with a moment attached: a call, a renewal, a follow-up."
            action={
              <button type="button" onClick={() => setShowReminderForm(true)} className="btn btn-primary btn-sm mt-1">
                <FaPlus size={9} /> New reminder
              </button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {[...activeReminders]
              .sort((a, b) => new Date(a.at) - new Date(b.at))
              .map((reminder) => {
                const at = safe(reminder.at);
                const isPast = at && isBefore(at, now);
                return (
                  <li
                    key={reminder._id}
                    className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken"
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isPast ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/15' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'}`}
                    >
                      <FaBell size={10} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-content">{reminder.title}</p>
                      <p className="mt-0.5 text-xs text-content-muted">
                        {at ? format(at, 'EEE d MMM · h:mm a') : 'No date'} ·{' '}
                        {relativeLabel(at, now)}
                        {reminder.repeat !== 'none' && (
                          <>
                            {' · '}
                            <span className="capitalize">{reminder.repeat}</span>
                          </>
                        )}
                      </p>
                      {reminder.notes && (
                        <p className="mt-1 line-clamp-2 text-xs text-content-subtle">{reminder.notes}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => completeAppointment(reminder._id)}
                        className="btn btn-ghost btn-sm"
                        title={reminder.repeat === 'none' ? 'Mark done' : 'Done — schedule the next one'}
                      >
                        <FaCheck size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => snoozeAppointment(reminder._id, 15)}
                        className="btn btn-ghost btn-sm"
                        title="Snooze 15 minutes"
                      >
                        <FaRegClock size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReminder(reminder);
                          setShowReminderForm(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                      >
                        <FaFilter size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAppointment(reminder._id)}
                        className="btn btn-ghost btn-sm text-rose-500"
                        title="Delete"
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Card>

      {/* ============ LOCATION REMINDERS ============ */}
      {/*
        * Distinct from the time-based reminders above: these fire on arriving
        * at or leaving a place. They are stored locally, and the component
        * says so rather than implying background tracking.
        */}
      <LocationReminders
        reminders={[]}
        locations={[]}
        onCreate={(reminder) => toast.success(`Reminder set for ${reminder.location}`)}
        onDelete={() => toast.success('Location reminder removed')}
      />

      {/* ============ TODAY'S TIMELINE ============ */}
      <Card
        title="Today at a glance"
        subtitle="Everything scheduled for the rest of the day"
        action={
          <Link to="/schedule" className="btn btn-ghost btn-sm">
            Calendar <FaChevronRight size={8} />
          </Link>
        }
      >
        {today.events.length === 0 ? (
          <EmptyState
            compact
            icon={<FaCalendarDay />}
            title="Nothing on the calendar today"
            description="A clear day is an opportunity — block some deep work."
            action={
              <button type="button" onClick={() => setShowEventForm(true)} className="btn btn-outline btn-sm mt-1">
                <FaPlus size={9} /> Block time
              </button>
            }
          />
        ) : (
          <ol className="relative space-y-3 border-l border-line pl-4">
            {today.events.map(({ event, start, end }) => {
              const live = isBefore(start, now) && isAfter(end, now);
              const past = isBefore(end, now);
              return (
                <li key={event._id} className={past ? 'opacity-55' : ''}>
                  <span
                    className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${live ? 'bg-emerald-500' : past ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500'}`}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-content">{event.title}</p>
                    {live && <Badge variant="success" dot>now</Badge>}
                  </div>
                  <p className="text-xs text-content-muted">
                    {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                    {event.location ? ` · ${event.location}` : ''}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      {/* ============ MODALS ============ */}
      <Modal
        isOpen={showReminderForm}
        onClose={() => {
          setShowReminderForm(false);
          setEditingReminder(null);
        }}
        title={editingReminder ? 'Edit reminder' : 'New reminder'}
        subtitle="A single moment you do not want to miss."
        size="lg"
      >
        <ReminderForm
          key={editingReminder?._id || 'new'}
          reminder={editingReminder}
          onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
          onCancel={() => {
            setShowReminderForm(false);
            setEditingReminder(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        title="New task"
        subtitle="Captured here, prioritised everywhere."
        size="lg"
      >
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowTaskForm(false)} />
      </Modal>

      <Modal
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        title="Block time"
        subtitle="Reserve a slot on your calendar."
        size="lg"
      >
        <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowEventForm(false)} />
      </Modal>
    </div>
  );
};

export default ActivityHub;
