import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBolt,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFire,
  FaTasks,
  FaClock,
} from 'react-icons/fa';
import { addDays, format, isPast, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import Card from '@components/ui/Card';
import StatCard from '@components/ui/StatCard';
import ProductivityChart from '@components/analytics/ProductivityChart';
import TimeTracking from '@components/analytics/TimeTracking';
import DistractionTracker from '@components/analytics/DistractionTracker';
import EnergyTracker from '@components/analytics/EnergyTracker';
import StatsWidget from '@components/widgets/StatsWidget';

const Analytics = () => {
  const { tasks, loading } = useTasks();
  const { events } = useSchedule();

  useEffect(() => {
    document.title = 'Analytics — SchedAI';
  }, []);

  const metrics = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const now = new Date();
    const completed = list.filter((task) => task.status === 'completed');
    const completedThisWeek = completed.filter(
      (task) =>
        task.completedAt &&
        isWithinInterval(new Date(task.completedAt), { start: subDays(now, 7), end: now })
    );

    const byPriority = { high: 0, medium: 0, low: 0 };
    list.forEach((task) => {
      if (byPriority[task.priority] !== undefined) byPriority[task.priority] += 1;
    });

    return {
      total: list.length,
      completed: completed.length,
      inProgress: list.filter((task) => task.status === 'in-progress').length,
      overdue: list.filter((task) => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed').length,
      completionRate: list.length ? Math.round((completed.length / list.length) * 100) : 0,
      completedThisWeek: completedThisWeek.length,
      byPriority,
      events: Array.isArray(events) ? events.length : 0,
      upcomingEvents: (Array.isArray(events) ? events : []).filter((event) => new Date(event.start) > now).length,
    };
  }, [tasks, events]);

  // Real 14-day productivity series
  const chartData = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const days = Array.from({ length: 14 }).map((_, index) => startOfDay(addDays(new Date(), index - 13)));
    return {
      labels: days.map((day) => format(day, 'd MMM')),
      completed: days.map(
        (day) =>
          list.filter(
            (task) =>
              task.completedAt &&
              isWithinInterval(new Date(task.completedAt), { start: day, end: endOfDay(day) })
          ).length
      ),
      created: days.map(
        (day) =>
          list.filter(
            (task) =>
              task.createdAt &&
              isWithinInterval(new Date(task.createdAt), { start: day, end: endOfDay(day) })
          ).length
      ),
    };
  }, [tasks]);

  // Priority split doubles as "where effort is going"
  const timeData = useMemo(
    () => ({
      labels: ['High priority', 'Medium priority', 'Low priority', 'Completed', 'Events'],
      values: [
        metrics.byPriority.high,
        metrics.byPriority.medium,
        metrics.byPriority.low,
        metrics.completed,
        metrics.events,
      ],
    }),
    [metrics]
  );

  /*
   * Weekly completion counts, normalised to the tallest bar so the widget's
   * chart is proportional. The series is the last seven days of real
   * completedAt values — previously StatsWidget drew fixed heights here.
   */
  const weeklySeries = useMemo(() => {
    const labels = chartData.labels.slice(-7);
    const values = chartData.completed.slice(-7);
    const max = Math.max(1, ...values);
    return labels.map((label, index) => ({
      label: label.split(' ')[0],
      value: Math.round((values[index] / max) * 100),
      count: values[index],
    }));
  }, [chartData]);

  const widgetStats = useMemo(
    () => [
      { id: 'completed', name: 'Completed', value: metrics.completed, icon: FaCheckCircle, color: 'green' },
      { id: 'open', name: 'Open', value: metrics.total - metrics.completed, icon: FaTasks, color: 'blue' },
      { id: 'rate', name: 'Completion', value: metrics.completionRate, suffix: '%', icon: FaChartLine, color: 'purple' },
    ],
    [metrics]
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">How your week actually went — computed from real activity.</p>
        </div>
        <Link to="/analytics/performance" className="btn btn-outline btn-sm">
          Deeper report <FaArrowRight size={9} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completion rate" value={`${metrics.completionRate}%`} hint={`${metrics.completed} of ${metrics.total} tasks`} icon={<FaCheckCircle />} tone="emerald" />
        <StatCard label="Done this week" value={metrics.completedThisWeek} hint="Completed in the last 7 days" icon={<FaFire />} tone="amber" />
        <StatCard label="In progress" value={metrics.inProgress} hint="Currently being worked on" icon={<FaBolt />} tone="accent" />
        <StatCard label="Overdue" value={metrics.overdue} hint={metrics.overdue ? 'Needs your attention' : 'All clear'} icon={<FaExclamationTriangle />} tone={metrics.overdue ? 'rose' : 'slate'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Productivity overview" subtitle="Tasks completed vs created · last 14 days" bodyClassName="p-4">
          <div style={{ height: 280 }}>
            <ProductivityChart data={chartData} />
          </div>
        </Card>

        <Card title="Where the work is" subtitle="Tasks by priority, completions and events" bodyClassName="p-4">
          <div style={{ height: 260 }}>
            <TimeTracking timeData={timeData} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Task mix" bodyClassName="p-4">
          <div className="space-y-3">
            {[
              { label: 'High priority', value: metrics.byPriority.high, color: 'bg-rose-500' },
              { label: 'Medium priority', value: metrics.byPriority.medium, color: 'bg-amber-500' },
              { label: 'Low priority', value: metrics.byPriority.low, color: 'bg-emerald-500' },
            ].map((row) => {
              const percent = metrics.total ? Math.round((row.value / metrics.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-muted">{row.label}</span>
                    <span className="font-semibold text-content">
                      {row.value} <span className="font-normal text-content-subtle">({percent}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Calendar load" bodyClassName="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              <FaCalendarAlt size={20} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-content">{metrics.upcomingEvents}</p>
              <p className="text-xs text-content-muted">upcoming events</p>
              <p className="mt-1 text-[0.68rem] text-content-subtle">{metrics.events} total on the calendar</p>
            </div>
          </div>
          <Link to="/schedule" className="btn btn-outline btn-sm mt-4 w-full justify-center">
            Open schedule
          </Link>
        </Card>

        <Card title="Quick reads" bodyClassName="p-4">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <FaChartLine className="mt-0.5 shrink-0 text-emerald-500" size={12} />
              <p className="text-content-muted">
                Your completion rate is{' '}
                <span className="font-semibold text-content">{metrics.completionRate}%</span>
                {metrics.completionRate >= 60 ? ' — that is a healthy pace.' : ' — try slicing big tasks into 30-minute chunks.'}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <FaClock className="mt-0.5 shrink-0 text-primary-500" size={12} />
              <p className="text-content-muted">
                <span className="font-semibold text-content">{metrics.inProgress}</span> tasks are mid-flight.
                Finish one before starting another.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <FaTasks className="mt-0.5 shrink-0 text-amber-500" size={12} />
              <p className="text-content-muted">
                {metrics.overdue > 0
                  ? `${metrics.overdue} overdue items are blocking your score. Reschedule or close them.`
                  : 'Nothing overdue. Your backlog is honest.'}
              </p>
            </li>
          </ul>
        </Card>
      </div>

      {/* Self-tracking: the app cannot observe your focus or energy, so these
          let you record it yourself. Their entries persist locally. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DistractionTracker />
        <EnergyTracker />
      </div>

      <StatsWidget stats={widgetStats} series={weeklySeries} />

      {loading && <p className="text-center text-xs text-content-subtle">Refreshing data…</p>}
    </div>
  );
};

export default Analytics;
