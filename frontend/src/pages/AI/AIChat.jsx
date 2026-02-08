import React from 'react';
import { FaRobot, FaComments, FaMagic } from 'react-icons/fa';
import AIChatComponent from '@components/ai/AIChat';

const AIChatPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaRobot className="text-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Assistant</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Online
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-96">
          <AIChatComponent />
        </div>
      </div>
    </div>
  );
};

export default AIChat;