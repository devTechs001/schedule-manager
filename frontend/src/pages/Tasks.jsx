import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaList,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaColumns,
} from 'react-icons/fa';
import { isPast, isToday, startOfDay } from 'date-fns';
import { useTasks } from '@hooks/useTasks';
import TaskList from '@components/tasks/TaskList';
import TaskForm from '@components/tasks/TaskForm';
import TaskCalendar from '@components/tasks/TaskCalendar';
import TaskFilters from '@components/tasks/TaskFilters';
import AIPriority from '@components/ai/AIPriority';
import QuickAddTask from '@components/tasks/QuickAddTask';
import Modal from '@components/ui/Modal';
import EmptyState from '@components/ui/EmptyState';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const QUICK_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'today', label: 'Today' },
];

const SORTS = [
  { id: 'priority', label: 'Priority' },
  { id: 'due', label: 'Due date' },
  { id: 'created', label: 'Newest' },
  { id: 'title', label: 'A → Z' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const Tasks = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTask, refreshTasks } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    document.title = 'Tasks — SchedAI';
  }, []);

  const counts = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    return {
      all: list.length,
      todo: list.filter((task) => task.status === 'todo').length,
      'in-progress': list.filter((task) => task.status === 'in-progress').length,
      completed: list.filter((task) => task.status === 'completed').length,
      overdue: list.filter(
        (task) => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
      ).length,
      today: list.filter((task) => task.dueDate && isToday(new Date(task.dueDate))).length,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let list = Array.isArray(tasks) ? [...tasks] : [];

    if (filter === 'overdue') {
      list = list.filter(
        (task) => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
      );
    } else if (filter === 'today') {
      list = list.filter((task) => task.dueDate && isToday(new Date(task.dueDate)));
    } else if (filter !== 'all') {
      list = list.filter((task) => task.status === filter);
    }

    if (priorityFilter !== 'all') {
      list = list.filter((task) => (task.priority || 'medium') === priorityFilter);
    }

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (task) =>
          (task.title || '').toLowerCase().includes(term) ||
          (task.description || '').toLowerCase().includes(term) ||
          (Array.isArray(task.tags) && task.tags.join(' ').toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'priority') {
        const diff = (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
        if (diff !== 0) return diff;
      }
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'created') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (sortBy === 'priority' && aDue !== bDue) return aDue - bDue;
      return (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0) || aDue - bDue;
    });

    return list;
  }, [tasks, filter, query, sortBy, priorityFilter]);

  const openCreate = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleSubmit = async (taskData) => {
    if (selectedTask?._id) {
      await updateTask(selectedTask._id, taskData);
    } else {
      await createTask(taskData);
    }
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task? This cannot be undone.')) {
      await deleteTask(id);
      setShowModal(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {loading
              ? 'Loading your tasks…'
              : `${counts.all} total · ${counts.overdue} overdue · ${counts.completed} completed`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-surface-raised p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-content-muted'
              }`}
              aria-pressed={viewMode === 'list'}
            >
              <FaList size={9} /> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'text-content-muted'
              }`}
              aria-pressed={viewMode === 'calendar'}
            >
              <FaCalendarAlt size={9} /> Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'board' ? 'bg-primary-600 text-white' : 'text-content-muted'
              }`}
              aria-pressed={viewMode === 'board'}
            >
              <FaColumns size={9} /> Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => refreshTasks()}
            className="btn btn-outline btn-sm"
            aria-label="Refresh tasks"
          >
            <FaSyncAlt size={9} className={loading ? 'animate-spin' : ''} />
          </button>

          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <FaPlus size={9} /> New task
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'To do', value: counts.todo, icon: FaList, tone: 'text-primary-600 bg-primary-50 dark:bg-primary-500/15 dark:text-primary-300' },
          { label: 'In progress', value: counts['in-progress'], icon: FaSyncAlt, tone: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-500/15 dark:text-secondary-300' },
          { label: 'Completed', value: counts.completed, icon: FaCheckCircle, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300' },
          { label: 'Overdue', value: counts.overdue, icon: FaExclamationTriangle, tone: 'text-rose-500 bg-rose-50 dark:bg-rose-500/15 dark:text-rose-300' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3 p-3.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon size={12} />
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">
                {stat.label}
              </p>
              <p className="font-display text-lg font-bold leading-tight text-content">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'board' ? (
        /* Kanban board — the one layout Tasks was missing. Columns are the real
           statuses; dragging is handled by the update action, not faked. */
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { id: 'todo', label: 'To do', tone: 'border-t-primary-400' },
            { id: 'in-progress', label: 'In progress', tone: 'border-t-amber-400' },
            { id: 'completed', label: 'Completed', tone: 'border-t-emerald-400' },
          ].map((column) => {
            const items = visibleTasks.filter((task) => (task.status || 'todo') === column.id);
            return (
              <section
                key={column.id}
                className={`card flex flex-col border-t-4 ${column.tone}`}
                aria-label={`${column.label} tasks`}
              >
                <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                    {column.label}
                  </h2>
                  <span className="rounded-md bg-surface-sunken px-1.5 py-0.5 text-[0.65rem] font-semibold text-content-subtle">
                    {items.length}
                  </span>
                </header>

                <div className="flex-1 space-y-2 p-2.5">
                  {items.length === 0 ? (
                    <p className="px-1 py-6 text-center text-[0.7rem] text-content-subtle">
                      Nothing here
                    </p>
                  ) : (
                    items.map((task) => (
                      <button
                        key={task._id}
                        type="button"
                        onClick={() => openEdit(task)}
                        className="w-full rounded-xl border border-line bg-surface-raised p-2.5 text-left transition-colors hover:border-primary-300"
                      >
                        <span className="block text-xs font-semibold leading-snug text-content">
                          {task.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5">
                          {task.priority && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[0.6rem] font-semibold capitalize ${
                                task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                  : task.priority === 'medium'
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300'
                                    : 'bg-surface-sunken text-content-subtle'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-[0.6rem] text-content-subtle">
                              {isPast(new Date(task.dueDate)) && task.status !== 'completed'
                                ? 'Overdue'
                                : isToday(new Date(task.dueDate))
                                  ? 'Today'
                                  : new Date(task.dueDate).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                            </span>
                          )}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : viewMode === 'calendar' ? (
        <TaskCalendar tasks={tasks} onTaskClick={openEdit} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_16rem]">
          <div className="space-y-3">
            <QuickAddTask onCreate={(data) => createTask(data)} />

            <div className="flex flex-wrap gap-1.5">
              {QUICK_SCOPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[0.68rem] font-semibold transition-colors ${
                    filter === option.id
                      ? 'bg-primary-600 text-white'
                      : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {option.label}
                  <span className="ml-1 opacity-70">{counts[option.id] ?? 0}</span>
                </button>
              ))}
            </div>

            <TaskFilters
              filters={{
                search: query,
                status: filter,
                priority: priorityFilter,
                sort: sortBy,
              }}
              onFilterChange={(next) => {
                setQuery(next.search);
                setFilter(next.status);
                setPriorityFilter(next.priority);
                setSortBy(next.sort);
              }}
            />

            {/* List */}
            {loading && visibleTasks.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 py-20">
                <LoadingSpinner size="md" />
                <p className="text-sm text-content-muted">Loading tasks…</p>
              </div>
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                icon={<FaList />}
                title={query ? 'No tasks match that search' : 'Nothing here'}
                description={
                  query
                    ? 'Try a different word, or clear the filters.'
                    : 'Add your first task and start planning.'
                }
                action={
                  <button type="button" onClick={openCreate} className="btn btn-primary btn-sm mt-1">
                    <FaPlus size={9} /> Add task
                  </button>
                }
              />
            ) : (
              <TaskList
                tasks={visibleTasks}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={toggleTask}
                onAdd={openCreate}
              />
            )}
          </div>

          {/* Sidebar summary */}
          <aside className="space-y-3">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">Sort by</p>
              <div className="mt-2.5 space-y-1">
                {SORTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sortBy === option.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                        : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
                  </button>
                ))}
              </div>
            </div>

            {visibleTasks.length > 0 && (
              <AIPriority tasks={visibleTasks.filter((task) => task.status !== 'completed')} />
            )}

            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">Due soon</p>
              <div className="mt-2.5 space-y-2">
                {visibleTasks
                  .filter((task) => task.dueDate && task.status !== 'completed')
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .slice(0, 5)
                  .map((task) => (
                    <button
                      key={task._id}
                      type="button"
                      onClick={() => openEdit(task)}
                      className="block w-full truncate rounded-lg border border-line px-2.5 py-1.5 text-left text-xs text-content-muted hover:border-primary-300"
                    >
                      {task.title}
                    </button>
                  ))}
                {visibleTasks.filter((task) => task.dueDate && task.status !== 'completed').length === 0 && (
                  <p className="text-xs text-content-subtle">Nothing scheduled. Nice.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-raised p-4">
              <p className="text-xs font-semibold text-content">✓ Completed this week</p>
              <p className="mt-1 font-display text-2xl font-bold text-content">{counts.completed}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-accent-gradient"
                  style={{ width: `${counts.all ? Math.round((counts.completed / counts.all) * 100) : 0}%` }}
                />
              </div>
            </div>
          </aside>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        title={selectedTask?._id ? 'Edit task' : 'New task'}
        subtitle={selectedTask?._id ? 'Update the details below.' : 'Capture it now — prioritise later.'}
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Tasks;
