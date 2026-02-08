import React from 'react';
import { FaTasks, FaBolt, FaFlag } from 'react-icons/fa';
import ChallengesComponent from '@components/gamification/Challenges';

const ChallengesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaFlag className="text-red-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenges</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Challenges</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {Math.floor(Math.random() * 3)} active
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <ChallengesComponent />
        </div>
      </div>
    </div>
  );
};

export default Challenges;