import React, { useEffect } from 'react';
import { FaGift } from 'react-icons/fa';
import { useTasks } from '@hooks/useTasks';
import { usePoints } from '@hooks/usePoints';
import RewardsStoreComponent from '@components/gamification/RewardsStore';

/**
 * Rewards.
 *
 * The point balance used to be `${Math.floor(Math.random() * 500)} points` in
 * the header and a hard-coded 1250 default inside the store — two different
 * numbers on the same screen, neither real. Both now read the same derived
 * balance from completed tasks (see usePoints).
 */
const RewardsPage = () => {
  const { tasks } = useTasks();
  const { points } = usePoints(tasks);

  useEffect(() => {
    document.title = 'Rewards — SchedAI';
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rewards</h1>
          <p className="page-subtitle">Spend points earned by completing tasks and keeping your streak.</p>
        </div>
        <span className="badge badge-accent">{points.toLocaleString()} points</span>
      </div>

      <RewardsStoreComponent userPoints={points} />
    </div>
  );
};

export default RewardsPage;
