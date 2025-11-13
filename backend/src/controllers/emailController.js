import Email from '../models/Email.js';
import { asyncHandler } from '../utils/helpers.js';
import { sendEmail } from '../services/email/emailSender.js';

// @desc    Get all emails
// @route   GET /api/emails
// @access  Private
export const getEmails = asyncHandler(async (req, res) => {
  const { type, read, starred, search } = req.query;

  let query = { user: req.user.id, trash: false };

  if (type) query.type = type;
  if (read !== undefined) query.read = read === 'true';
  if (starred !== undefined) query.starred = starred === 'true';

  if (search) {
    query.$text = { $search: search };
  }

  const emails = await Email.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: emails.length,
    data: emails,
  });
});

// @desc    Get single email
// @route   GET /api/emails/:id
// @access  Private
export const getEmail = asyncHandler(async (req, res) => {
  const email = await Email.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!email) {
    return res.status(404).json({
      success: false,
      message: 'Email not found',
    });
  }

  res.json({
    success: true,
    data: email,
  });
});

// @desc    Send email
// @route   POST /api/emails/send
// @access  Private
export const sendEmailMessage = asyncHandler(async (req, res) => {
  const { to, subject, body, cc, bcc } = req.body;

  // Send email via email service
  await sendEmail({
    from: req.user.email,
    to,
    cc,
    bcc,
    subject,
    text: body,
  });

  // Save to database
  const email = await Email.create({
    user: req.user.id,
    from: req.user.email,
    to: Array.isArray(to) ? to : [to],
    cc,
    bcc,
    subject,
    body,
    type: 'sent',
    read: true,
  });

  res.status(201).json({
    success: true,
    message: 'Email sent successfully',
    data: email,
  });
});

// @desc    Mark email as read
// @route   PATCH /api/emails/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const email = await Email.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );

  if (!email) {
    return res.status(404).json({
      success: false,
      message: 'Email not found',
    });
  }

  res.json({
    success: true,
    data: email,
  });
});

// @desc    Toggle star
// @route   PATCH /api/emails/:id/star
// @access  Private
export const toggleStar = asyncHandler(async (req, res) => {
  const email = await Email.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!email) {
    return res.status(404).json({
      success: false,
      message: 'Email not found',
    });
  }

  email.starred = !email.starred;
  await email.save();

  res.json({
    success: true,
    data: email,
  });
});

// @desc    Delete email
// @route   DELETE /api/emails/:id
// @access  Private
export const deleteEmail = asyncHandler(async (req, res) => {
  const email = await Email.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!email) {
    return res.status(404).json({
      success: false,
      message: 'Email not found',
    });
  }

  email.trash = true;
  await email.save();

  res.json({
    success: true,
    message: 'Email moved to trash',
  });
});