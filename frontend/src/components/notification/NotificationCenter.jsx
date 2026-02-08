import React, { useState } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaCog, FaTasks, FaCalendarAlt, FaEnvelope, FaUsers, FaTimes } from 'react-icons/fa';

const NotificationCenter = ({ notifications: initialNotifications = [], onMarkRead, onMarkAllRead, onDelete, onClear }) => {
  const [filter, setFilter] = useState('all');

  const defaultNotifications = [
    { id: 1, type: 'task', title: 'Task deadline approaching', message: 'Complete Q1 report is due tomorrow', time: new Date(Date.now() - 300000), read: false, icon: FaTasks },
    { id: 2, type: 'calendar', title: 'Meeting in 30 minutes', message: 'Team standup with Product team', time: new Date(Date.now() - 1800000), read: false, icon: FaCalendarAlt },
    { id: 3, type: 'email', title: 'New email from Sarah', message: 'Re: Project proposal feedback', time: new Date(Date.now() - 3600000), read: true, icon: FaEnvelope },
    { id: 4, type: 'collaboration', title: 'You were mentioned', message: 'Mike mentioned you in Design Review', time: new Date(Date.now() - 7200000), read: true, icon: FaUsers },
    { id: 5, type: 'task', title: 'Task assigned to you', message: 'Update documentation for API v2', time: new Date(Date.now() - 86400000), read: true, icon: FaTasks },
  ];

  const [notifications, setNotifications] = useState(
    initialNotifications.length > 0 ? initialNotifications : defaultNotifications
  );

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' || (filter === 'unread' && !n.read) || n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    onMarkRead?.(id);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    onDelete?.(id);
  };

  const handleClearAll = () => {
    setNotifications([]);
    onClear?.();
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaBell className="text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Mark all read
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <FaCog />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 overflow-x-auto">
          {['all', 'unread', 'task', 'calendar', 'email', 'collaboration'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaBell className="mx-auto text-4xl mb-3 opacity-30" />
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                !notification.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  notification.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  notification.type === 'calendar' ? 'bg-green-100 dark:bg-green-900/30' :
                  notification.type === 'email' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <notification.icon className={`${
                    notification.type === 'task' ? 'text-blue-600' :
                    notification.type === 'calendar' ? 'text-green-600' :
                    notification.type === 'email' ? 'text-purple-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeAgo(notification.time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <FaCheck /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <FaTimes /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClearAll}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

