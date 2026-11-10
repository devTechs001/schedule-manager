import React from 'react';
/*
 * Named AIPriority historically, but nothing here calls a model: the score is
 * priority weight + urgency + in-progress. The UI says so rather than
 * implying an inference. Deterministic scoring is more predictable for the
 * user anyway, since the same task always gets the same number.
 */
import { FaFlag, FaSortAmountDown } from 'react-icons/fa';
import Badge from '@components/ui/Badge';
import Card from '@components/ui/Card';

const AIPriority = ({ tasks, onReorder }) => {
  const priorityScores = tasks.map(task => ({
    ...task,
    aiScore: calculatePriorityScore(task),
  })).sort((a, b) => b.aiScore - a.aiScore);

  function calculatePriorityScore(task) {
    let score = 0;
    
    // Priority weight
    const priorityWeight = { high: 30, medium: 20, low: 10 };
    score += priorityWeight[task.priority] || 0;
    
    // Due date weight
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) score += 30;
      else if (daysUntilDue <= 3) score += 20;
      else if (daysUntilDue <= 7) score += 10;
    }
    
    // Status weight
    if (task.status === 'in-progress') score += 15;
    
    return Math.min(score, 100);
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'danger';
    if (score >= 40) return 'warning';
    return 'success';
  };

  return (
    <Card
      title="Priority ranking"
      subtitle="Ranked by priority, due date and status — a fixed rule set, not a model"
    >
      <div className="space-y-3">
        {priorityScores.map((task, index) => (
          <div
            key={task._id}
            className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 bg-surface-sunken rounded-full font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-content truncate">
                  {task.title}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'} size="xs">
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary" size="xs">
                    {task.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <Badge variant={getScoreColor(task.aiScore)} size="sm">
                <FaFlag className="mr-1" size={10} />
                {task.aiScore}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-content-muted text-center py-8">
          No tasks to rank yet
        </p>
      )}
    </Card>
  );
};

export default AIPriority;