import React from 'react';
import { FaTrophy, FaChartBar, FaFire } from 'react-icons/fa';
import LeaderboardComponent from '@components/gamification/Leaderboard';

const LeaderboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FaTrophy className="text-yellow-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Productivity Leaderboard</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Weekly
          </span>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <LeaderboardComponent />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;