import AILog from '../models/AILog.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/helpers.js';
import { getChatCompletion } from '../services/ai/openAIService.js';
import { calculateTaskPriority } from '../services/ai/priorityCalculator.js';
import { generateSuggestions } from '../services/ai/suggestionEngine.js';

// @desc    AI Chat
// @route   POST /api/ai/chat
// @access  Private
export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const startTime = Date.now();

  const response = await getChatCompletion(message);
  const executionTime = Date.now() - startTime;

  // Log AI interaction
  await AILog.create({
    user: req.user.id,
    type: 'chat',
    prompt: message,
    response: response.content,
    model: response.model,
    tokens: response.usage,
    executionTime,
  });

  res.json({
    success: true,
    data: {
      message: response.content,
      model: response.model,
    },
  });
});

// @desc    Get AI suggestions
// @route   POST /api/ai/suggestions
// @access  Private
export const getSuggestions = asyncHandler(async (req, res) => {
  const { context } = req.body;

  const suggestions = await generateSuggestions(req.user.id, context);

  res.json({
    success: true,
    data: suggestions,
  });
});

// @desc    Calculate task priority
// @route   POST /api/ai/priority
// @access  Private
export const calculatePriority = asyncHandler(async (req, res) => {
  const { taskId } = req.body;

  const task = await Task.findOne({ _id: taskId, user: req.user.id });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  const priority = await calculateTaskPriority(task);

  // Update task with AI score
  task.aiScore = priority.score;
  await task.save();

  res.json({
    success: true,
    data: priority,
  });
});

// @desc    Get AI insights
// @route   GET /api/ai/insights
// @access  Private
export const getInsights = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });

  const insights = [];

  // Productivity insight
  const completedToday = tasks.filter(t => 
    t.status === 'completed' && 
    new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  insights.push({
    type: 'productivity',
    title: 'Daily Progress',
    description: `You've completed ${completedToday} task${completedToday !== 1 ? 's' : ''} today!`,
  });

  // Overdue tasks warning
  const overdueTasks = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    t.status !== 'completed'
  ).length;

  if (overdueTasks > 0) {
    insights.push({
      type: 'warning',
      title: 'Overdue Tasks',
      description: `You have ${overdueTasks} overdue task${overdueTasks !== 1 ? 's' : ''}. Consider reviewing them.`,
      action: 'View Overdue Tasks',
    });
  }

  res.json({
    success: true,
    data: insights,
  });
});