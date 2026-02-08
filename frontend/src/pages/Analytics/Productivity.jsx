import React from 'react';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';
import ProductivityChartComponent from '@components/analytics/ProductivityChart';

const ProductivityAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaChartLine className="text-indigo-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Productivity Analytics</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Productivity Trends</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            Weekly
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <ProductivityChartComponent />
        </div>
      </div>
    </div>
  );
};

export default ProductivityAnalyticsPage;