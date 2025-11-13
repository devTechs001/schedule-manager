import { differenceInDays, differenceInHours } from 'date-fns';

export const calculateTaskPriority = async (task) => {
  let score = 0;
  const factors = [];

  // Base priority weight
  const priorityWeights = { high: 40, medium: 25, low: 10 };
  const priorityScore = priorityWeights[task.priority] || 0;
  score += priorityScore;
  factors.push({ factor: 'Priority Level', score: priorityScore });

  // Due date urgency
  if (task.dueDate) {
    const daysUntilDue = differenceInDays(new Date(task.dueDate), new Date());
    const hoursUntilDue = differenceInHours(new Date(task.dueDate), new Date());

    let urgencyScore = 0;
    if (hoursUntilDue < 0) {
      urgencyScore = 30; // Overdue
    } else if (hoursUntilDue <= 24) {
      urgencyScore = 25; // Due within 24 hours
    } else if (daysUntilDue <= 3) {
      urgencyScore = 20; // Due within 3 days
    } else if (daysUntilDue <= 7) {
      urgencyScore = 10; // Due within a week
    } else {
      urgencyScore = 5; // Due later
    }

    score += urgencyScore;
    factors.push({ factor: 'Urgency', score: urgencyScore });
  }

  // Status weight
  const statusWeights = { 'in-progress': 15, 'todo': 10, 'completed': 0 };
  const statusScore = statusWeights[task.status] || 0;
  score += statusScore;
  factors.push({ factor: 'Current Status', score: statusScore });

  // Subtasks completion
  if (task.subtasks && task.subtasks.length > 0) {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const subtaskProgress = (completedSubtasks / task.subtasks.length) * 10;
    score += subtaskProgress;
    factors.push({ factor: 'Subtask Progress', score: Math.round(subtaskProgress) });
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(Math.round(score), 100);

  return {
    score: normalizedScore,
    factors,
    recommendation: getRecommendation(normalizedScore),
  };
};

const getRecommendation = (score) => {
  if (score >= 80) {
    return 'Urgent - Address this task immediately';
  } else if (score >= 60) {
    return 'High Priority - Schedule time for this task today';
  } else if (score >= 40) {
    return 'Medium Priority - Plan to complete this week';
  } else {
    return 'Low Priority - Can be scheduled for later';
  }
};