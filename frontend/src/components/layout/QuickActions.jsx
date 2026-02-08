import React, { useState } from 'react';
import { FaPlus, FaTasks, FaCalendarPlus, FaEnvelope, FaUserPlus, FaMicrophone, FaClock, FaSearch, FaRocket } from 'react-icons/fa';

const QuickActions = ({ onAction, position = 'bottom-right' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { id: 'new-task', label: 'New Task', icon: FaTasks, color: 'blue' },
    { id: 'new-event', label: 'New Event', icon: FaCalendarPlus, color: 'green' },
    { id: 'compose-email', label: 'Compose Email', icon: FaEnvelope, color: 'purple' },
    { id: 'add-contact', label: 'Add Contact', icon: FaUserPlus, color: 'orange' },
    { id: 'voice-command', label: 'Voice Command', icon: FaMicrophone, color: 'red' },
    { id: 'start-focus', label: 'Start Focus', icon: FaClock, color: 'cyan' },
    { id: 'quick-search', label: 'Quick Search', icon: FaSearch, color: 'gray' },
  ];

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const handleAction = (action) => {
    onAction?.(action);
    setIsExpanded(false);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      {/* Action Buttons */}
      <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center gap-3 justify-end"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className={`px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap transition-all ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              {action.label}
            </span>
            <button
              onClick={() => handleAction(action)}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 bg-${action.color}-500 hover:bg-${action.color}-600`}
            >
              <action.icon />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isExpanded 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        <FaPlus className="text-xl" />
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

// Mini Quick Actions Bar
export const QuickActionsBar = ({ onAction }) => {
  const actions = [
    { id: 'new-task', icon: FaTasks, label: 'Task', color: 'blue' },
    { id: 'new-event', icon: FaCalendarPlus, label: 'Event', color: 'green' },
    { id: 'compose-email', icon: FaEnvelope, label: 'Email', color: 'purple' },
    { id: 'start-focus', icon: FaClock, label: 'Focus', color: 'orange' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action)}
            className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <div className={`w-10 h-10 rounded-full bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center`}>
              <action.icon className={`text-${action.color}-600`} />
            </div>
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
        <button
          onClick={() => onAction?.({ id: 'more' })}
          className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <FaRocket className="text-gray-500" />
          </div>
          <span className="text-xs">More</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;

