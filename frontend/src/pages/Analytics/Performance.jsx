import React from 'react';
import { FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa';
import PerformanceDashboardComponent from '@components/analytics/PerformanceDashboard';

const PerformanceAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaChartBar className="text-green-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Updated daily
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <PerformanceDashboardComponent />
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsPage;