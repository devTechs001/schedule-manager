import React, { useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { useTasks } from '@hooks/useTasks';
import { usePoints } from '@hooks/usePoints';
import LeaderboardComponent from '@components/gamification/Leaderboard';

/**
 * Leaderboard page.
 *
 * Feeds the leaderboard one real row: the signed-in user's own score, derived
 * from completed tasks. The component used to fall back to seven invented
 * people whenever nothing was passed in — which was always, because this page
 * passed nothing.
 */
const LeaderboardPage = () => {
  const { tasks } = useTasks();
  const { points, completedCount } = usePoints(tasks);

  useEffect(() => {
    document.title = 'Leaderboard — SchedAI';
  }, []);

  const entries = points > 0
    ? [{ id: 'me', name: 'You', avatar: 'Y', points, tasksCompleted: completedCount, isCurrentUser: true }]
    : [];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Your score, earned by finishing real work.</p>
        </div>
        <span className="badge badge-accent">{points.toLocaleString()} points</span>
      </div>

      <div className="mb-1 flex items-center gap-2 text-sm text-content-muted">
        <FaTrophy className="text-yellow-500" />
        Scores come from completed tasks: 10 points each, +5 when finished on
        time, +25 per streak day (up to 7).
      </div>

      <LeaderboardComponent
        entries={entries}
        subtitle="Your standing is your own score. The app does not record scores for other people."
      />
    </div>
  );
};

export default LeaderboardPage;
