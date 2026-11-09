import React, { useMemo } from 'react';
import { FaTasks, FaPlus } from 'react-icons/fa';
import { isToday, isPast, isTomorrow } from 'date-fns';
import TaskList from '@components/tasks/TaskList';
import EmptyState from '@components/ui/EmptyState';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const TaskBoard = ({
  tasks = [],
  loading = false,
  filter = 'all',
  onFilterChange,
  onEdit,
  onDelete,
  onToggle,
  onAdd,
  showFilters = true,
}) => {
  const list = useMemo(() => {
    const items = Array.isArray(tasks) ? [...tasks] : [];
    const filtered = filter === 'all' ? items : items.filter((task) => task.status === filter);
    return filtered.sort((a, b) => {
      if ((a.status === 'completed') !== (b.status === 'completed')) {
        return a.status === 'completed' ? 1 : -1;
      }
      const priorityDiff =
        (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
      if (priorityDiff !== 0) return priorityDiff;
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    });
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const items = Array.isArray(tasks) ? tasks : [];
    return {
      all: items.length,
      todo: items.filter((task) => task.status === 'todo').length,
      'in-progress': items.filter((task) => task.status === 'in-progress').length,
      completed: items.filter((task) => task.status === 'completed').length,
      overdue: items.filter(
        (task) => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
      ).length,
      today: items.filter((task) => task.dueDate && isToday(new Date(task.dueDate))).length,
      tomorrow: items.filter((task) => task.dueDate && isTomorrow(new Date(task.dueDate))).length,
    };
  }, [tasks]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        {showFilters ? (
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange?.(option.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  filter === option.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {option.label}
                <span className={`ml-1.5 ${filter === option.id ? 'text-white/70' : 'text-content-subtle'}`}>
                  {counts[option.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
            {list.length} {list.length === 1 ? 'task' : 'tasks'}
          </p>
        )}

        {onAdd && (
          <button type="button" onClick={onAdd} className="btn btn-primary btn-sm">
            <FaPlus size={9} /> New task
          </button>
        )}
      </div>

      <div className="space-y-2 p-3">
        {list.length === 0 && !loading ? (
          <EmptyState
            compact
            icon={<FaTasks />}
            title={filter === 'all' ? 'Nothing on the list yet' : `No ${filter.replace('-', ' ')} tasks`}
            description={
              filter === 'all'
                ? 'Add a task and let the AI prioritise it for you.'
                : 'Switch filters to see the rest of your work.'
            }
          />
        ) : (
          <TaskList
            tasks={list}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onAdd={onAdd}
          />
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
