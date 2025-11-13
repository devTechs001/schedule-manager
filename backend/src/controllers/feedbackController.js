import Feedback from '../models/Feedback.js';
import { asyncHandler } from '../utils/helpers.js';

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
export const submitFeedback = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;

  const feedback = await Feedback.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: feedback,
  });
});

// @desc    Get user feedback
// @route   GET /api/feedback
// @access  Private
export const getUserFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: feedback.length,
    data: feedback,
  });
});

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback/all
// @access  Private/Admin
export const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });

  res.json({
    success: true,
    count: feedback.length,
    data: feedback,
  });
});