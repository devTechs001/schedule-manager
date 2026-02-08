import React from 'react';
import { FaCalendar, FaRobot, FaVideo } from 'react-icons/fa';
import MeetingAssistantComponent from '@components/ai/MeetingAssistant';

const MeetingAssistantPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaRobot className="text-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting Assistant</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Meeting Assistant</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            Automated
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <MeetingAssistantComponent />
        </div>
      </div>
    </div>
  );
};

export default MeetingAssistant;