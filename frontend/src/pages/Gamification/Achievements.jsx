import React, { useEffect, useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import AchievementBadgesComponent from '@components/gamification/AchievementBadges';
import { currentStreak } from '@hooks/usePoints';

/**
 * Achievements.
 *
 * The header used to read `${Math.floor(Math.random() * 15)} earned` — a
 * different number on every render, and unrelated to the account. Badges are
 * now derived from what the user has actually completed.
 */
const AchievementsPage = () => {
  const { tasks } = useTasks();
  const { events } = useSchedule();

  useEffect(() => {
    document.title = 'Achievements — SchedAI';
  }, []);

  const achievements = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const completed = list.filter((task) => task.status === 'completed');

    const bestStreak = currentStreak(list);

    const eventCount = Array.isArray(events) ? events.length : 0;

    return [
      {
        id: 'first-task',
        name: 'First step',
        description: 'Complete your first task',
        icon: FaStar,
        color: 'yellow',
        earned: completed.length >= 1,
        progress: Math.min(100, completed.length * 100),
      },
      {
        id: 'ten-tasks',
        name: 'Getting going',
        description: 'Complete 10 tasks',
        icon: FaStar,
        color: 'blue',
        earned: completed.length >= 10,
        progress: Math.min(100, Math.round((completed.length / 10) * 100)),
      },
      {
        id: 'streak-3',
        name: 'Three-day streak',
        description: 'Finish something three days running',
        icon: FaStar,
        color: 'orange',
        earned: bestStreak >= 3,
        progress: Math.min(100, Math.round((bestStreak / 3) * 100)),
      },
      {
        id: 'scheduled',
        name: 'Planner',
        description: 'Put 5 events on your calendar',
        icon: FaStar,
        color: 'purple',
        earned: eventCount >= 5,
        progress: Math.min(100, Math.round((eventCount / 5) * 100)),
      },
    ];
  }, [tasks, events]);

  const earnedCount = achievements.filter((achievement) => achievement.earned).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Achievements</h1>
          <p className="page-subtitle">Milestones you have actually reached, measured from your tasks.</p>
        </div>
        <span className="badge badge-success">
          {earnedCount}/{achievements.length} earned
        </span>
      </div>

      <AchievementBadgesComponent achievements={achievements} />
    </div>
  );
};

export default AchievementsPage;
