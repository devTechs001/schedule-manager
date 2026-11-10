import React from 'react';
import { FaTasks, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import Card from '@components/ui/Card';

/**
 * Four-up task totals.
 *
 * NOT mounted on the Analytics page: that page renders StatCards for the same
 * four numbers with an extra explanatory `hint` line each, which is the more
 * useful version. Mounting both would show identical figures twice. This
 * remains the drop-in for any surface that only needs the bare counts.
 */
const TaskMetrics = ({ metrics = {}, className = '' }) => {
  if (!metrics || typeof metrics !== 'object') return null;

  const stats = [
    {
      label: 'Total Tasks',
      value: metrics.total,
      icon: FaTasks,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Completed',
      value: metrics.completed,
      icon: FaCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'In Progress',
      value: metrics.inProgress,
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Overdue',
      value: metrics.overdue,
      icon: FaExclamationCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-content-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-content">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TaskMetrics;