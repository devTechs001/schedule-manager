import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaBrain } from 'react-icons/fa';
import AIInsightsComponent from '@components/ai/AIInsights';

const AIInsightsPage = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Simulate fetching AI insights
    const sampleInsights = [
      {
        id: 1,
        type: 'productivity',
        title: 'Peak Productivity Hours',
        description: 'Based on your activity, you are most productive between 9 AM and 11 AM.',
        action: 'Optimize schedule'
      },
      {
        id: 2,
        type: 'time',
        title: 'Meeting Optimization',
        description: 'Consider grouping your meetings on Tuesdays and Thursdays to free up focused work time.',
        action: 'Reschedule meetings'
      },
      {
        id: 3,
        type: 'suggestion',
        title: 'Task Prioritization',
        description: 'You have 3 high-priority tasks that could be batched together for efficiency.',
        action: 'View tasks'
      },
      {
        id: 4,
        type: 'warning',
        title: 'Overbooking Alert',
        description: 'You have scheduled 8 hours of meetings tomorrow, leaving little time for focused work.',
        action: 'Review calendar'
      }
    ];

    setInsights(sampleInsights);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaRobot className="text-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Powered by AI
          </span>
        </div>

        <AIInsightsComponent insights={insights} />
      </div>
    </div>
  );
};

export default AIInsights;