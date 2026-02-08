import React, { useState } from 'react';
import { FaGift, FaCoins, FaCheck, FaCoffee, FaHeadphones, FaPalette, FaCrown, FaRocket } from 'react-icons/fa';

const RewardsStore = ({ userPoints = 1250, onRedeem }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [redeemedItems, setRedeemedItems] = useState([]);

  const categories = ['all', 'themes', 'perks', 'badges', 'premium'];

  const rewards = [
    { id: 1, name: 'Coffee Break', description: 'Reminder to take a coffee break', points: 50, icon: FaCoffee, category: 'perks', color: 'brown' },
    { id: 2, name: 'Dark Theme Pro', description: 'Unlock premium dark theme', points: 200, icon: FaPalette, category: 'themes', color: 'purple' },
    { id: 3, name: 'Focus Music', description: '1 hour of focus music', points: 100, icon: FaHeadphones, category: 'perks', color: 'blue' },
    { id: 4, name: 'Crown Badge', description: 'Exclusive crown profile badge', points: 500, icon: FaCrown, category: 'badges', color: 'yellow' },
    { id: 5, name: 'Priority Support', description: '1 week of priority support', points: 1000, icon: FaRocket, category: 'premium', color: 'red' },
    { id: 6, name: 'Custom Theme', description: 'Create your own color theme', points: 750, icon: FaPalette, category: 'themes', color: 'pink' },
  ];

  const filteredRewards = rewards.filter(r =>
    selectedCategory === 'all' || r.category === selectedCategory
  );

  const handleRedeem = (reward) => {
    if (userPoints < reward.points) return;
    if (redeemedItems.includes(reward.id)) return;
    
    setRedeemedItems([...redeemedItems, reward.id]);
    onRedeem?.(reward);
  };

  const isRedeemed = (id) => redeemedItems.includes(id);
  const canAfford = (points) => userPoints >= points;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaGift className="text-pink-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rewards Store</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <FaCoins className="text-yellow-600" />
          <span className="font-bold text-yellow-700 dark:text-yellow-300">{userPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap capitalize ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredRewards.map((reward) => {
          const redeemed = isRedeemed(reward.id);
          const affordable = canAfford(reward.points);
          
          return (
            <div
              key={reward.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                redeemed
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : affordable
                  ? 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  : 'border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-${reward.color}-100 dark:bg-${reward.color}-900/30 flex items-center justify-center mb-3`}>
                <reward.icon className={`text-${reward.color}-500 text-xl`} />
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{reward.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{reward.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FaCoins className="text-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">{reward.points}</span>
                </div>
                
                {redeemed ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <FaCheck /> Owned
                  </span>
                ) : (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!affordable}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      affordable
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {affordable ? 'Redeem' : 'Not enough'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Points Tip */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> Complete tasks and maintain streaks to earn more points faster!
        </p>
      </div>
    </div>
  );
};

export default RewardsStore;

