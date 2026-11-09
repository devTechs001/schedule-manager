import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaBolt,
  FaFire,
  FaCheckCircle,
  FaCoffee,
  FaBrain,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTasks } from '@hooks/useTasks';
import Card from '@components/ui/Card';
import Badge from '@components/ui/Badge';
import EmptyState from '@components/ui/EmptyState';

const MODES = [
  { id: 'focus', label: 'Focus', minutes: 25, icon: FaBrain, tone: 'bg-primary-600' },
  { id: 'short', label: 'Short break', minutes: 5, icon: FaCoffee, tone: 'bg-emerald-600' },
  { id: 'long', label: 'Long break', minutes: 15, icon: FaCoffee, tone: 'bg-sky-600' },
];

const STORAGE_KEY = 'focus:sessions';

const readSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Focus = () => {
  const { tasks, updateTask, toggleTask } = useTasks();
  const [modeId, setModeId] = useState('focus');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(readSessions);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const tickRef = useRef(null);

  useEffect(() => {
    document.title = 'Focus — SchedAI';
  }, []);

  const mode = MODES.find((m) => m.id === modeId) || MODES[0];

  // Reset the clock whenever the mode changes
  useEffect(() => {
    setRunning(false);
    setRemaining(mode.minutes * 60);
  }, [mode]);

  const completeSession = useCallback(() => {
    setRunning(false);
    setRemaining(mode.minutes * 60);

    if (mode.id !== 'focus') {
      toast.success('Break finished — back to it');
      return;
    }

    const entry = {
      id: Date.now(),
      minutes: mode.minutes,
      taskId: selectedTaskId || null,
      finishedAt: new Date().toISOString(),
    };
    const next = [entry, ...sessions].slice(0, 50);
    setSessions(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    toast.success(`Nice — ${mode.minutes} focused minutes logged`);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Focus session complete', { body: 'Take a two-minute breather.' });
    }
  }, [mode, selectedTaskId, sessions]);

  // Timer loop (wall-clock based so it survives tab throttling)
  useEffect(() => {
    if (!running) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      return undefined;
    }

    const endsAt = Date.now() + remaining * 1000;
    tickRef.current = window.setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(tickRef.current);
        completeSession();
      }
    }, 500);

    return () => window.clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, completeSession]);

  const openTasks = useMemo(
    () => (Array.isArray(tasks) ? tasks : []).filter((task) => task.status !== 'completed'),
    [tasks]
  );

  const selectedTask = openTasks.find((task) => task._id === selectedTaskId);

  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
  const todayMinutes = sessions
    .filter((session) => new Date(session.finishedAt).toDateString() === new Date().toDateString())
    .reduce((sum, session) => sum + session.minutes, 0);

  const progress = 1 - remaining / (mode.minutes * 60);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Focus</h1>
          <p className="page-subtitle">A timer that logs real work, not just clicks.</p>
        </div>
        <div className="flex gap-2">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setModeId(option.id)}
              className={`chip ${modeId === option.id ? 'chip-active' : ''}`}
              aria-pressed={modeId === option.id}
            >
              <option.icon size={10} /> {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Timer */}
        <div className="card flex flex-col items-center p-8">
          <div className="relative">
            <svg width="200" height="200" className="-rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                strokeWidth="10"
                className="stroke-gray-200 dark:stroke-white/10"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                stroke="url(#focusGradient)"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.4s linear' }}
              />
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--accent-500))" />
                  <stop offset="100%" stopColor="rgb(var(--secondary-500))" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-4xl font-bold tabular-nums text-content">
                {String(Math.floor(remaining / 60)).padStart(2, '0')}:
                {String(remaining % 60).padStart(2, '0')}
              </p>
              <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-content-subtle">
                {mode.label}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              className={`btn ${running ? 'btn-secondary' : 'btn-primary'} btn-lg`}
            >
              {running ? <FaPause size={11} /> : <FaPlay size={11} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setRemaining(mode.minutes * 60);
              }}
              className="btn btn-ghost btn-lg"
              aria-label="Reset timer"
            >
              <FaRedo size={11} />
            </button>
          </div>

          <div className="mt-6 w-full max-w-xs">
            <label htmlFor="focus-task" className="label text-center">
              What are you working on?
            </label>
            <select
              id="focus-task"
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              className="input text-xs"
            >
              <option value="">General focus (no task)</option>
              {openTasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>

            {selectedTask && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-sunken px-2.5 py-1.5">
                <span className="truncate text-[0.68rem] text-content-muted">{selectedTask.title}</span>
                <button
                  type="button"
                  onClick={() => toggleTask(selectedTask._id)}
                  className="ml-2 flex shrink-0 items-center gap-1 text-[0.62rem] font-semibold text-emerald-600 hover:underline"
                >
                  <FaCheckCircle size={8} /> Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card title="Today" bodyClassName="p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-3xl font-bold text-content">{todayMinutes}</p>
                <p className="text-xs text-content-muted">focused minutes</p>
              </div>
              <Badge variant={todayMinutes >= 90 ? 'success' : 'neutral'}>
                <FaFire size={8} /> {Math.round(todayMinutes / 25)} sessions
              </Badge>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-accent-gradient"
                style={{ width: `${Math.min(100, (todayMinutes / 120) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[0.68rem] text-content-subtle">Daily goal: 120 minutes</p>
          </Card>

          <Card title="Recent sessions" subtitle="Last 50 focus blocks" bodyClassName="p-3">
            {sessions.length === 0 ? (
              <EmptyState
                compact
                icon={<FaBolt />}
                title="No sessions yet"
                description="Start a 25-minute block; it will be logged here."
              />
            ) : (
              <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                {sessions.slice(0, 8).map((session) => {
                  const task = (Array.isArray(tasks) ? tasks : []).find((t) => t._id === session.taskId);
                  return (
                    <li
                      key={session.id}
                      className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[0.62rem] font-bold text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                        {session.minutes}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-content">
                          {task ? task.title : 'General focus'}
                        </p>
                        <p className="text-[0.62rem] text-content-subtle">
                          {new Date(session.finishedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card bodyClassName="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
              Lifetime
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-content">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
            <p className="text-xs text-content-muted">across {sessions.length} sessions</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Focus;
