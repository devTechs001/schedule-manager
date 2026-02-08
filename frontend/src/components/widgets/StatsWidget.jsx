import React from 'react';
import { FaArrowUp, FaArrowDown, FaTasks, FaCalendarCheck, FaClock, FaChartLine, FaUsers, FaEnvelope } from 'react-icons/fa';

const StatsWidget = ({ 
  stats: customStats = null,
  period = 'week',
  compact = false,
}) => {
  const defaultStats = [
    { id: 1, name: 'Tasks Completed', value: 48, change: 12, changeType: 'increase', icon: FaTasks, color: 'primary' },
    { id: 2, name: 'Meetings', value: 15, change: -3, changeType: 'decrease', icon: FaCalendarCheck, color: 'blue' },
    { id: 3, name: 'Focus Hours', value: 32, change: 8, changeType: 'increase', icon: FaClock, color: 'green' },
    { id: 4, name: 'Productivity', value: 85, change: 5, changeType: 'increase', icon: FaChartLine, color: 'purple', suffix: '%' },
    { id: 5, name: 'Collaborations', value: 12, change: 4, changeType: 'increase', icon: FaUsers, color: 'yellow' },
    { id: 6, name: 'Emails', value: 156, change: -23, changeType: 'decrease', icon: FaEnvelope, color: 'red' },
  ];

  const stats = customStats || defaultStats;

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.id} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-gray-500">{stat.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h3>
        </div>
        <select className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.changeType === 'increase';
          
          return (
            <div
              key={stat.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}{stat.suffix || ''}
              </p>
              <p className="text-sm text-gray-500">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Mini Chart Placeholder */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-end justify-between h-20 gap-1">
          {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-primary-500 rounded-t-sm hover:bg-primary-600 transition-colors"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;

