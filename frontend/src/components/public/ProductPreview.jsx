import React from 'react';
import {
  FaRegCircle,
  FaRegCheckCircle,
  FaBolt,
  FaClock,
  FaFlag,
  FaCalendarAlt,
} from 'react-icons/fa';

/**
 * A lightweight, purely visual preview of the product used on the landing
 * page. No real data — it exists to make the hero tangible.
 */

const TASKS = [
  { title: 'Review Q4 product roadmap', meta: 'Today · 9:30', priority: 'high', done: true },
  { title: 'Send investor update draft', meta: 'Today · 11:00', priority: 'medium', done: false },
  { title: 'Prep 1:1 notes for Amara', meta: 'Today · 14:15', priority: 'low', done: false },
];

const EVENTS = [
  { time: '09:00', title: 'Design sync', color: 'bg-primary-500' },
  { time: '11:30', title: 'Deep work block', color: 'bg-emerald-500' },
  { time: '14:30', title: 'Customer call · Acme', color: 'bg-secondary-500' },
];

const PRIORITY_STYLES = {
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-success',
};

const ProductPreview = () => (
  <div className="relative">
    {/* Glow */}
    <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent-gradient opacity-20 blur-3xl" aria-hidden="true" />

    <div className="overflow-hidden rounded-3xl border border-line bg-surface-raised shadow-lift">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 rounded-md bg-surface px-3 py-1 text-[0.65rem] text-content-subtle">
          app.schedai.com/dashboard
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[1.15fr_1fr] sm:p-5">
        {/* Left: tasks */}
        <div className="rounded-2xl border border-line bg-surface p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
              Today · Focus list
            </p>
            <span className="badge badge-accent">3 left</span>
          </div>

          <div className="space-y-2">
            {TASKS.map((task) => (
              <div
                key={task.title}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-raised p-2.5"
              >
                <span className={`mt-0.5 ${task.done ? 'text-emerald-500' : 'text-content-subtle'}`}>
                  {task.done ? <FaRegCheckCircle size={15} /> : <FaRegCircle size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[0.78rem] font-medium ${
                      task.done ? 'text-content-subtle line-through' : 'text-content'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] text-content-subtle">{task.meta}</p>
                </div>
                <span className={`badge ${PRIORITY_STYLES[task.priority]} px-1.5 py-0 text-[0.6rem]`}>
                  <FaFlag size={7} />
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-50 px-2.5 py-2 text-[0.68rem] font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-200">
            <FaBolt size={11} />
            AI moved 2 low-priority items to tomorrow
          </div>
        </div>

        {/* Right: schedule */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-line bg-surface p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
                Schedule
              </p>
              <FaCalendarAlt size={11} className="text-content-subtle" />
            </div>
            <div className="space-y-2">
              {EVENTS.map((event) => (
                <div key={event.title} className="flex items-center gap-2.5">
                  <span className="w-9 shrink-0 font-mono text-[0.62rem] text-content-subtle">{event.time}</span>
                  <span className={`h-7 w-1 shrink-0 rounded-full ${event.color}`} />
                  <span className="truncate rounded-lg bg-surface-sunken px-2 py-1 text-[0.7rem] font-medium text-content-muted">
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-3.5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
              Weekly focus
            </p>
            <div className="flex h-16 items-end gap-1.5">
              {[38, 62, 48, 86, 70, 34, 22].map((value, index) => (
                <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-primary-500/30 to-primary-500" style={{ height: `${value}%` }} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[0.58rem] text-content-subtle">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <span key={index}>{day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating cards */}
    <div className="absolute -left-3 top-24 hidden rounded-2xl border border-line bg-surface-raised px-3 py-2 shadow-lift lg:flex lg:items-center lg:gap-2 animate-float">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
        <FaClock size={12} />
      </span>
      <div>
        <p className="text-[0.65rem] font-semibold text-content">2h focus saved</p>
        <p className="text-[0.58rem] text-content-subtle">this week</p>
      </div>
    </div>

    <div className="absolute -right-3 bottom-16 hidden rounded-2xl border border-line bg-surface-raised px-3 py-2 shadow-lift lg:flex lg:items-center lg:gap-2 animate-float" style={{ animationDelay: '1.4s' }}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
        <FaBolt size={12} />
      </span>
      <div>
        <p className="text-[0.65rem] font-semibold text-content">No conflicts</p>
        <p className="text-[0.58rem] text-content-subtle">auto-resolved</p>
      </div>
    </div>
  </div>
);

export default ProductPreview;
