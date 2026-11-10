import React, { useEffect, useMemo } from 'react';
import { useTasks } from '@hooks/useTasks';
import { currentStreak } from '@hooks/usePoints';
import ChallengesComponent from '@components/gamification/Challenges';

/**
 * Challenges.
 *
 * Previously this page showed four invented challenges ("Focus Master", 24
 * participants, 100 point reward) and a header count of
 * `${Math.floor(Math.random() * 3)} active`. There is no challenges backend,
 * so the challenges here are derived from tasks the user has actually
 * completed — real progress, real completion state.
 */
const todaysCompletions = (tasks) => {
  const today = new Date().toDateString();
  return (Array.isArray(tasks) ? tasks : []).filter(
    (task) => task.status === 'completed' && task.completedAt && new Date(task.completedAt).toDateString() === today
  ).length;
};

const ChallengesPage = () => {
  const { tasks } = useTasks();

  useEffect(() => {
    document.title = 'Challenges — SchedAI';
  }, []);

  const challenges = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks : [];
    const completed = list.filter((task) => task.status === 'completed');
    const todayCount = todaysCompletions(list);
    const streak = currentStreak(list);

    const build = (id, title, description, target, current, reward) => ({
      id,
      title,
      description,
      type: 'personal',
      status: current >= target ? 'completed' : 'active',
      progress: Math.min(100, Math.round((current / target) * 100)),
      current,
      target,
      reward,
    });

    return [
      build('daily-three', 'Three today', 'Complete 3 tasks today', 3, todayCount, 30),
      build('daily-one', 'First of the day', 'Complete a task today', 1, todayCount, 10),
      build('weekly-ten', 'Ten this week', 'Complete 10 tasks in total', 10, completed.length, 100),
      build('streak-three', 'Three-day streak', 'Finish something three days running', 3, streak, 75),
    ];
  }, [tasks]);

  const activeCount = challenges.filter((challenge) => challenge.status === 'active').length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Challenges</h1>
          <p className="page-subtitle">Goals measured from your own completed tasks.</p>
        </div>
        <span className="badge badge-warning">{activeCount} active</span>
      </div>

      <ChallengesComponent challenges={challenges} />
    </div>
  );
};

export default ChallengesPage;
