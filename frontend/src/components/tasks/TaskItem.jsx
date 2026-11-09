import React, { useState } from 'react';
import { FaChevronDown, FaEdit, FaRegCalendarAlt, FaTrash, FaCheck, FaFlag } from 'react-icons/fa';
import { isToday, isTomorrow, isPast, format } from 'date-fns';
import Badge from '@components/ui/Badge';

const PRIORITY = {
  high: { variant: 'danger', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'success', label: 'Low' },
};

const STATUS = {
  todo: { variant: 'secondary', label: 'To do' },
  'in-progress': { variant: 'primary', label: 'In progress' },
  completed: { variant: 'success', label: 'Done' },
};

const formatDue = (dueDate) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;
  if (isToday(date)) return { label: 'Today', tone: 'text-amber-600 dark:text-amber-400' };
  if (isTomorrow(date)) return { label: 'Tomorrow', tone: 'text-primary-600 dark:text-primary-300' };
  if (isPast(date)) return { label: format(date, 'MMM d'), tone: 'text-rose-500' };
  return { label: format(date, 'MMM d'), tone: 'text-content-subtle' };
};

const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const done = task.status === 'completed';
  const priority = PRIORITY[task.priority] || PRIORITY.medium;
  const status = STATUS[task.status] || STATUS.todo;
  const due = formatDue(task.dueDate);

  return (
    <div
      className={`group rounded-xl border bg-surface-raised p-3.5 transition-all duration-200 hover:shadow-soft ${
        done ? 'border-line/60 opacity-80' : 'border-line'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle?.(task._id)}
          aria-label={done ? 'Mark as not done' : 'Mark as done'}
          aria-pressed={done}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-gray-300 hover:border-primary-500 dark:border-gray-600'
          }`}
        >
          {done && <FaCheck size={9} />}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-full items-start gap-2 text-left"
            aria-expanded={expanded}
          >
            <span
              className={`min-w-0 flex-1 text-sm font-medium leading-snug ${
                done ? 'text-content-subtle line-through' : 'text-content'
              }`}
            >
              {task.title}
            </span>
            <FaChevronDown
              size={9}
              className={`mt-1 shrink-0 text-content-subtle transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.68rem]">
            <Badge variant={priority.variant} className="px-1.5 py-0 text-[0.6rem]">
              <FaFlag size={6} /> {priority.label}
            </Badge>
            <Badge variant={status.variant} className="px-1.5 py-0 text-[0.6rem]">
              {status.label}
            </Badge>
            {due && (
              <span className={`flex items-center gap-1 font-medium ${due.tone}`}>
                <FaRegCalendarAlt size={8} /> {due.label}
              </span>
            )}
            {Array.isArray(task.tags) &&
              task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-md bg-surface-sunken px-1.5 py-0.5 text-content-subtle">
                  #{tag}
                </span>
              ))}
          </div>

          {expanded && (
            <div className="mt-3 space-y-3 border-t border-line pt-3">
              {task.description ? (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-content-muted">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs italic text-content-subtle">No description yet.</p>
              )}

              {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                <ul className="space-y-1.5">
                  {task.subtasks.map((subtask, index) => (
                    <li key={`${subtask.title}-${index}`} className="flex items-center gap-2 text-xs text-content-muted">
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                          subtask.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line'
                        }`}
                      >
                        {subtask.completed && <FaCheck size={6} />}
                      </span>
                      <span className={subtask.completed ? 'line-through opacity-70' : ''}>{subtask.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onEdit?.(task)} className="btn btn-secondary btn-sm">
                  <FaEdit size={9} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(task._id)}
                  className="btn btn-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <FaTrash size={9} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {!expanded && (
          <div className="hidden shrink-0 gap-1 group-hover:flex">
            <button
              type="button"
              onClick={() => onEdit?.(task)}
              className="rounded-md p-1.5 text-content-subtle hover:bg-gray-100 hover:text-content dark:hover:bg-white/5"
              aria-label="Edit task"
            >
              <FaEdit size={10} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(task._id)}
              className="rounded-md p-1.5 text-content-subtle hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
              aria-label="Delete task"
            >
              <FaTrash size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
