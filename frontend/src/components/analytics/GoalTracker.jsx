import React, { useState } from 'react';
import { FaBullseye, FaPlus, FaCheck, FaTrash, FaEdit } from 'react-icons/fa';

const GoalTracker = ({ goals: initialGoals = [], onUpdate }) => {
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: 100, current: 0, unit: 'tasks' });

  const addGoal = () => {
    if (!newGoal.title) return;
    const goal = { ...newGoal, id: Date.now(), createdAt: new Date() };
    const updated = [...goals, goal];
    setGoals(updated);
    onUpdate?.(updated);
    setNewGoal({ title: '', target: 100, current: 0, unit: 'tasks' });
    setShowForm(false);
  };

  const updateProgress = (id, increment) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, g.current + increment)) } : g
    );
    setGoals(updated);
    onUpdate?.(updated);
  };

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    onUpdate?.(updated);
  };

  const getProgress = (goal) => Math.round((goal.current / goal.target) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBullseye className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goal Tracker</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          <FaPlus />
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          <input
            type="text"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Goal title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
              placeholder="Target"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              value={newGoal.current}
              onChange={(e) => setNewGoal({ ...newGoal, current: parseInt(e.target.value) || 0 })}
              placeholder="Current"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              placeholder="Unit"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={addGoal}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Add Goal
          </button>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No goals set. Add your first goal to start tracking!
          </p>
        ) : (
          goals.map((goal) => {
            const progress = getProgress(goal);
            const isComplete = progress >= 100;
            return (
              <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isComplete && <FaCheck className="text-green-500" />}
                    <h4 className={`font-medium ${isComplete ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                      {goal.title}
                    </h4>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-gray-400 hover:text-red-500">
                    <FaTrash size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateProgress(goal.id, -1)}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300"
                    >-</button>
                    <button
                      onClick={() => updateProgress(goal.id, 1)}
                      className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
                    >+</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalTracker;

