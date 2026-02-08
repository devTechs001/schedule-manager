import React, { useState } from 'react';
import { FaFire, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

const HabitFormation = ({ habits: initialHabits = [], onUpdate }) => {
  const [habits, setHabits] = useState(initialHabits);
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit = {
      id: Date.now(),
      name: newHabit,
      streak: 0,
      completedDays: [],
      createdAt: new Date(),
    };
    const updated = [...habits, habit];
    setHabits(updated);
    onUpdate?.(updated);
    setNewHabit('');
  };

  const toggleToday = (habitId) => {
    const today = new Date().toDateString();
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const completed = h.completedDays.includes(today);
      const newCompletedDays = completed
        ? h.completedDays.filter(d => d !== today)
        : [...h.completedDays, today];
      return {
        ...h,
        completedDays: newCompletedDays,
        streak: calculateStreak(newCompletedDays),
      };
    });
    setHabits(updated);
    onUpdate?.(updated);
  };

  const calculateStreak = (completedDays) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (completedDays.includes(date.toDateString())) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const isCompletedOnDay = (habit, date) => {
    return habit.completedDays.includes(date.toDateString());
  };

  const deleteHabit = (id) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    onUpdate?.(updated);
  };

  const days = getLast7Days();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaFire className="text-orange-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Habit Tracker</h3>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          placeholder="New habit..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          <FaPlus />
        </button>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No habits yet. Start building good habits today!
          </p>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{habit.name}</h4>
                  {habit.streak > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded text-sm">
                      <FaFire /> {habit.streak}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex justify-between">
                {days.map((day) => {
                  const isCompleted = isCompletedOnDay(habit, day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => isToday && toggleToday(habit.id)}
                      disabled={!isToday}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      } ${isToday ? 'ring-2 ring-primary-500 cursor-pointer' : 'cursor-default opacity-75'}`}
                    >
                      {isCompleted ? <FaCheck /> : day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HabitFormation;

