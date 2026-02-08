import React, { useState } from 'react';
import { FaBrain, FaBell, FaClock, FaExclamationTriangle, FaLightbulb, FaCheck, FaTimes, FaCog } from 'react-icons/fa';

const SmartAlerts = ({ alerts: initialAlerts = [], onDismiss, onAction, onSnooze }) => {
  const defaultAlerts = [
    { id: 1, type: 'deadline', priority: 'high', title: 'Deadline Risk Detected', message: 'Project proposal may not be completed on time based on your current pace.', suggestion: 'Block 2 hours tomorrow morning for focused work', time: new Date() },
    { id: 2, type: 'meeting', priority: 'medium', title: 'Meeting Overlap', message: 'You have back-to-back meetings for 4 hours today.', suggestion: 'Consider declining one meeting or requesting async update', time: new Date(Date.now() - 1800000) },
    { id: 3, type: 'productivity', priority: 'low', title: 'Productivity Insight', message: 'You complete 40% more tasks between 9-11 AM.', suggestion: 'Schedule your most important task during this window', time: new Date(Date.now() - 3600000) },
    { id: 4, type: 'workload', priority: 'medium', title: 'Workload Alert', message: 'You have 15 tasks due this week, above your usual 10.', suggestion: 'Delegate or reschedule 3 low-priority tasks', time: new Date(Date.now() - 7200000) },
  ];

  const [alerts, setAlerts] = useState(initialAlerts.length > 0 ? initialAlerts : defaultAlerts);
  const [expandedId, setExpandedId] = useState(null);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deadline': return FaExclamationTriangle;
      case 'meeting': return FaClock;
      case 'productivity': return FaLightbulb;
      default: return FaBrain;
    }
  };

  const handleDismiss = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    onDismiss?.(id);
  };

  const handleSnooze = (id, duration) => {
    setAlerts(alerts.filter(a => a.id !== id));
    onSnooze?.(id, duration);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBrain className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Alerts</h3>
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm rounded-full">
              {alerts.length} active
            </span>
          )}
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <FaCog />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaBell className="mx-auto text-4xl mb-3 opacity-30" />
          <p>No active alerts</p>
          <p className="text-sm mt-1">AI is monitoring your schedule</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const TypeIcon = getTypeIcon(alert.type);
            const isExpanded = expandedId === alert.id;
            
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getPriorityStyles(alert.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                    alert.priority === 'high' ? 'bg-red-100 dark:bg-red-900/50' :
                    alert.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                    'bg-blue-100 dark:bg-blue-900/50'
                  }`}>
                    <TypeIcon className={`${
                      alert.priority === 'high' ? 'text-red-600' :
                      alert.priority === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    {/* AI Suggestion */}
                    <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FaLightbulb className="text-yellow-500" />
                        <span className="font-medium">AI Suggestion:</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.suggestion}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onAction?.(alert)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                      >
                        <FaCheck /> Take Action
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                      >
                        Snooze
                      </button>
                    </div>

                    {/* Snooze Options */}
                    {isExpanded && (
                      <div className="flex gap-2 mt-2">
                        {['1 hour', '4 hours', 'Tomorrow', 'Next week'].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSnooze(alert.id, option)}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartAlerts;

