import React from 'react';
import { FaArrowUp, FaArrowDown, FaTasks, FaCalendarCheck, FaClock, FaChartLine, FaUsers, FaEnvelope } from 'react-icons/fa';

const StatsWidget = ({
  stats: customStats = null,
  series = [],
  period = 'week',
  compact = false,
}) => {
  /*
   * Stats are supplied by the caller from real data. There are deliberately no
   * built-in numbers: showing "48 tasks completed" to someone with an empty
   * workspace is indistinguishable from a bug.
   */
  const stats = Array.isArray(customStats) ? customStats : [];
  const points = Array.isArray(series) ? series : [];

  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  };

  if (compact) {
    return (
      <div className="bg-surface rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.id} className="text-center">
              <p className="text-2xl font-bold text-content">
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-content-muted">{stat.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Statistics</h3>
        </div>
        <select className="px-3 py-1.5 text-sm border rounded-lg bg-surface-sunken border-line">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const isPositive = stat.changeType === 'increase';
          const Icon = stat.icon || FaChartLine;
          
          return (
            <div
              key={stat.id}
              className="p-4 rounded-lg bg-surface-sunken/50 hover:bg-surface-sunken transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                  {Math.abs(stat.change ?? 0)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-content mb-1">
                {stat.value.toLocaleString()}{stat.suffix || ''}
              </p>
              <p className="text-sm text-content-muted">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/*
        * A real series, or nothing. This block used to render seven bars of
        * fixed heights ([40, 65, 45, 80, 55, 90, 70]) labelled Mon-Sun, which
        * looked like a weekly trend for every account regardless of activity.
        */}
      {points.length > 0 && (
      <div className="mt-6 p-4 bg-surface-sunken/50 rounded-lg">
        <div className="flex items-end justify-between h-20 gap-1">
          {points.map((point) => (
            <div
              key={point.label}
              className="flex-1 bg-primary-500 rounded-t-sm hover:bg-primary-600 transition-colors"
              style={{ height: `${Math.max(3, point.value)}%` }}
              title={`${point.label}: ${point.value}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-content-muted">
          {points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default StatsWidget;

