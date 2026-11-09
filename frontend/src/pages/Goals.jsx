import React, { useEffect, useState } from 'react';
import {
  FaBullseye,
  FaPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaFire,
  FaMinus,
} from 'react-icons/fa';
import ProgressBar from '@components/ui/ProgressBar';
import EmptyState from '@components/ui/EmptyState';
import { useGoals, todayKey } from '@hooks/useGoals';

/**
 * Goals & habits.
 *
 * Two things people actually track alongside a schedule: finite goals with a
 * numeric target, and repeating habits with a daily streak. Everything persists
 * locally and survives a refresh. Nothing is invented for a new user.
 */

const GoalRow = ({ goal, onUpdate, onRemove }) => {
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.progress / goal.target) * 100)) : 0;
  const done = pct >= 100;

  return (
    <li className="rounded-xl border border-line bg-surface-raised p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-content">{goal.title}</p>
          <p className="mt-0.5 text-[0.68rem] text-content-subtle">
            {goal.progress}
            {goal.unit ? ` ${goal.unit}` : ''} of {goal.target}
            {goal.unit ? ` ${goal.unit}` : ''}
            {goal.dueDate ? ` · due ${new Date(goal.dueDate).toLocaleDateString()}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdate(goal.id, { progress: Math.max(0, goal.progress - 1) })}
            className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-surface-sunken"
            aria-label="Decrease progress"
          >
            <FaMinus size={9} />
          </button>
          <button
            type="button"
            onClick={() => onUpdate(goal.id, { progress: goal.progress + 1 })}
            className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-surface-sunken"
            aria-label="Increase progress"
          >
            <FaPlus size={9} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(goal.id)}
            className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
            aria-label={`Delete ${goal.title}`}
          >
            <FaTrash size={9} />
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <ProgressBar
          value={pct}
          showLabel
          size="sm"
          color={done ? "green" : "primary"}
          labelPosition="right"
        />
      </div>
    </li>
  );
};

const Goals = () => {
  const {
    goals,
    habits,
    addGoal,
    updateGoal,
    removeGoal,
    addHabit,
    toggleHabitToday,
    removeHabit,
    streakOf,
  } = useGoals();

  const [addingGoal, setAddingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', target: '10', unit: '', dueDate: '' });
  const [habitName, setHabitName] = useState('');

  useEffect(() => {
    document.title = 'Goals & habits — SchedAI';
  }, []);

  const submitGoal = () => {
    if (!goalForm.title.trim()) return;
    addGoal({
      title: goalForm.title.trim(),
      target: Number(goalForm.target) || 1,
      unit: goalForm.unit.trim(),
      dueDate: goalForm.dueDate || null,
    });
    setGoalForm({ title: '', target: '10', unit: '', dueDate: '' });
    setAddingGoal(false);
  };

  const submitHabit = () => {
    if (!habitName.trim()) return;
    addHabit(habitName.trim());
    setHabitName('');
  };

  const today = todayKey();

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals &amp; habits</h1>
          <p className="page-subtitle">
            Track what you are working toward, and the routines that get you there.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Goals */}
        <section className="card">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-content">Goals</h2>
            {!addingGoal && (
              <button type="button" onClick={() => setAddingGoal(true)} className="btn btn-ghost btn-sm">
                <FaPlus size={9} /> Add
              </button>
            )}
          </div>

          {addingGoal && (
            <div className="space-y-2 border-b border-line p-3">
              <input
                type="text"
                value={goalForm.title}
                onChange={(event) => setGoalForm((f) => ({ ...f, title: event.target.value }))}
                placeholder="What do you want to achieve?"
                maxLength={140}
                autoFocus
                className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  value={goalForm.target}
                  onChange={(event) => setGoalForm((f) => ({ ...f, target: event.target.value }))}
                  placeholder="Target"
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400"
                  aria-label="Target"
                />
                <input
                  type="text"
                  value={goalForm.unit}
                  onChange={(event) => setGoalForm((f) => ({ ...f, unit: event.target.value }))}
                  placeholder="Unit"
                  maxLength={16}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400"
                  aria-label="Unit"
                />
                <input
                  type="date"
                  value={goalForm.dueDate}
                  onChange={(event) => setGoalForm((f) => ({ ...f, dueDate: event.target.value }))}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400"
                  aria-label="Due date"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={submitGoal} className="btn btn-primary btn-sm">
                  <FaCheck size={9} /> Add goal
                </button>
                <button
                  type="button"
                  onClick={() => setAddingGoal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="p-3">
            {goals.length === 0 ? (
              <p className="px-1 py-8 text-center text-xs text-content-subtle">
                No goals yet. Add one to start tracking progress.
              </p>
            ) : (
              <ul className="space-y-2">
                {goals.map((goal) => (
                  <GoalRow key={goal.id} goal={goal} onUpdate={updateGoal} onRemove={removeGoal} />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Habits */}
        <section className="card">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-content">Habits</h2>
            <p className="mt-0.5 text-[0.68rem] text-content-muted">
              Tick one off each day to build a streak.
            </p>
          </div>

          <div className="flex gap-2 border-b border-line p-3">
            <input
              type="text"
              value={habitName}
              onChange={(event) => setHabitName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitHabit()}
              placeholder="e.g. Read for 20 minutes"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
              aria-label="New habit"
            />
            <button
              type="button"
              onClick={submitHabit}
              disabled={!habitName.trim()}
              className="btn btn-primary btn-sm shrink-0 disabled:opacity-50"
            >
              <FaPlus size={9} /> Add
            </button>
          </div>

          <div className="p-3">
            {habits.length === 0 ? (
              <p className="px-1 py-8 text-center text-xs text-content-subtle">
                No habits yet. Add one above.
              </p>
            ) : (
              <ul className="space-y-2">
                {habits.map((habit) => {
                  const doneToday = Boolean(habit.days[today]);
                  const streak = streakOf(habit.days);
                  return (
                    <li
                      key={habit.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          doneToday
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-line text-transparent hover:border-emerald-400'
                        }`}
                        aria-label={
                          doneToday ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`
                        }
                        aria-pressed={doneToday}
                      >
                        <FaCheck size={10} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-content">{habit.name}</p>
                        <p className="flex items-center gap-1 text-[0.63rem] text-content-subtle">
                          {streak > 0 ? (
                            <>
                              <FaFire size={8} className="text-amber-500" />
                              {streak} day{streak === 1 ? '' : 's'} in a row
                            </>
                          ) : (
                            'No streak yet'
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeHabit(habit.id)}
                        className="shrink-0 rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                        aria-label={`Delete ${habit.name}`}
                      >
                        <FaTrash size={9} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {goals.length === 0 && habits.length === 0 && (
        <EmptyState
          icon={<FaBullseye size={20} />}
          title="Start with one goal, or one habit"
          description="Goals have a target and count toward it. Habits repeat daily and build a streak. Both stay on this device."
        />
      )}
    </div>
  );
};

export default Goals;
