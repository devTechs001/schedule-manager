import React, { useState, useEffect } from 'react';
import { useTasks } from '@hooks/useTasks';
import ProductivityChart from '@components/analytics/ProductivityChart';
import TaskMetrics from '@components/analytics/TaskMetrics';
import TimeTracking from '@components/analytics/TimeTracking';
import Card from '@components/ui/Card';
import { FaTrophy, FaFire, FaChartLine } from 'react-icons/fa';

const Analytics = () => {
  const { tasks } = useTasks();
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, [tasks]);

  const calculateMetrics = () => {
    setMetrics({
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length,
    });
  };

  const productivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completed: [3, 5, 4, 6, 8, 2, 1],
    created: [2, 4, 5, 5, 6, 3, 2],
  };

  const timeData = {
    labels: ['Work', 'Meetings', 'Planning', 'Breaks', 'Other'],
    values: [40, 20, 15, 10, 15],
  };

  const completionRate = metrics.total > 0 
    ? Math.round((metrics.completed / metrics.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your productivity and performance
        </p>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <FaTrophy className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <FaFire className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">7 days</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FaChartLine className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.completed} tasks
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task Metrics */}
      <TaskMetrics metrics={metrics} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityChart data={productivityData} />
        <TimeTracking timeData={timeData} />
      </div>
    </div>
  );
};

export default Analytics;