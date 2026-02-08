import React from 'react';
import { FaCalendar, FaRobot, FaClock } from 'react-icons/fa';
import PredictiveSchedulerComponent from '@components/ai/PredictiveScheduler';

const PredictiveSchedulerPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaRobot className="text-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Predictive Scheduler</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Scheduling</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Smart
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <PredictiveSchedulerComponent />
        </div>
      </div>
    </div>
  );
};

export default PredictiveScheduler;