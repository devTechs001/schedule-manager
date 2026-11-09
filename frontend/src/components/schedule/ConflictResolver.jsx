import React, { useState } from 'react';
import { FaExclamationTriangle, FaCalendarAlt, FaClock, FaCheck, FaArrowRight, FaLightbulb, FaExchangeAlt } from 'react-icons/fa';

const ConflictResolver = ({ conflicts: initialConflicts = [], onResolve, onReschedule }) => {

  const [conflicts, setConflicts] = useState(initialConflicts);
  const [resolvedIds, setResolvedIds] = useState([]);

  const handleResolve = (conflictId, suggestion) => {
    setResolvedIds([...resolvedIds, conflictId]);
    onResolve?.(conflictId, suggestion);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  const unresolvedConflicts = conflicts.filter(c => !resolvedIds.includes(c.id));

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-semibold text-content">Schedule Conflicts</h3>
          {unresolvedConflicts.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full">
              {unresolvedConflicts.length} conflicts
            </span>
          )}
        </div>
      </div>

      {unresolvedConflicts.length === 0 ? (
        <div className="text-center py-8 text-content-muted">
          <FaCheck className="mx-auto text-4xl mb-3 text-green-500" />
          <p className="text-green-600">No scheduling conflicts!</p>
          <p className="text-sm mt-1">Your calendar is conflict-free</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unresolvedConflicts.map((conflict) => (
            <div key={conflict.id} className="p-4 rounded-lg border-2 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2 mb-4">
                <FaExchangeAlt className="text-red-500" />
                <span className="font-medium text-content">
                  Overlapping Events
                </span>
              </div>

              {/* Conflicting Events */}
              <div className="space-y-3 mb-4">
                {conflict.events.map((event, i) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className={`w-1 h-12 rounded-full bg-${getPriorityColor(event.priority)}-500`} />
                    <div className="flex-1 p-3 bg-surface rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-content">{event.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${getPriorityColor(event.priority)}-100 text-${getPriorityColor(event.priority)}-700 capitalize`}>
                          {event.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-content-muted mt-1">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {event.start} - {event.end}
                        </span>
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    {i < conflict.events.length - 1 && (
                      <div className="absolute left-1/2 -translate-x-1/2">
                        <FaExchangeAlt className="text-red-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  <FaLightbulb className="text-yellow-500" />
                  AI Suggestions
                </div>
                <div className="space-y-2">
                  {conflict.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-content">
                        {suggestion.action === 'reschedule' && (
                          <>Reschedule to {suggestion.newTime}</>
                        )}
                        {suggestion.action === 'shorten' && (
                          <>Shorten to {suggestion.duration} min</>
                        )}
                        {suggestion.action === 'decline' && (
                          <>Decline meeting</>
                        )}
                        <span className="text-content-muted ml-1">- {suggestion.reason}</span>
                      </span>
                      <button
                        onClick={() => handleResolve(conflict.id, suggestion)}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Resolution */}
              <div className="flex gap-2">
                <button
                  onClick={() => onReschedule?.(conflict)}
                  className="flex-1 py-2 bg-surface-sunken hover:bg-surface-sunken text-content rounded-lg text-sm"
                >
                  Choose Different Time
                </button>
                <button
                  onClick={() => setResolvedIds([...resolvedIds, conflict.id])}
                  className="px-4 py-2 text-content-muted hover:text-content text-sm"
                >
                  Ignore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Summary */}
      {resolvedIds.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <FaCheck />
            <span className="font-medium">{resolvedIds.length} conflict(s) resolved</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictResolver;

