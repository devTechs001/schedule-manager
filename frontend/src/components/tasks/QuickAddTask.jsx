import React, { useState } from 'react';
import { FaPlus, FaBolt, FaRegCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * QuickAddTask — one-line capture used on the dashboard and tasks page.
 * Parses natural-language hints so people can just type:
 *   "Send the invoice tomorrow high"
 *   "Review deck fri !!"
 */
const PRIORITY_HINTS = [
  { pattern: /\b(urgent|asap|high|!!!)\b/i, priority: 'high' },
  { pattern: /\b(low|whenever|someday)\b/i, priority: 'low' },
];

const DAY_HINTS = [
  { pattern: /\btoday\b/i, offset: 0 },
  { pattern: /\btomorrow\b/i, offset: 1 },
  { pattern: /\bin (\d+) days?\b/i, offset: null },
];

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const parseInput = (raw) => {
  let title = raw.trim();
  let priority = 'medium';
  let dueDate = null;

  PRIORITY_HINTS.forEach(({ pattern, priority: value }) => {
    if (pattern.test(title)) {
      priority = value;
      title = title.replace(pattern, '').trim();
    }
  });

  DAY_HINTS.forEach(({ pattern, offset }) => {
    const match = title.match(pattern);
    if (!match) return;
    const days = offset === null ? Number(match[1]) || 0 : offset;
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(17, 0, 0, 0);
    dueDate = date.toISOString();
    title = title.replace(pattern, '').trim();
  });

  if (!dueDate) {
    const weekdayMatch = title.match(new RegExp(`\\b(${WEEKDAYS.join('|')})\\b`, 'i'));
    if (weekdayMatch) {
      const targetDay = WEEKDAYS.indexOf(weekdayMatch[1].toLowerCase());
      const date = new Date();
      const diff = (targetDay - date.getDay() + 7) % 7 || 7;
      date.setDate(date.getDate() + diff);
      date.setHours(17, 0, 0, 0);
      dueDate = date.toISOString();
      title = title.replace(weekdayMatch[0], '').trim();
    }
  }

  // Clean up double spaces and dangling punctuation
  title = title.replace(/\s{2,}/g, ' ').replace(/[\s,!]+$/, '').trim();

  return { title: title || raw.trim(), priority, dueDate, status: 'todo' };
};

const QuickAddTask = ({ onCreate, placeholder = 'Add a task… try "Send invoice tomorrow high"' }) => {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const raw = value.trim();
    if (raw.length < 3) {
      toast.error('A task needs at least 3 characters');
      return;
    }

    setBusy(true);
    try {
      const parsed = parseInput(raw);
      await onCreate?.(parsed);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface-raised/70 p-2.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
          <FaPlus size={11} />
        </span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-content placeholder:text-content-subtle focus:outline-none"
          aria-label="Quick add task"
        />
        <span className="hidden items-center gap-1 text-[0.6rem] text-content-subtle sm:flex">
          <FaBolt size={8} /> natural language
        </span>
        <button type="submit" className="btn btn-primary btn-sm shrink-0" disabled={busy}>
          {busy ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  );
};

export { parseInput };
export default QuickAddTask;
