import React from 'react';
import { FaRobot, FaComments, FaMagic } from 'react-icons/fa';
import AIChatComponent from '@components/ai/AIChat';
import { useAIContext } from '@contexts/AIContext';

const AIChatPage = () => {
  const { aiEnabled, setAiEnabled } = useAIContext();

  if (!aiEnabled) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <FaRobot className="text-primary-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
          <FaRobot size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Assistant Disabled</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            AI features are currently turned off. Enable them to start chatting with your AI assistant.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="mr-3 text-gray-700 dark:text-gray-300">AI Assistant</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaRobot className="text-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Assistant</h2>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Online
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {aiEnabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-96">
          <AIChatComponent />
        </div>
      </div>
    </div>
  );
};

export default AIChat;