import React, { useState } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const Leaderboard = ({ users = [], currentUserId, period = 'weekly' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const defaultUsers = [
    { id: 1, name: 'Alex Johnson', avatar: 'A', points: 2450, tasksCompleted: 48, change: 2 },
    { id: 2, name: 'Sarah Williams', avatar: 'S', points: 2280, tasksCompleted: 45, change: -1 },
    { id: 3, name: 'Mike Chen', avatar: 'M', points: 2150, tasksCompleted: 42, change: 1 },
    { id: 4, name: 'Emily Davis', avatar: 'E', points: 1980, tasksCompleted: 38, change: 0 },
    { id: 5, name: 'You', avatar: 'Y', points: 1850, tasksCompleted: 35, change: 3, isCurrentUser: true },
    { id: 6, name: 'James Wilson', avatar: 'J', points: 1720, tasksCompleted: 33, change: -2 },
    { id: 7, name: 'Lisa Brown', avatar: 'L', points: 1650, tasksCompleted: 31, change: 1 },
  ];

  const allUsers = users.length > 0 ? users : defaultUsers;

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500" />;
    if (rank === 2) return <FaMedal className="text-gray-400" />;
    if (rank === 3) return <FaMedal className="text-amber-600" />;
    return <span className="text-gray-500 font-medium">{rank}</span>;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <FaArrowUp className="text-green-500" />;
    if (change < 0) return <FaArrowDown className="text-red-500" />;
    return <FaMinus className="text-gray-400" />;
  };

  const getRankBgColor = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500';
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-700/50';
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20';
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaTrophy className="text-yellow-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leaderboard</h3>
        </div>
        <div className="flex gap-1">
          {['daily', 'weekly', 'monthly', 'all-time'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                selectedPeriod === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {allUsers.slice(0, 3).map((user, i) => {
          const order = [1, 0, 2][i];
          const heights = ['h-24', 'h-32', 'h-20'];
          const sortedUser = allUsers[order];
          return (
            <div key={sortedUser.id} className="text-center">
              <div className={`w-14 h-14 mx-auto rounded-full ${
                order === 0 ? 'bg-yellow-500 ring-4 ring-yellow-300' :
                order === 1 ? 'bg-gray-400' : 'bg-amber-600'
              } flex items-center justify-center text-white text-xl font-bold mb-2`}>
                {sortedUser.avatar}
              </div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{sortedUser.name}</p>
              <p className="text-xs text-gray-500">{sortedUser.points.toLocaleString()} pts</p>
              <div className={`mt-2 ${heights[order]} w-20 ${
                order === 0 ? 'bg-yellow-400' : order === 1 ? 'bg-gray-300' : 'bg-amber-500'
              } rounded-t-lg flex items-center justify-center text-white font-bold`}>
                #{order + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {allUsers.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-3 rounded-lg ${getRankBgColor(index + 1, user.isCurrentUser)}`}
          >
            <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${
                  user.isCurrentUser ? 'text-primary-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {user.name}
                </span>
                {user.isCurrentUser && (
                  <span className="text-xs px-2 py-0.5 bg-primary-600 text-white rounded-full">You</span>
                )}
              </div>
              <span className="text-sm text-gray-500">{user.tasksCompleted} tasks</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">{user.points.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1">
                {getChangeIcon(user.change)}
                <span className="text-xs text-gray-500">{Math.abs(user.change) || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

