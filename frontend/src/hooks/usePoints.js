import { useMemo } from 'react';

/**
 * Points, derived from real activity.
 *
 * There is no points table on the server. Rather than invent a balance (the
 * old code fell back to 1250), points are computed from tasks the user has
 * actually completed. The formula is deliberately simple and stated in the UI:
 *
 *   - 10 points per completed task
 *   - +5 bonus when the task was completed on or before its due date
 *   - +25 per day in the current completion streak (max 7 days counted)
 *
 * Changing the weights here changes the numbers everywhere, which is why the
 * calculation lives in one place instead of per-component.
 */
export const POINTS_PER_TASK = 10;
export const POINTS_ON_TIME_BONUS = 5;
export const POINTS_PER_STREAK_DAY = 25;
export const MAX_STREAK_DAYS = 7;

export const pointsForTask = (task) => {
  if (!task || task.status !== 'completed') return 0;

  let points = POINTS_PER_TASK;

  if (task.completedAt && task.dueDate) {
    const done = new Date(task.completedAt).getTime();
    const due = new Date(task.dueDate).getTime();
    if (Number.isFinite(done) && Number.isFinite(due) && done <= due) {
      points += POINTS_ON_TIME_BONUS;
    }
  }

  return points;
};

export const currentStreak = (tasks = []) => {
  const days = new Set(
    (Array.isArray(tasks) ? tasks : [])
      .filter((task) => task?.completedAt)
      .map((task) => new Date(task.completedAt).toDateString())
  );

  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    if (days.has(day.toDateString())) {
      streak += 1;
    } else if (offset === 0) {
      // Nothing yet today does not break a streak that ran through yesterday.
      continue;
    } else {
      break;
    }
  }
  return streak;
};

export const usePoints = (tasks) => {
  return useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const completed = list.filter((task) => task.status === 'completed');

    const taskPoints = completed.reduce((sum, task) => sum + pointsForTask(task), 0);
    const streak = currentStreak(list);
    const streakPoints = Math.min(streak, MAX_STREAK_DAYS) * POINTS_PER_STREAK_DAY;

    const history = [
      { source: 'tasks', points: taskPoints, label: `${completed.length} tasks completed` },
      { source: 'streak', points: streakPoints, label: `${streak}-day streak` },
    ].filter((entry) => entry.points > 0);

    return {
      points: taskPoints + streakPoints,
      history,
      streak,
      completedCount: completed.length,
    };
  }, [tasks]);
};

export default usePoints;
