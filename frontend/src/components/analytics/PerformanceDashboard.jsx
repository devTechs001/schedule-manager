import React from 'react';
import { FaChartLine, FaTasks, FaClock, FaFire, FaBullseye, FaTrophy } from 'react-icons/fa';

const PerformanceDashboard = ({ stats = {} }) => {
  const defaultStats = {
    tasksCompleted: 24,
    tasksTotal: 30,
    focusTime: 180,
    streak: 7,
    goalsAchieved: 3,
    productivity: 85,
    weeklyComparison: 12,
    ...stats,
  };

  const metrics = [
    {
      title: 'Tasks Completed',
      value: `${defaultStats.tasksCompleted}/${defaultStats.tasksTotal}`,
      icon: FaTasks,
      color: 'blue',
      progress: (defaultStats.tasksCompleted / defaultStats.tasksTotal) * 100,
    },
    {
      title: 'Focus Time',
      value: `${Math.floor(defaultStats.focusTime / 60)}h ${defaultStats.focusTime % 60}m`,
      icon: FaClock,
      color: 'purple',
      subtext: 'This week',
    },
    {
      title: 'Current Streak',
      value: `${defaultStats.streak} days`,
      icon: FaFire,
      color: 'orange',
    },
    {
      title: 'Goals Achieved',
      value: defaultStats.goalsAchieved,
      icon: FaBullseye,
      color: 'green',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Dashboard
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">This Week</span>
      </div>

      {/* Main Score */}
      <div className="mb-6 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Productivity Score</p>
            <p className="text-4xl font-bold">{defaultStats.productivity}%</p>
          </div>
          <div className="text-right">
            <FaTrophy className="text-4xl opacity-80" />
            <p className={`text-sm mt-1 ${defaultStats.weeklyComparison >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {defaultStats.weeklyComparison >= 0 ? '+' : ''}{defaultStats.weeklyComparison}% vs last week
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`text-${metric.color}-500`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            {metric.progress !== undefined && (
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${metric.color}-500 rounded-full`}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            )}
            {metric.subtext && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.subtext}</p>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Chart Placeholder */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Weekly Activity</h4>
        <div className="flex items-end justify-between h-24 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const height = [60, 80, 45, 90, 75, 30, 50][i];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Insight</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Your productivity peaks on Thursdays. Consider scheduling important tasks then!
        </p>
      </div>
    </div>
  );
};

export default PerformanceDashboard;

