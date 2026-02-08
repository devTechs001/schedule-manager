import React, { useState } from 'react';
import { FaFlag, FaTrophy, FaClock, FaUsers, FaCheck, FaPlay } from 'react-icons/fa';

const Challenges = ({ challenges: initialChallenges = [], onJoin, onComplete }) => {
  const [filter, setFilter] = useState('active');

  const defaultChallenges = [
    { id: 1, title: 'Focus Master', description: 'Complete 5 focus sessions in one day', reward: 100, type: 'personal', status: 'active', progress: 60, endDate: new Date(Date.now() + 86400000), participants: 24 },
    { id: 2, title: 'Team Sprint', description: 'Team completes 50 tasks this week', reward: 500, type: 'team', status: 'active', progress: 75, endDate: new Date(Date.now() + 259200000), participants: 8 },
    { id: 3, title: 'Early Bird', description: 'Complete 3 tasks before 9 AM', reward: 75, type: 'personal', status: 'available', progress: 0, endDate: new Date(Date.now() + 172800000), participants: 156 },
    { id: 4, title: 'Perfect Week', description: 'Maintain 7-day streak', reward: 250, type: 'personal', status: 'completed', progress: 100, participants: 89 },
  ];

  const allChallenges = initialChallenges.length > 0 ? initialChallenges : defaultChallenges;
  const filteredChallenges = allChallenges.filter(c =>
    filter === 'all' || c.status === filter
  );

  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'blue';
      case 'completed': return 'green';
      case 'available': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFlag className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Challenges</h3>
        </div>
        <div className="flex gap-1">
          {['active', 'available', 'completed', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredChallenges.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No challenges found</p>
        ) : (
          filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 ${
                challenge.status === 'active'
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                  : challenge.status === 'completed'
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{challenge.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full bg-${getStatusColor(challenge.status)}-100 dark:bg-${getStatusColor(challenge.status)}-900/30 text-${getStatusColor(challenge.status)}-700 dark:text-${getStatusColor(challenge.status)}-300 capitalize`}>
                      {challenge.status}
                    </span>
                    {challenge.type === 'team' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 flex items-center gap-1">
                        <FaUsers /> Team
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <FaTrophy />
                    <span className="font-bold">{challenge.reward}</span>
                  </div>
                  {challenge.endDate && challenge.status !== 'completed' && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <FaClock />
                      <span>{getTimeLeft(challenge.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {challenge.status !== 'available' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        challenge.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FaUsers /> {challenge.participants} participants
                </span>
                {challenge.status === 'available' && (
                  <button
                    onClick={() => onJoin?.(challenge.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
                  >
                    <FaPlay /> Join Challenge
                  </button>
                )}
                {challenge.status === 'completed' && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <FaCheck /> Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Challenges;

