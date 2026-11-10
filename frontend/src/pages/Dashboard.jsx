import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaPlus,
  FaRegClock,
  FaRobot,
  FaTasks,
  FaFire,
  FaChartLine,
} from 'react-icons/fa';
import { format, isAfter, isBefore, isToday, isTomorrow, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';
import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import { useEmails } from '@hooks/useEmails';
import { useAuth } from '@contexts/AuthContext';
import Card from '@components/ui/Card';
import StatCard from '@components/ui/StatCard';
import Badge from '@components/ui/Badge';
import TaskList from '@components/tasks/TaskList';
import EmptyState from '@components/ui/EmptyState';
import Modal from '@components/ui/Modal';
import TaskForm from '@components/tasks/TaskForm';
import QuickAddTask from '@components/tasks/QuickAddTask';
import FocusWidget from '@components/widgets/FocusWidget';
import WeatherWidget from '@components/widgets/WeatherWidget';
import SmartAlerts from '@components/notification/SmartAlerts';
import { useSmartAlerts } from '@hooks/useSmartAlerts';
import Confetti from '@components/ui/Confetti';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const TONE_BY_TYPE = {
  meeting: 'bg-primary-500',
  task: 'bg-amber-500',
  deadline: 'bg-rose-500',
  reminder: 'bg-emerald-500',
};

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { events, loading: eventsLoading } = useSchedule();
  const { emails, loading: emailsLoading } = useEmails();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [now, setNow] = useState(new Date());
  const [celebrate, setCelebrate] = useState(false);

  /*
   * Completing a task is the one moment worth a small celebration. Only fires
   * on completion (not un-completion), and only on the dashboard — the list
   * pages stay quiet.
   */
  const handleToggleTask = async (id) => {
    const task = (Array.isArray(tasks) ? tasks : []).find((item) => item._id === id);
    const willComplete = task && task.status !== 'completed';
    await toggleTask(id);
    if (willComplete) setCelebrate(true);
  };

  // Live clock for the "time" widget
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = 'Dashboard — SchedAI';
  }, []);

  const stats = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];
    const emailList = Array.isArray(emails) ? emails : [];
    const eventList = Array.isArray(events) ? events : [];

    const completed = taskList.filter((task) => task.status === 'completed');
    const overdue = taskList.filter(
      (task) => task.dueDate && isBefore(new Date(task.dueDate), startOfDay(now)) && task.status !== 'completed'
    );
    const todayTasks = taskList.filter(
      (task) => task.dueDate && isToday(new Date(task.dueDate)) && task.status !== 'completed'
    );
    const todayEvents = eventList.filter((event) => isToday(new Date(event.start)));

    return {
      total: taskList.length,
      completed: completed.length,
      inProgress: taskList.filter((task) => task.status === 'in-progress').length,
      open: taskList.length - completed.length,
      overdue: overdue.length,
      todayTasks: todayTasks.length,
      todayEvents: todayEvents.length,
      unreadEmails: emailList.filter((email) => !email.read).length,
      completionRate: taskList.length ? Math.round((completed.length / taskList.length) * 100) : 0,
      nextEvent: eventList
        .filter((event) => isAfter(new Date(event.end || event.start), now))
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0],
    };
  }, [tasks, events, emails, now]);

  // Alerts come from real due dates and event times, not a notification feed.
  const alerts = useSmartAlerts(tasks, events);

  const focusTasks = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];
    return taskList
      .filter((task) => task.status !== 'completed')
      .sort((a, b) => {
        const priorityScore = { high: 0, medium: 1, low: 2 };
        const diff = (priorityScore[a.priority] ?? 1) - (priorityScore[b.priority] ?? 1);
        if (diff !== 0) return diff;
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      })
      .slice(0, 5);
  }, [tasks]);

  // Weekly completion bars (last 7 days, real data)
  const weekly = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];
    return Array.from({ length: 7 }).map((_, index) => {
      const day = addDays(startOfDay(now), index - 6);
      const dayEnd = endOfDay(day);
      const completedThatDay = taskList.filter(
        (task) =>
          task.status === 'completed' &&
          task.completedAt &&
          isWithinInterval(new Date(task.completedAt), { start: day, end: dayEnd })
      ).length;
      const createdThatDay = taskList.filter(
        (task) => task.createdAt && isWithinInterval(new Date(task.createdAt), { start: day, end: dayEnd })
      ).length;
      return { label: format(day, 'EEE'), completed: completedThatDay, created: createdThatDay };
    });
  }, [tasks, now]);

  const weekMax = Math.max(1, ...weekly.map((day) => Math.max(day.completed, day.created)));

  const upcoming = useMemo(() => {
    const eventList = Array.isArray(events) ? events : [];
    return eventList
      .filter((event) => {
        const start = new Date(event.start);
        return isToday(start) || isTomorrow(start) || (isAfter(start, now) && isBefore(start, addDays(now, 7)));
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
  }, [events, now]);

  const handleCreateTask = async (data) => {
    await createTask(data);
    setShowTaskModal(false);
  };

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <div className="space-y-6">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface-raised shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" aria-hidden="true" />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-300">
              {format(now, 'EEEE, MMMM d')}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-content sm:text-3xl">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="mt-1.5 max-w-lg text-sm text-content-muted">
              {stats.overdue > 0
                ? `You have ${stats.overdue} overdue ${stats.overdue === 1 ? 'task' : 'tasks'} and `
                : 'Nothing overdue. '}
              {stats.todayEvents > 0
                ? `${stats.todayEvents} ${stats.todayEvents === 1 ? 'event' : 'events'} on the calendar today.`
                : 'Your calendar is clear today.'}
            </p>

            <div className="mt-4">
              <QuickAddTask onCreate={(data) => createTask(data)} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn btn-primary btn-sm">
                <FaPlus size={9} /> New task
              </button>
              <Link to="/schedule" className="btn btn-outline btn-sm">
                <FaCalendarAlt size={9} /> Add event
              </Link>
              <Link to="/ai-chat" className="btn btn-ghost btn-sm">
                <FaRobot size={10} /> Ask the AI
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Today</p>
              <p className="mt-1 font-display text-2xl font-bold text-content">{stats.todayTasks}</p>
              <p className="text-[0.65rem] text-content-muted">tasks to finish</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Next up</p>
              <p className="mt-1 truncate text-sm font-semibold text-content">
                {stats.nextEvent ? stats.nextEvent.title : 'Free'}
              </p>
              <p className="truncate text-[0.65rem] text-content-muted">
                {stats.nextEvent ? format(new Date(stats.nextEvent.start), 'EEE · h:mm a') : 'Nothing scheduled'}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Unread</p>
              <p className="mt-1 font-display text-2xl font-bold text-content">{stats.unreadEmails}</p>
              <p className="text-[0.65rem] text-content-muted">emails in inbox</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Progress</p>
              <p className="mt-1 font-display text-2xl font-bold text-content">{stats.completionRate}%</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-accent-gradient" style={{ width: `${stats.completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open tasks"
          value={stats.open}
          hint={`${stats.completed} completed all-time`}
          icon={<FaTasks />}
          tone="accent"
          to="/tasks"
        />
        <StatCard
          label="Due today"
          value={stats.todayTasks}
          hint={stats.overdue > 0 ? `${stats.overdue} overdue` : 'Nothing overdue'}
          icon={<FaRegClock />}
          tone={stats.overdue > 0 ? 'rose' : 'emerald'}
          to="/tasks"
        />
        <StatCard
          label="Events today"
          value={stats.todayEvents}
          hint={`${upcoming.length} in the next 7 days`}
          icon={<FaCalendarAlt />}
          tone="violet"
          to="/schedule"
        />
        <StatCard
          label="Unread email"
          value={stats.unreadEmails}
          hint={emailsLoading ? 'Checking inbox…' : 'Across all folders'}
          icon={<FaEnvelope />}
          tone="amber"
          to="/emails"
        />
      </section>

      {/* ============ MAIN GRID ============ */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Focus list */}
        <div className="space-y-5">
      <Confetti show={celebrate} onComplete={() => setCelebrate(false)} />
          <Card
            title="Today's focus"
            subtitle="Sorted by AI priority and deadline"
            action={
              <Link to="/tasks" className="btn btn-ghost btn-sm">
                All tasks <FaArrowRight size={9} />
              </Link>
            }
            bodyClassName="p-3"
          >
            {focusTasks.length === 0 && !tasksLoading ? (
              <EmptyState
                compact
                icon={<FaCheckCircle />}
                title="You are all caught up"
                description="No open tasks. Add one, or enjoy the quiet."
                action={
                  <button type="button" onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn btn-primary btn-sm mt-1">
                    <FaPlus size={9} /> Add a task
                  </button>
                }
              />
            ) : (
              <TaskList
                tasks={focusTasks}
                loading={tasksLoading}
                onEdit={(task) => { setEditingTask(task); setShowTaskModal(true); }}
                onDelete={deleteTask}
                onToggle={handleToggleTask}
                onAdd={() => { setEditingTask(null); setShowTaskModal(true); }}
              />
            )}
          </Card>

          {/* Weekly activity */}
          <Card
            title="Last 7 days"
            subtitle="Tasks created vs completed"
            action={
              <Link to="/analytics" className="btn btn-ghost btn-sm">
                Analytics <FaArrowRight size={9} />
              </Link>
            }
          >
            <div className="flex h-40 items-end justify-between gap-2">
              {weekly.map((day) => (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end justify-center gap-1">
                    <div
                      className="w-2.5 rounded-t-md bg-primary-500/70 transition-all"
                      style={{ height: `${Math.max(4, (day.created / weekMax) * 100)}%` }}
                      title={`${day.created} created`}
                    />
                    <div
                      className="w-2.5 rounded-t-md bg-emerald-500 transition-all"
                      style={{ height: `${Math.max(4, (day.completed / weekMax) * 100)}%` }}
                      title={`${day.completed} completed`}
                    />
                  </div>
                  <span className="text-[0.62rem] font-medium text-content-subtle">{day.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[0.7rem] text-content-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-primary-500/70" /> Created
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Completed
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-semibold text-content">
                <FaChartLine size={10} className="text-emerald-500" />
                {weekly.reduce((sum, day) => sum + day.completed, 0)} done this week
              </span>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Derived alerts: overdue, due today, next event. */}
          {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

          <WeatherWidget autoLoad={false} />

          {/* Quick focus session — the full timer lives on /focus. */}
          <FocusWidget compact />

          {/* Upcoming */}
          <Card
            title="Up next"
            subtitle="Today and tomorrow"
            action={
              <Link to="/schedule" className="btn btn-ghost btn-sm">
                Calendar <FaArrowRight size={9} />
              </Link>
            }
            bodyClassName="p-3"
          >
            {upcoming.length === 0 ? (
              <EmptyState
                compact
                icon={<FaCalendarAlt />}
                title="Calendar is clear"
                description="Nothing scheduled in the next two days."
                action={
                  <Link to="/schedule" className="btn btn-outline btn-sm mt-1">
                    Plan something
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((event) => {
                  const start = new Date(event.start);
                  return (
                    <li
                      key={event._id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                    >
                      <span className={`mt-1 h-8 w-1 shrink-0 rounded-full ${TONE_BY_TYPE[event.type] || 'bg-primary-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-content">{event.title}</p>
                        <p className="mt-0.5 text-[0.68rem] text-content-muted">
                          {isToday(start) ? 'Today' : isTomorrow(start) ? 'Tomorrow' : format(start, 'EEE, MMM d')}
                          {' · '}
                          {format(start, 'h:mm a')}
                          {event.end ? ` – ${format(new Date(event.end), 'h:mm a')}` : ''}
                        </p>
                      </div>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[0.58rem] capitalize">
                        {event.type || 'event'}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* AI nudge */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-accent-gradient p-5 text-white shadow-glow">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <FaBolt size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold">AI nudge</p>
                <p className="mt-1 text-xs leading-relaxed text-white/85">
                  {stats.overdue > 0
                    ? `You have ${stats.overdue} overdue item${stats.overdue === 1 ? '' : 's'}. Want me to reschedule them to tomorrow morning?`
                    : stats.open > 6
                    ? 'Your list is getting long. I can batch the low-priority items into one focus block.'
                    : 'Your plan looks realistic. Keep the morning for deep work and you are on track.'}
                </p>
                <Link to="/ai-chat" className="btn btn-sm mt-3 bg-white text-primary-700 hover:bg-white/90">
                  Open AI chat
                </Link>
              </div>
            </div>
          </div>

          {/* Streak / focus */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
                  <FaFire className="text-amber-500" size={10} /> Momentum
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold text-content">
                  {stats.completed}
                  <span className="ml-1 text-sm font-medium text-content-subtle">tasks done</span>
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary-100 dark:border-primary-500/20">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-300">{stats.completionRate}%</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-sunken px-3 py-2">
              <FaClock size={10} className="text-content-subtle" />
              <p className="text-[0.68rem] text-content-muted">
                {stats.inProgress} in progress · {stats.open} open
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Task modal — doubles as create + edit */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit task' : 'New task'}
        subtitle={
          editingTask
            ? 'Changes sync as soon as you save.'
            : 'Anything you capture is prioritised automatically.'
        }
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onSubmit={async (data) => {
            if (editingTask) await updateTask(editingTask._id, data);
            else await handleCreateTask(data);
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onCancel={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
