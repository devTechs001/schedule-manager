import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFolder,
  FaSearch,
  FaListUl,
  FaThLarge,
  FaTasks,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaFlag,
} from 'react-icons/fa';
import { isBefore, isAfter, addDays, isValid, differenceInCalendarDays } from 'date-fns';
import { useTasks } from '@hooks/useTasks';
import EmptyState from '@components/ui/EmptyState';

/**
 * Projects view.
 *
 * There is no project entity in the API yet, so a "project" is derived from the
 * task tags the user already has. That keeps this page honest — every number is
 * computed from real tasks, not invented placeholder data.
 */

const STATUS_TONES = {
  active: 'badge badge-primary',
  'on-hold': 'badge badge-warning',
  completed: 'badge badge-success',
};

const priorityRank = { high: 0, medium: 1, low: 2 };

const Projects = () => {
  const { tasks, loading } = useTasks();
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const projects = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const groups = new Map();

    list.forEach((task) => {
      const tags = Array.isArray(task.tags) && task.tags.length ? task.tags : [];
      // A task without tags is not part of any project — don't invent one.
      tags.forEach((tag) => {
        const key = String(tag).trim();
        if (!key) return;
        if (!groups.has(key)) {
          groups.set(key, { name: key, tasks: [], completed: 0, overdue: 0, dueDates: [] });
        }
        const group = groups.get(key);
        group.tasks.push(task);
        if (task.status === 'completed') group.completed += 1;
        else if (task.dueDate && isValid(new Date(task.dueDate)) && isBefore(new Date(task.dueDate), new Date())) {
          group.overdue += 1;
        }
        if (task.dueDate && isValid(new Date(task.dueDate))) {
          group.dueDates.push(new Date(task.dueDate));
        }
      });
    });

    return [...groups.values()]
      .map((group) => {
        const total = group.tasks.length;
        const open = total - group.completed;
        const nextDue = group.dueDates
          .filter((date) => isAfter(date, addDays(new Date(), -1)))
          .sort((a, b) => a - b)[0];

        let derivedStatus = 'active';
        if (open === 0 && total > 0) derivedStatus = 'completed';
        else if (group.overdue > 0) derivedStatus = 'on-hold';

        const topPriority = group.tasks
          .filter((task) => task.status !== 'completed')
          .sort((a, b) => (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3))[0]?.priority;

        return {
          id: group.name,
          name: group.name,
          total,
          completed: group.completed,
          open,
          overdue: group.overdue,
          progress: total ? Math.round((group.completed / total) * 100) : 0,
          nextDue,
          status: derivedStatus,
          priority: topPriority,
          tasks: group.tasks,
        };
      })
      .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
  }, [tasks]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesTerm = !term || project.name.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || project.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [projects, query, status]);

  const totals = useMemo(
    () => ({
      projects: projects.length,
      open: projects.reduce((sum, project) => sum + project.open, 0),
      completed: projects.reduce((sum, project) => sum + project.completed, 0),
    }),
    [projects]
  );

  const statusChips = [
    { id: 'all', label: 'All', count: projects.length },
    { id: 'active', label: 'Active', count: projects.filter((p) => p.status === 'active').length },
    { id: 'on-hold', label: 'At risk', count: projects.filter((p) => p.status === 'on-hold').length },
    { id: 'completed', label: 'Done', count: projects.filter((p) => p.status === 'completed').length },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Grouped from your task tags — {totals.projects} projects, {totals.open} open items.
          </p>
        </div>
        <Link to="/tasks" className="btn btn-primary btn-sm">
          <FaTasks size={10} /> Manage tasks
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Projects', value: totals.projects, icon: FaFolder, tone: 'text-primary-600' },
          { label: 'Open tasks', value: totals.open, icon: FaClock, tone: 'text-amber-600' },
          { label: 'Completed', value: totals.completed, icon: FaCheckCircle, tone: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-3 p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-surface-sunken ${stat.tone}`}>
              <stat.icon size={13} />
            </span>
            <div>
              <p className="text-lg font-semibold leading-none text-content">{stat.value}</p>
              <p className="mt-1 text-xs text-content-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
            className="input py-2 pl-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statusChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatus(chip.id)}
              className={`chip ${status === chip.id ? 'chip-active' : ''}`}
            >
              {chip.label} <span className="opacity-60">{chip.count}</span>
            </button>
          ))}
        </div>

        <div className="flex overflow-hidden rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={`px-3 py-2 text-xs ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-content-muted hover:bg-surface-sunken'}`}
          >
            <FaThLarge size={11} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="List view"
            aria-pressed={view === 'list'}
            className={`px-3 py-2 text-xs ${view === 'list' ? 'bg-primary-600 text-white' : 'text-content-muted hover:bg-surface-sunken'}`}
          >
            <FaListUl size={11} />
          </button>
        </div>
      </div>

      {loading && projects.length === 0 && (
        <div className="card p-10 text-center text-sm text-content-muted">Loading projects…</div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<FaFolder />}
          title={projects.length === 0 ? 'No projects yet' : 'No projects match that filter'}
          description={
            projects.length === 0
              ? 'Projects are built from task tags. Add a tag like “website” or “marketing” to a task and it appears here.'
              : 'Try a different search term or clear the status filter.'
          }
          action={
            <Link to="/tasks" className="btn btn-primary btn-sm mt-1">
              Go to tasks
            </Link>
          }
        />
      )}

      {filtered.length > 0 && view === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              to="/tasks"
              className="card group p-4 transition-shadow hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                  <FaFolder size={13} />
                </span>
                <span className={STATUS_TONES[project.status] || STATUS_TONES.active}>
                  {project.status === 'on-hold' ? 'at risk' : project.status}
                </span>
              </div>

              <h3 className="mt-3 truncate text-sm font-semibold text-content">{project.name}</h3>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-content-muted">
                  <span>Progress</span>
                  <span className="font-semibold text-content">{project.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-accent-gradient transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <dl className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-content-muted">
                <div className="flex items-center gap-1.5">
                  <FaTasks size={9} />
                  {project.completed}/{project.total}
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock size={9} />
                  {project.open} open
                </div>
                <div className="flex items-center gap-1.5">
                  <FaFlag size={9} />
                  {project.priority || 'none'}
                </div>
              </dl>

              <p className="mt-3 flex items-center gap-1 text-[0.68rem] font-semibold text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
                Open tasks <FaArrowRight size={8} />
              </p>
            </Link>
          ))}
        </div>
      )}

      {filtered.length > 0 && view === 'list' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem]">
              <thead className="border-b border-line bg-surface-sunken">
                <tr className="text-left text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-content-subtle">
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5">Tasks</th>
                  <th className="px-4 py-2.5">Next due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((project) => (
                  <tr key={project.id} className="text-sm hover:bg-surface-sunken">
                    <td className="px-4 py-3">
                      <Link to="/tasks" className="flex items-center gap-2 font-medium text-content hover:text-primary-600">
                        <FaFolder size={11} className="text-primary-500" />
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={STATUS_TONES[project.status] || STATUS_TONES.active}>
                        {project.status === 'on-hold' ? 'at risk' : project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-accent-gradient" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-content-muted">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-content-muted">
                      {project.completed}/{project.total}
                    </td>
                    <td className="px-4 py-3 text-xs text-content-muted">
                      {project.nextDue
                        ? `${differenceInCalendarDays(project.nextDue, new Date())}d`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
