import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTasks, 
  FaEnvelope, 
  FaCalendar, 
  FaChartLine,
  FaClock,
  FaCheckCircle 
} from 'react-icons/fa';
import Card from '@components/ui/Card';
import { useTasks } from '@hooks/useTasks';
import { useEmails } from '@hooks/useEmails';
import { useSchedule } from '@hooks/useSchedule';
import { useAI } from '@hooks/useAI';
import TaskList from '@components/tasks/TaskList';
import AIInsights from '@components/ai/AIInsights';
import ProductivityChart from '@components/analytics/ProductivityChart';
import { isToday, isTomorrow } from 'date-fns';

const Dashboard = () => {
  const { tasks } = useTasks();
  const { emails } = useEmails();
  const { events } = useSchedule();
  const { getInsights } = useAI();
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    unreadEmails: emails.filter(e => !e.read).length,
    todayEvents: events.filter(e => isToday(new Date(e.start))).length,
  };

  const todayTasks = tasks.filter(t => 
    t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'completed'
  );

  const upcomingEvents = events
    .filter(e => isToday(new Date(e.start)) || isTomorrow(new Date(e.start)))
    .slice(0, 5);

  const productivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completed: [3, 5, 4, 6, 8, 2, 1],
    created: [2, 4, 5, 5, 6, 3, 2],
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FaTasks,
      color: 'blue',
      link: '/tasks',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FaCheckCircle,
      color: 'green',
      link: '/tasks',
    },
    {
      title: 'Unread Emails',
      value: stats.unreadEmails,
      icon: FaEnvelope,
      color: 'purple',
      link: '/emails',
    },
    {
      title: "Today's Events",
      value: stats.todayEvents,
      icon: FaCalendar,
      color: 'orange',
      link: '/schedule',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your productivity overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card 
            title="Today's Tasks" 
            subtitle={`${todayTasks.length} tasks due today`}
          >
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <FaCheckCircle className="mx-auto text-green-500 mb-2" size={48} />
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks due today. Great job!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map(task => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {task.priority} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Productivity Chart */}
          <div className="mt-6">
            <ProductivityChart data={productivityData} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card title="Upcoming Events">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div
                    key={event._id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <FaClock className="text-primary-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.start).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI Insights */}
          <AIInsights insights={insights} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;