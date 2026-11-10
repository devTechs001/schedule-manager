import AILog from '../models/AILog.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/helpers.js';
import { getChatCompletion } from '../services/ai/openAIService.js';
import { calculateTaskPriority } from '../services/ai/priorityCalculator.js';
import { generateSuggestions } from '../services/ai/suggestionEngine.js';
import { analyzeDocument, draftReplies, summariseMeeting } from '../services/ai/documentService.js';

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
  const userId = req.user?.id;
  
  /*
   * The public (unauthenticated) endpoint has no data to reason about, so it
   * must not invent insights. Returning an empty list lets the UI show an
   * honest "sign in to see insights" state. The previous version returned
   * canned claims like "great job, you're making good progress" — statements
   * about a user we know nothing about.
   */
  if (!userId) {
    return res.json({ success: true, data: [], reason: 'unauthenticated' });
  }

  const tasks = await Task.find({ user: userId });

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
// @desc    Analyse pasted/uploaded document text
// @route   POST /api/ai/document
// @access  Private
export const analyzeDocumentText = asyncHandler(async (req, res) => {
  const { text, fileName } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'No document text supplied',
    });
  }

  // Guard the request size — 200k chars is far beyond any real document we
  // want to push through the model in one shot.
  if (text.length > 200_000) {
    return res.status(413).json({
      success: false,
      message: 'Document is too large to analyse (limit 200,000 characters)',
    });
  }

  const data = await analyzeDocument(text, { fileName });

  res.json({ success: true, data });
});

// @desc    Draft alternative replies to an incoming message
// @route   POST /api/ai/replies
// @access  Private
export const draftRepliesToMessage = asyncHandler(async (req, res) => {
  const { message, tone, count } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'No message supplied',
    });
  }

  const data = await draftReplies(message, { tone, count });

  res.json({ success: true, data });
});

// @desc    Summarise a meeting transcript and extract action items
// @route   POST /api/ai/meeting
// @access  Private
export const summariseMeetingTranscript = asyncHandler(async (req, res) => {
  const { transcript } = req.body || {};

  if (typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({
      success: false,
      message: 'No transcript supplied',
    });
  }

  if (transcript.length > 100_000) {
    return res.status(413).json({
      success: false,
      message: 'Transcript is too long (limit 100,000 characters)',
    });
  }

  const data = await summariseMeeting(transcript);

  res.json({ success: true, data });
});
