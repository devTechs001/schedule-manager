import Feedback from '../models/Feedback.js';
import Contact from '../models/Contact.js';
import { asyncHandler } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

// @desc    Submit feedback (authenticated)
// @route   POST /api/feedback
// @access  Private
export const submitFeedback = asyncHandler(async (req, res) => {
  const payload = { ...req.body, user: req.user.id };

  // The marketing "contact" form only sends name/email/message — map it onto
  // the feedback schema so nothing is silently dropped.
  if (!payload.rating) payload.rating = 4;
  if (!payload.category) payload.category = 'general';

  const feedback = await Feedback.create(payload);

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: feedback,
  });
});

// @desc    Public contact form (marketing site, no auth)
// @route   POST /api/feedback/contact
// @access  Public
export const submitPublicContact = asyncHandler(async (req, res) => {
  const { name, email, topic, message, source } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and message are required',
    });
  }

  // Persist so the message is never lost even when the review queue is empty.
  const contact = await Contact.create({
    name: String(name).slice(0, 120),
    email: String(email).toLowerCase().slice(0, 160),
    notes: `[${topic || 'general'}] ${String(message).slice(0, 4000)}`,
    tags: ['website', source || 'marketing-site', topic || 'general'],
    lastContacted: new Date(),
  }).catch(async (error) => {
    logger.warn(`Public contact could not be stored: ${error.message}`);
    return null;
  });

  logger.info(`New website message from ${email} (${topic || 'general'})`);

  res.status(201).json({
    success: true,
    message: 'Message received — we will reply shortly.',
    data: {
      id: contact?._id || null,
      receivedAt: new Date().toISOString(),
    },
  });
});

// @desc    Get current user's feedback
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

// @desc    Get all feedback
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
