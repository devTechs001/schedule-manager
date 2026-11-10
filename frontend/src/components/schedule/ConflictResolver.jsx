import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  FaExclamationTriangle,
  FaClock,
  FaCheck,
  FaLightbulb,
  FaExchangeAlt,
  FaCalendarAlt,
} from 'react-icons/fa';

/**
 * ConflictResolver — shows overlapping calendar events and offers a fix.
 *
 * Expects real events (the same shape the schedule hook returns) and derives
 * the overlaps itself, rather than being handed a pre-baked conflict list.
 * The previous version used `bg-surface-sunken` class names, which Tailwind
 * cannot generate at build time, so the priority colours were silently missing.
 */

const PRIORITY_STYLES = {
  high: {
    bar: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  medium: {
    bar: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  },
  low: {
    bar: 'bg-sky-500',
    pill: 'bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  },
};

const styleOf = (priority) => PRIORITY_STYLES[priority] || PRIORITY_STYLES.low;

/**
 * Find overlapping pairs.
 * @param events [{ _id, title, start, end, priority }]
 */
export const findConflicts = (events = []) => {
  const timed = (Array.isArray(events) ? events : [])
    .map((event) => {
      const start = new Date(event.start).getTime();
      const end = event.end ? new Date(event.end).getTime() : start + 60 * 60 * 1000;
      return { ...event, _start: start, _end: end };
    })
    .filter((event) => Number.isFinite(event._start) && Number.isFinite(event._end))
    .filter((event) => event._end > event._start)
    .sort((a, b) => a._start - b._start);

  const conflicts = [];
  const seen = new Set();

  for (let i = 0; i < timed.length; i += 1) {
    for (let j = i + 1; j < timed.length; j += 1) {
      const a = timed[i];
      const b = timed[j];
      if (b._start >= a._end) break; // sorted: no later event can overlap a
      const key = [a._id, b._id].sort().join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      conflicts.push({
        id: key,
        events: [a, b],
        overlapMinutes: Math.round((Math.min(a._end, b._end) - Math.max(a._start, b._start)) / 60000),
      });
    }
  }

  return conflicts;
};

const ConflictResolver = ({ events = [], onReschedule, onDismiss }) => {
  const [dismissed, setDismissed] = useState([]);
  const conflicts = useMemo(() => findConflicts(events), [events]);
  const open = conflicts.filter((conflict) => !dismissed.includes(conflict.id));

  const dismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
    onDismiss?.(id);
  };

  return (
    <section className="card" aria-label="Schedule conflicts">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
            <FaExclamationTriangle size={12} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-content">Schedule conflicts</h2>
            <p className="text-[0.65rem] text-content-subtle">
              {open.length === 0
                ? 'Nothing overlaps'
                : `${open.length} overlap${open.length === 1 ? '' : 's'} found`}
            </p>
          </div>
        </div>
        {open.length > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[0.65rem] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            {open.length}
          </span>
        )}
      </div>

      {open.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
          <FaCheck size={20} className="text-emerald-500" />
          <p className="text-sm font-medium text-content">No conflicts</p>
          <p className="text-xs text-content-muted">
            Every event on your calendar has its own time slot.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 p-3">
          {open.map((conflict) => (
            <li
              key={conflict.id}
              className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-400/25 dark:bg-rose-400/5"
            >
              <p className="mb-2 flex items-center gap-1.5 text-[0.68rem] font-semibold text-rose-700 dark:text-rose-300">
                <FaExchangeAlt size={9} /> {conflict.overlapMinutes} min overlap
              </p>

              <ul className="space-y-1.5">
                {conflict.events.map((event) => {
                  const style = styleOf(event.priority);
                  return (
                    <li key={event._id} className="flex items-stretch gap-2">
                      <span className={`w-1 shrink-0 rounded-full ${style.bar}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1 rounded-lg bg-surface px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium text-content">
                            {event.title}
                          </span>
                          {event.priority && (
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[0.58rem] font-semibold capitalize ${style.pill}`}
                            >
                              {event.priority}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[0.63rem] text-content-subtle">
                          <FaClock size={8} />
                          {format(new Date(event.start), 'HH:mm')}
                          {' – '}
                          {format(new Date(event.end || event._end), 'HH:mm')}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onReschedule?.(conflict)}
                  className="btn btn-outline btn-sm"
                >
                  <FaCalendarAlt size={9} /> Reschedule one
                </button>
                <button type="button" onClick={() => dismiss(conflict.id)} className="btn btn-ghost btn-sm">
                  Keep both
                </button>
              </div>

              <p className="mt-2 flex items-start gap-1 text-[0.6rem] leading-relaxed text-content-subtle">
                <FaLightbulb size={8} className="mt-0.5 shrink-0 text-amber-500" />
                Overlaps are detected from event start and end times — not guessed.
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ConflictResolver;
