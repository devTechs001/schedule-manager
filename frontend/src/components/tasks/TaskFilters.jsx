import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Input from '@components/ui/Input';

/**
 * Filter bar for a task list.
 *
 * Controlled: the parent owns `filters` and gets a whole new object from
 * `onFilterChange`. Previously this component was orphaned while the Tasks page
 * grew its own inline search box, which meant priority was never filterable at
 * all. The page now renders this and gains the priority/status/sort controls
 * for free.
 *
 * Shape: { search, status, priority, sort }
 */
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'due', label: 'Due date' },
  { value: 'created', label: 'Newest' },
  { value: 'title', label: 'A → Z' },
];

const DEFAULTS = { search: '', status: 'all', priority: 'all', sort: 'priority' };

const TaskFilters = ({ filters = DEFAULTS, onFilterChange }) => {
  const value = { ...DEFAULTS, ...filters };

  const update = (key, next) => {
    onFilterChange?.({ ...value, [key]: next });
  };

  const activeCount = ['search', 'status', 'priority'].filter(
    (key) => value[key] && value[key] !== 'all'
  ).length;

  const reset = () => onFilterChange?.({ ...DEFAULTS, sort: value.sort });

  return (
    <div className="card p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search tasks, tags, descriptions…"
            icon={<FaSearch size={11} />}
            value={value.search}
            onChange={(event) => update('search', event.target.value)}
            aria-label="Search tasks"
            className="text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <label className="sr-only" htmlFor="task-filter-status">Status</label>
          <select
            id="task-filter-status"
            value={value.status}
            onChange={(event) => update('status', event.target.value)}
            className="input w-auto py-1.5 text-[0.68rem] font-semibold"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="task-filter-priority">Priority</label>
          <select
            id="task-filter-priority"
            value={value.priority}
            onChange={(event) => update('priority', event.target.value)}
            className="input w-auto py-1.5 text-[0.68rem] font-semibold"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label className="sr-only" htmlFor="task-filter-sort">Sort by</label>
          <select
            id="task-filter-sort"
            value={value.sort}
            onChange={(event) => update('sort', event.target.value)}
            className="input w-auto py-1.5 text-[0.68rem] font-semibold"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>Sort: {option.label}</option>
            ))}
          </select>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.68rem] font-semibold text-content-muted hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <FaTimes size={9} /> Clear {activeCount > 1 ? `(${activeCount})` : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { DEFAULTS as TASK_FILTER_DEFAULTS };
export default TaskFilters;
