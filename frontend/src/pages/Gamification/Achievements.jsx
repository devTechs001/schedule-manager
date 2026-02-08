import React from 'react';
import { FaTrophy, FaStar, FaMedal } from 'react-icons/fa';
import AchievementBadgesComponent from '@components/gamification/AchievementBadges';

const AchievementsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaStar className="text-yellow-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Achievements</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {Math.floor(Math.random() * 15)} earned
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <AchievementBadgesComponent />
        </div>
      </div>
    </div>
  );
};

export default Achievements;