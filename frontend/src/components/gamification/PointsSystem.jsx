import React from 'react';
import { FaCoins, FaArrowUp, FaGift, FaHistory, FaTasks, FaClock, FaFire } from 'react-icons/fa';

const PointsSystem = ({ points = 0, history = [], onRedeem }) => {
  const defaultHistory = [
    { id: 1, action: 'Completed task', points: 10, date: new Date(), type: 'earn' },
    { id: 2, action: 'Focus session', points: 25, date: new Date(Date.now() - 3600000), type: 'earn' },
    { id: 3, action: 'Daily streak', points: 50, date: new Date(Date.now() - 7200000), type: 'earn' },
    { id: 4, action: 'Redeemed reward', points: -100, date: new Date(Date.now() - 86400000), type: 'spend' },
  ];

  const allHistory = history.length > 0 ? history : defaultHistory;
  const totalPoints = points || 1250;

  const pointCategories = [
    { label: 'Tasks', icon: FaTasks, points: 450, color: 'blue' },
    { label: 'Focus Time', icon: FaClock, points: 380, color: 'purple' },
    { label: 'Streaks', icon: FaFire, points: 420, color: 'orange' },
  ];

  const getLevel = (pts) => {
    if (pts < 500) return { level: 1, name: 'Beginner', next: 500 };
    if (pts < 1000) return { level: 2, name: 'Achiever', next: 1000 };
    if (pts < 2500) return { level: 3, name: 'Pro', next: 2500 };
    if (pts < 5000) return { level: 4, name: 'Expert', next: 5000 };
    return { level: 5, name: 'Master', next: null };
  };

  const levelInfo = getLevel(totalPoints);
  const progressToNext = levelInfo.next 
    ? ((totalPoints / levelInfo.next) * 100).toFixed(0)
    : 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCoins className="text-yellow-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Points System</h3>
        </div>
        <button
          onClick={onRedeem}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
        >
          <FaGift /> Redeem
        </button>
      </div>

      {/* Total Points & Level */}
      <div className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Points</p>
            <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Level {levelInfo.level}</p>
            <p className="text-xl font-bold">{levelInfo.name}</p>
          </div>
        </div>
        {levelInfo.next && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>{progressToNext}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Points Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {pointCategories.map((cat) => (
          <div key={cat.label} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <cat.icon className={`mx-auto text-${cat.color}-500 text-xl mb-2`} />
            <p className="text-lg font-bold text-gray-900 dark:text-white">{cat.points}</p>
            <p className="text-xs text-gray-500">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* Points History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FaHistory className="text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-white">Recent Activity</h4>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'earn' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {item.type === 'earn' ? (
                    <FaArrowUp className="text-green-500" />
                  ) : (
                    <FaGift className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{item.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`font-bold ${
                item.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.points > 0 ? '+' : ''}{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsSystem;

