import React from 'react';
import { FaClock, FaChartBar, FaStopwatch } from 'react-icons/fa';
import TimeTrackingComponent from '@components/analytics/TimeTracking';

const TimeTrackingPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaClock className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Time Tracking Analytics</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Live tracking
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <TimeTrackingComponent />
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPage;