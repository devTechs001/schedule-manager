import React from 'react';
import { FaMedal, FaTrophy, FaStar, FaFire, FaRocket, FaBolt, FaCrown, FaGem } from 'react-icons/fa';

const AchievementBadges = ({ achievements = [], onViewDetails }) => {
  const defaultAchievements = [
    { id: 1, name: 'First Task', description: 'Complete your first task', icon: FaStar, color: 'yellow', earned: true, earnedDate: '2026-02-01' },
    { id: 2, name: 'Week Warrior', description: 'Complete 7 days streak', icon: FaFire, color: 'orange', earned: true, earnedDate: '2026-02-05' },
    { id: 3, name: 'Productivity Pro', description: 'Complete 100 tasks', icon: FaRocket, color: 'blue', earned: false, progress: 75 },
    { id: 4, name: 'Speed Demon', description: 'Complete 10 tasks in one day', icon: FaBolt, color: 'purple', earned: false, progress: 40 },
    { id: 5, name: 'Team Player', description: 'Collaborate on 50 tasks', icon: FaCrown, color: 'green', earned: false, progress: 20 },
    { id: 6, name: 'Diamond Focus', description: 'Complete 100 focus sessions', icon: FaGem, color: 'cyan', earned: false, progress: 60 },
  ];

  const allAchievements = achievements.length > 0 ? achievements : defaultAchievements;
  const earnedCount = allAchievements.filter(a => a.earned).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-yellow-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h3>
        </div>
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
          {earnedCount}/{allAchievements.length} Earned
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {allAchievements.map((achievement) => (
          <button
            key={achievement.id}
            onClick={() => onViewDetails?.(achievement)}
            className={`relative p-4 rounded-lg text-center transition-all ${
              achievement.earned
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700'
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 opacity-60'
            }`}
          >
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              achievement.earned
                ? `bg-${achievement.color}-100 dark:bg-${achievement.color}-900/50`
                : 'bg-gray-200 dark:bg-gray-600'
            }`}>
              <achievement.icon className={`text-xl ${
                achievement.earned ? `text-${achievement.color}-500` : 'text-gray-400'
              }`} />
            </div>
            <h4 className={`font-medium text-sm ${
              achievement.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500'
            }`}>
              {achievement.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
            
            {!achievement.earned && achievement.progress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">{achievement.progress}%</span>
              </div>
            )}

            {achievement.earned && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FaStar className="text-white text-xs" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recent Achievement */}
      {earnedCount > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white">
          <p className="text-sm opacity-80">Most Recent Achievement</p>
          <div className="flex items-center gap-3 mt-2">
            <FaMedal className="text-2xl" />
            <div>
              <p className="font-bold">{allAchievements.find(a => a.earned)?.name}</p>
              <p className="text-sm opacity-80">
                Earned on {new Date(allAchievements.find(a => a.earned)?.earnedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;

