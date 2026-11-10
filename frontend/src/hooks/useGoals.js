import { useCallback, useEffect, useState } from 'react';

/**
 * useGoals — personal goals and recurring habits.
 *
 * Stored locally (they are personal tracking data, not shared records), with
 * the same defensive normalisation as the notes store so one corrupt record
 * cannot blank the page.
 */

const GOALS_KEY = 'schedai:goals';
const HABITS_KEY = 'schedai:habits';

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const readArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
};

const writeArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked — in-memory state still works for this session */
  }
  return value;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const normaliseGoal = (goal) => ({
  id: goal.id || uid('goal'),
  title: String(goal.title || 'Untitled goal'),
  target: Number.isFinite(goal.target) && goal.target > 0 ? goal.target : 1,
  progress: Number.isFinite(goal.progress) ? Math.max(0, goal.progress) : 0,
  unit: goal.unit || '',
  dueDate: goal.dueDate || null,
  createdAt: goal.createdAt || new Date().toISOString(),
});

const normaliseHabit = (habit) => ({
  id: habit.id || uid('habit'),
  name: String(habit.name || 'Untitled habit'),
  // Map of YYYY-MM-DD -> true for each day completed.
  days: habit.days && typeof habit.days === 'object' ? habit.days : {},
  createdAt: habit.createdAt || new Date().toISOString(),
});

/** Consecutive days ending today (or yesterday, so today isn't required yet). */
const streakOf = (days) => {
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to still count if today hasn't been ticked yet.
  if (!days[todayKey()]) cursor.setDate(cursor.getDate() - 1);
  while (streak < 3650) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days[key]) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const useGoals = () => {
  const [goals, setGoals] = useState(() => readArray(GOALS_KEY).map(normaliseGoal));
  const [habits, setHabits] = useState(() => readArray(HABITS_KEY).map(normaliseHabit));

  useEffect(() => {
    writeArray(GOALS_KEY, goals);
  }, [goals]);

  useEffect(() => {
    writeArray(HABITS_KEY, habits);
  }, [habits]);

  const addGoal = useCallback((data) => {
    const goal = normaliseGoal({ ...data, id: uid('goal') });
    setGoals((prev) => [goal, ...prev]);
    return goal;
  }, []);

  const updateGoal = useCallback((id, patch) => {
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
  }, []);

  const removeGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  const addHabit = useCallback((name) => {
    const habit = normaliseHabit({ name, id: uid('habit') });
    setHabits((prev) => [habit, ...prev]);
    return habit;
  }, []);

  const toggleHabitToday = useCallback((id) => {
    const today = todayKey();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const days = { ...habit.days };
        if (days[today]) delete days[today];
        else days[today] = true;
        return { ...habit, days };
      })
    );
  }, []);

  const removeHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }, []);

  return {
    goals,
    habits,
    addGoal,
    updateGoal,
    removeGoal,
    addHabit,
    toggleHabitToday,
    removeHabit,
    streakOf,
    todayKey,
  };
};

export { streakOf, todayKey };
export default useGoals;
