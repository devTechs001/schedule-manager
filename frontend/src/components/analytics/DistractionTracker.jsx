import React, { useState, useEffect } from 'react';
import { FaBan, FaPlus, FaTrash, FaChartLine } from 'react-icons/fa';

const DistractionTracker = ({ onLog }) => {
  const [distractions, setDistractions] = useState([]);
  const [newDistraction, setNewDistraction] = useState('');
  const [stats, setStats] = useState({ total: 0, byCategory: {} });

  const categories = [
    { value: 'social_media', label: 'Social Media', color: 'blue' },
    { value: 'notifications', label: 'Notifications', color: 'yellow' },
    { value: 'interruptions', label: 'Interruptions', color: 'red' },
    { value: 'browsing', label: 'Web Browsing', color: 'purple' },
    { value: 'other', label: 'Other', color: 'gray' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('other');

  useEffect(() => {
    calculateStats();
  }, [distractions]);

  const calculateStats = () => {
    const byCategory = {};
    categories.forEach(cat => { byCategory[cat.value] = 0; });
    distractions.forEach(d => {
      byCategory[d.category] = (byCategory[d.category] || 0) + 1;
    });
    setStats({ total: distractions.length, byCategory });
  };

  const logDistraction = () => {
    if (!newDistraction.trim()) return;
    const distraction = {
      id: Date.now(),
      text: newDistraction,
      category: selectedCategory,
      timestamp: new Date(),
    };
    setDistractions([distraction, ...distractions]);
    onLog?.(distraction);
    setNewDistraction('');
  };

  const removeDistraction = (id) => {
    setDistractions(distractions.filter(d => d.id !== id));
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBan className="text-red-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Distraction Tracker
        </h3>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {categories.map(cat => (
          <div key={cat.value} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <p className={`text-xl font-bold text-${cat.color}-500`}>
              {stats.byCategory[cat.value] || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{cat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={newDistraction}
          onChange={(e) => setNewDistraction(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && logDistraction()}
          placeholder="What distracted you?"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={logDistraction}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          <FaPlus />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {distractions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No distractions logged. Stay focused! 🎯
          </p>
        ) : (
          distractions.map(d => (
            <div
              key={d.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full bg-${getCategoryColor(d.category)}-500`} />
                <div>
                  <p className="text-gray-900 dark:text-white">{d.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeDistraction(d.id)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DistractionTracker;

