import React, { useState, useEffect } from 'react';
import { FaClock, FaCalendarAlt, FaCheckCircle, FaLightbulb } from 'react-icons/fa';

const PredictiveScheduler = ({ tasks = [], onSchedule }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  useEffect(() => {
    if (tasks.length > 0) {
      generateSuggestions();
    }
  }, [tasks]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    // Simulate AI-generated suggestions
    const mockSuggestions = tasks
      .filter(task => !task.scheduledTime)
      .map(task => ({
        taskId: task._id,
        taskTitle: task.title,
        suggestedTime: getOptimalTime(task),
        confidence: Math.random() * 0.3 + 0.7,
        reason: getScheduleReason(task),
      }));
    
    setSuggestions(mockSuggestions);
    setIsLoading(false);
  };

  const getOptimalTime = (task) => {
    const now = new Date();
    const hours = task.priority === 'high' ? 9 : task.priority === 'medium' ? 14 : 16;
    now.setHours(hours, 0, 0, 0);
    if (now < new Date()) {
      now.setDate(now.getDate() + 1);
    }
    return now;
  };

  const getScheduleReason = (task) => {
    if (task.priority === 'high') return 'High priority - scheduled during peak productivity hours';
    if (task.priority === 'medium') return 'Medium priority - scheduled for afternoon focus time';
    return 'Lower priority - scheduled for end of day';
  };

  const toggleSelection = (suggestionId) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const applySelected = () => {
    const toApply = suggestions.filter(s => selectedSuggestions.includes(s.taskId));
    onSchedule?.(toApply);
    setSelectedSuggestions([]);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaLightbulb className="text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Schedule Suggestions
          </h3>
        </div>
        {selectedSuggestions.length > 0 && (
          <button
            onClick={applySelected}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
          >
            Apply Selected ({selectedSuggestions.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No scheduling suggestions available. Add unscheduled tasks to get AI recommendations.
        </p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.taskId}
              onClick={() => toggleSelection(suggestion.taskId)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSuggestions.includes(suggestion.taskId)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {suggestion.taskTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <FaCalendarAlt />
                    <span>{formatTime(suggestion.suggestedTime)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {suggestion.reason}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-green-600">
                    {Math.round(suggestion.confidence * 100)}% match
                  </span>
                  {selectedSuggestions.includes(suggestion.taskId) && (
                    <FaCheckCircle className="text-primary-600 mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveScheduler;

