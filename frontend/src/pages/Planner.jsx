import React, { useEffect, useMemo, useState } from 'react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaMagic,
  FaPlus,
  FaSun,
  FaMoon,
  FaRegSun,
} from 'react-icons/fa';
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfDay,
  differenceInMinutes,
} from 'date-fns';
import toast from 'react-hot-toast';
import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import Modal from '@components/ui/Modal';
import TaskForm from '@components/tasks/TaskForm';
import EventForm from '@components/schedule/EventForm';
import EmptyState from '@components/ui/EmptyState';
import Badge from '@components/ui/Badge';

const DAY_START = 7; // 07:00
const DAY_END = 22; // 22:00
const PX_PER_MINUTE = 1.1;

const TYPE_STYLES = {
  meeting: { bar: 'bg-primary-500', chip: 'badge-accent' },
  task: { bar: 'bg-amber-500', chip: 'badge-warning' },
  deadline: { bar: 'bg-rose-500', chip: 'badge-danger' },
  reminder: { bar: 'bg-emerald-500', chip: 'badge-success' },
};

const PRIORITY_STYLES = {
  high: 'border-rose-300 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10',
  medium: 'border-amber-300 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10',
  low: 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10',
};

const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, index) => DAY_START + index);

const toMinutesFromDayStart = (date) => {
  const start = startOfDay(date);
  const base = new Date(start);
  base.setHours(DAY_START, 0, 0, 0);
  return differenceInMinutes(date, base);
};

const Planner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [prefillEvent, setPrefillEvent] = useState(null);
  const [agendaTask, setAgendaTask] = useState(null);
  const [planning, setPlanning] = useState(false);

  const { tasks, createTask, updateTask, toggleTask, deleteTask } = useTasks();
  const { events, createEvent, updateEvent, deleteEvent } = useSchedule();

  useEffect(() => {
    document.title = 'Planner — SchedAI';
  }, []);

  const dayEvents = useMemo(
    () =>
      (Array.isArray(events) ? events : [])
        .filter((event) => event.start && isSameDay(new Date(event.start), selectedDate))
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [events, selectedDate]
  );

  const dayTasks = useMemo(
    () =>
      (Array.isArray(tasks) ? tasks : [])
        .filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
        .sort((a, b) => (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0)),
    [tasks, selectedDate]
  );

  const unscheduled = useMemo(
    () => (Array.isArray(tasks) ? tasks : []).filter((task) => !task.dueDate && task.status !== 'completed'),
    [tasks]
  );

  // Free/busy totals for the header
  const totals = useMemo(() => {
    const busyMinutes = dayEvents.reduce((sum, event) => {
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000);
      return sum + Math.max(0, differenceInMinutes(end, start));
    }, 0);
    const totalMinutes = (DAY_END - DAY_START) * 60;
    return {
      busy: Math.round(busyMinutes / 60 * 10) / 10,
      free: Math.round(((totalMinutes - busyMinutes) / 60) * 10) / 10,
      utilisation: Math.min(100, Math.round((busyMinutes / totalMinutes) * 100)),
    };
  }, [dayEvents]);

  const openEventAt = (hour) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setPrefillEvent({ start, end });
    setShowEventModal(true);
  };

  /**
   * A deterministic "AI" day plan: schedules the remaining unscheduled tasks into
   * free slots around existing events, respecting priority. Everything it does is
   * a normal event creation, so it is fully editable/undoable.
   */
  const autoPlan = async () => {
    const candidates = (Array.isArray(tasks) ? tasks : [])
      .filter((task) => task.status !== 'completed' && !task.dueDate)
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      })
      .slice(0, 4);

    if (candidates.length === 0) {
      toast('Nothing to schedule — everything already has a date. Add a task first.');
      return;
    }

    setPlanning(true);
    try {
      // Build a list of busy intervals for the selected day
      const busy = dayEvents.map((event) => {
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : new Date(start.getTime() + 60 * 60 * 1000);
        return { start: start.getTime(), end: end.getTime() };
      });

      const dayBase = new Date(selectedDate);
      dayBase.setHours(DAY_START, 0, 0, 0);
      let cursor = Math.max(
        Date.now() + 30 * 60 * 1000,
        isToday(selectedDate) ? Date.now() + 30 * 60 * 1000 : dayBase.getTime()
      );

      let scheduled = 0;
      for (const task of candidates) {
        const duration = task.priority === 'high' ? 60 : task.priority === 'medium' ? 45 : 30;
        let slotStart = cursor;

        // Find the next free window of `duration`
        for (let guard = 0; guard < 40; guard += 1) {
          const slotEnd = slotStart + duration * 60 * 1000;
          const clash = busy.find((interval) => slotStart < interval.end && slotEnd > interval.start);
          if (!clash) break;
          slotStart = clash.end + 10 * 60 * 1000;
        }

        const slotEnd = slotStart + duration * 60 * 1000;
        const endsAfterDay = new Date(slotStart).getHours() >= DAY_END - 1;
        if (endsAfterDay) break;

        await createEvent({
          title: task.title,
          description: task.description || `Focus block for: ${task.title}`,
          start: new Date(slotStart).toISOString(),
          end: new Date(slotEnd).toISOString(),
          type: 'task',
          location: 'Focus block',
        });

        // The task now has a time — reflect it in the task list too.
        await updateTask(task._id, { dueDate: new Date(slotEnd).toISOString() });

        busy.push({ start: slotStart, end: slotEnd });
        cursor = slotEnd + 10 * 60 * 1000;
        scheduled += 1;
      }

      toast.success(
        scheduled > 0
          ? `Planned ${scheduled} focus block${scheduled === 1 ? '' : 's'} around your meetings`
          : 'No free slots left today — try another day'
      );
    } catch (error) {
      toast.error(error.message || 'Could not build the plan');
    } finally {
      setPlanning(false);
    }
  };

  const handleCreateTask = async (data) => {
    await createTask({ ...data, dueDate: data.dueDate || selectedDate.toISOString() });
    setShowTaskModal(false);
  };

  const handleCreateEvent = async (data) => {
    await createEvent(data);
    setShowEventModal(false);
    setPrefillEvent(null);
  };

  const shiftDay = (offset) => setSelectedDate((date) => addDays(date, offset));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily planner</h1>
          <p className="page-subtitle">Block time, protect focus, finish the day.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-line bg-surface-raised">
            <button type="button" onClick={() => shiftDay(-1)} className="btn btn-ghost btn-icon" aria-label="Previous day">
              <FaArrowLeft size={10} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="px-2 text-xs font-semibold text-content"
            >
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEE d MMM')}
            </button>
            <button type="button" onClick={() => shiftDay(1)} className="btn btn-ghost btn-icon" aria-label="Next day">
              <FaArrowRight size={10} />
            </button>
          </div>
          <button type="button" onClick={autoPlan} disabled={planning} className="btn btn-gradient btn-sm">
            <FaMagic size={10} /> {planning ? 'Planning…' : 'Auto-plan my day'}
          </button>
        </div>
      </div>

      {/* Day summary */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
            <FaCalendarAlt size={12} />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">Events</p>
            <p className="font-display text-lg font-bold leading-tight text-content">{dayEvents.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <FaCheck size={12} />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">Tasks due</p>
            <p className="font-display text-lg font-bold leading-tight text-content">{dayTasks.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <FaClock size={12} />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">Free time</p>
            <p className="font-display text-lg font-bold leading-tight text-content">{totals.free}h</p>
          </div>
        </div>
        <div className="card p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">Utilisation</p>
            <span className="text-xs font-bold text-content">{totals.utilisation}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${totals.utilisation > 80 ? 'bg-rose-500' : 'bg-accent-gradient'}`}
              style={{ width: `${totals.utilisation}%` }}
            />
          </div>
          <p className="mt-1.5 text-[0.65rem] text-content-subtle">{totals.busy}h booked</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Timeline */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-content">{format(selectedDate, 'EEEE, MMMM d')}</p>
              <p className="text-[0.68rem] text-content-muted">
                {format(selectedDate, 'yyyy')} · click an empty slot to block time
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setShowTaskModal(true)} className="btn btn-secondary btn-sm">
                <FaPlus size={9} /> Task
              </button>
              <button type="button" onClick={() => openEventAt(new Date().getHours() + 1)} className="btn btn-primary btn-sm">
                <FaPlus size={9} /> Event
              </button>
            </div>
          </div>

          <div className="max-h-[34rem] overflow-y-auto p-3">
            <div className="relative" style={{ height: (DAY_END - DAY_START) * 60 * PX_PER_MINUTE }}>
              {/* Hour rows */}
              {hours.slice(0, -1).map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => openEventAt(hour)}
                  className="group absolute left-0 right-0 flex items-start gap-2 border-t border-line/70 text-left transition-colors hover:bg-primary-50/40 dark:hover:bg-primary-500/5"
                  style={{ top: (hour - DAY_START) * 60 * PX_PER_MINUTE, height: 60 * PX_PER_MINUTE }}
                >
                  <span className="w-12 shrink-0 pt-1 text-right font-mono text-[0.6rem] text-content-subtle">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                  <span className="mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="badge badge-accent px-1.5 py-0 text-[0.55rem]">
                      <FaPlus size={6} /> block time
                    </span>
                  </span>
                </button>
              ))}

              {/* Events */}
              {dayEvents.map((event) => {
                const start = new Date(event.start);
                const end = event.end
                  ? new Date(event.end)
                  : new Date(start.getTime() + 60 * 60 * 1000);
                const top = Math.max(0, toMinutesFromDayStart(start)) * PX_PER_MINUTE;
                const height = Math.max(28, differenceInMinutes(end, start) * PX_PER_MINUTE);
                const style = TYPE_STYLES[event.type] || TYPE_STYLES.meeting;

                return (
                  <button
                    key={event._id}
                    type="button"
                    onClick={() => {
                      setPrefillEvent(event);
                      setShowEventModal(true);
                    }}
                    className="absolute left-14 right-2 overflow-hidden rounded-lg border border-line bg-surface-raised px-2 py-1 text-left shadow-soft transition-transform hover:-translate-y-0.5"
                    style={{ top, height }}
                    title={`${event.title} · ${format(start, 'h:mm a')} → ${format(end, 'h:mm a')}`}
                  >
                    <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
                    <span className="ml-1.5 block truncate text-[0.68rem] font-semibold text-content">
                      {event.title}
                    </span>
                    <span className="ml-1.5 block truncate text-[0.6rem] text-content-subtle">
                      {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                      {event.location ? ` · ${event.location}` : ''}
                    </span>
                  </button>
                );
              })}

              {/* Now indicator */}
              {isToday(selectedDate) && (() => {
                const top = toMinutesFromDayStart(new Date()) * PX_PER_MINUTE;
                if (top < 0 || top > (DAY_END - DAY_START) * 60 * PX_PER_MINUTE) return null;
                return (
                  <div className="pointer-events-none absolute left-12 right-0 z-10" style={{ top }}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span className="h-px flex-1 bg-rose-500/70" />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          {/* Tasks for the day */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-content">Tasks for this day</p>
              <Badge variant="neutral">{dayTasks.length}</Badge>
            </div>
            <div className="p-3">
              {dayTasks.length === 0 ? (
                <EmptyState
                  compact
                  icon={<FaSun />}
                  title="No tasks scheduled"
                  description="Nothing is due on this day yet."
                  action={
                    <button type="button" onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm mt-1">
                      <FaPlus size={9} /> Add a task
                    </button>
                  }
                />
              ) : (
                <ul className="space-y-2">
                  {dayTasks.map((task) => (
                    <li
                      key={task._id}
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 ${
                        task.status === 'completed'
                          ? 'border-line/60 opacity-70'
                          : PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task._id)}
                        aria-label={task.status === 'completed' ? 'Mark as not done' : 'Mark as done'}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                          task.status === 'completed'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {task.status === 'completed' && <FaCheck size={7} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-medium ${
                            task.status === 'completed'
                              ? 'text-content-subtle line-through'
                              : 'text-content'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-[0.62rem] capitalize text-content-subtle">
                          {task.priority} priority
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAgendaTask(task)}
                        className="shrink-0 text-[0.6rem] font-semibold text-primary-600 hover:underline"
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Unscheduled backlog */}
          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-content">Unscheduled</p>
              <p className="text-[0.68rem] text-content-muted">Drag-free backlog — give these a time.</p>
            </div>
            <div className="max-h-64 overflow-y-auto p-3">
              {unscheduled.length === 0 ? (
                <p className="py-4 text-center text-xs text-content-subtle">
                  Everything has a date. Impressive.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {unscheduled.slice(0, 8).map((task) => (
                    <li key={task._id} className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-content-muted">{task.title}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateTask(task._id, { dueDate: selectedDate.toISOString() });
                          toast.success('Scheduled for this day');
                        }}
                        className="shrink-0 rounded-md bg-primary-50 px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-500/15 dark:text-primary-200"
                      >
                        Plan
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="rounded-2xl border border-line bg-surface-raised p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-content">
              <FaBolt className="text-primary-500" size={10} /> Planning tip
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-content-muted">
              Keep meetings on the hour and leave 10-minute buffers. Auto-plan respects existing
              events and only uses genuinely free slots.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="New task for this day" size="lg">
        <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowTaskModal(false)} />
      </Modal>

      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setPrefillEvent(null);
        }}
        title="Block time"
        subtitle={prefillEvent ? format(prefillEvent.start, 'EEEE, MMM d · h:mm a') : undefined}
        size="lg"
      >
        <EventForm
          event={prefillEvent}
          onSubmit={handleCreateEvent}
          onCancel={() => {
            setShowEventModal(false);
            setPrefillEvent(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={Boolean(agendaTask)}
        onClose={() => setAgendaTask(null)}
        title="Edit task"
        size="lg"
        footer={
          agendaTask && (
            <button
              type="button"
              onClick={async () => {
                await deleteTask(agendaTask._id);
                setAgendaTask(null);
              }}
              className="btn btn-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              Delete task
            </button>
          )
        }
      >
        {agendaTask && (
          <TaskForm
            task={agendaTask}
            onSubmit={async (data) => {
              await updateTask(agendaTask._id, data);
              setAgendaTask(null);
            }}
            onCancel={() => setAgendaTask(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Planner;
