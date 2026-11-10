import React, { useEffect } from 'react';
import { useTasks } from '@hooks/useTasks';
import PredictiveSchedulerComponent from '@components/ai/PredictiveScheduler';

/**
 * Predictive scheduler.
 *
 * The scheduling rule (priority → time of day, rolled to tomorrow if the slot
 * has passed) is deterministic and stays. Suggestions are labelled by rule
 * strength rather than a fabricated confidence percentage.
 */
const PredictiveSchedulerPage = () => {
  const { tasks } = useTasks();

  useEffect(() => {
    document.title = 'Scheduler suggestions — SchedAI';
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scheduler suggestions</h1>
          <p className="page-subtitle">
            Suggested time slots for unscheduled tasks, based on priority and due dates.
          </p>
        </div>
      </div>

      <PredictiveSchedulerComponent tasks={Array.isArray(tasks) ? tasks : []} />
    </div>
  );
};

export default PredictiveSchedulerPage;
