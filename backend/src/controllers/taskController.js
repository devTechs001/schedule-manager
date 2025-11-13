import Task from '../models/Task.js';
import { asyncHandler } from '../utils/helpers.js';
import { io } from '../server.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;

  let query = { user: req.user.id };

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by priority
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    data: task,
  });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  const task = await Task.create(req.body);

  // Emit socket event
  const io = req.app.get('io');
  io.to(`user-${req.user.id}`).emit('task:created', task);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Emit socket event
  const io = req.app.get('io');
  io.to(`user-${req.user.id}`).emit('task:updated', task);

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  await task.deleteOne();

  // Emit socket event
  const io = req.app.get('io');
  io.to(`user-${req.user.id}`).emit('task:deleted', req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const formattedStats = {
    total: 0,
    todo: 0,
    'in-progress': 0,
    completed: 0,
  };

  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });

  res.json({
    success: true,
    data: formattedStats,
  });
});