import React, { useState } from 'react';
import { FaClock, FaBell, FaUndo, FaTrash, FaCalendarAlt, FaTasks, FaEnvelope } from 'react-icons/fa';

const SnoozeManager = ({ snoozedItems: initialItems = [], onUnsnooze, onDelete, onReschedule }) => {
  const defaultItems = [
    { id: 1, type: 'task', title: 'Review quarterly report', originalTime: new Date(Date.now() - 3600000), snoozeUntil: new Date(Date.now() + 3600000), snoozeCount: 2 },
    { id: 2, type: 'reminder', title: 'Call with client', originalTime: new Date(Date.now() - 7200000), snoozeUntil: new Date(Date.now() + 1800000), snoozeCount: 1 },
    { id: 3, type: 'email', title: 'Reply to Sarah\'s email', originalTime: new Date(Date.now() - 86400000), snoozeUntil: new Date(Date.now() + 7200000), snoozeCount: 3 },
    { id: 4, type: 'event', title: 'Team meeting reminder', originalTime: new Date(Date.now() - 1800000), snoozeUntil: new Date(Date.now() + 900000), snoozeCount: 1 },
  ];

  const [items, setItems] = useState(initialItems.length > 0 ? initialItems : defaultItems);

  const getTimeUntil = (date) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return 'Now';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `in ${hours}h`;
    const days = Math.floor(hours / 24);
    return `in ${days}d`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return FaTasks;
      case 'event': return FaCalendarAlt;
      case 'email': return FaEnvelope;
      default: return FaBell;
    }
  };

  const handleUnsnooze = (id) => {
    setItems(items.filter(item => item.id !== id));
    onUnsnooze?.(id);
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
    onDelete?.(id);
  };

  const handleReschedule = (id, newTime) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, snoozeUntil: newTime, snoozeCount: item.snoozeCount + 1 } : item
    ));
    onReschedule?.(id, newTime);
  };

  const sortedItems = [...items].sort((a, b) => new Date(a.snoozeUntil) - new Date(b.snoozeUntil));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClock className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Snoozed Items</h3>
          {items.length > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full">
              {items.length} snoozed
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaClock className="mx-auto text-4xl mb-3 opacity-30" />
          <p>No snoozed items</p>
          <p className="text-sm mt-1">Items you snooze will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const timeUntil = getTimeUntil(item.snoozeUntil);
            const isUrgent = new Date(item.snoozeUntil).getTime() - Date.now() < 900000;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 ${
                  isUrgent
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      item.type === 'event' ? 'bg-green-100 dark:bg-green-900/30' :
                      item.type === 'email' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <TypeIcon className={`${
                        item.type === 'task' ? 'text-blue-600' :
                        item.type === 'event' ? 'text-green-600' :
                        item.type === 'email' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                          Wakes up {timeUntil}
                        </span>
                        <span>•</span>
                        <span>Snoozed {item.snoozeCount}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUnsnooze(item.id)}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                      title="Wake up now"
                    >
                      <FaUndo />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Quick Snooze Options */}
                <div className="flex gap-2 mt-3">
                  <span className="text-xs text-gray-500 self-center">Snooze again:</span>
                  {['15m', '1h', '4h', 'Tomorrow'].map((option) => {
                    const getNewTime = () => {
                      const now = new Date();
                      if (option === '15m') return new Date(now.getTime() + 15 * 60000);
                      if (option === '1h') return new Date(now.getTime() + 60 * 60000);
                      if (option === '4h') return new Date(now.getTime() + 4 * 60 * 60000);
                      const tomorrow = new Date(now);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(9, 0, 0, 0);
                      return tomorrow;
                    };
                    return (
                      <button
                        key={option}
                        onClick={() => handleReschedule(item.id, getNewTime())}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Snooze Stats */}
      {items.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⏰ <strong>Tip:</strong> You've snoozed items {items.reduce((acc, i) => acc + i.snoozeCount, 0)} times.
            Consider tackling them now or rescheduling to a specific time.
          </p>
        </div>
      )}
    </div>
  );
};

export default SnoozeManager;
