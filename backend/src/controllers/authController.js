import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/helpers.js';
import authConfig from '../config/auth.js';

// Generate JWT Token
const generateToken = (id) => {
  const secret = authConfig.jwtSecret || process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-0123456789';
  return jwt.sign({ id }, secret, {
    expiresIn: authConfig.jwtExpire || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: { user },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  /*
   * Explicit whitelist. Never spread req.body into the update: that would let a
   * caller set `role: 'admin'`, replace `password`, or write arbitrary schema
   * paths (which is how privilege-escalation bugs get in).
   */
  const EDITABLE = [
    'name',
    'email',
    'phone',
    'avatar',
    'headline',
    'bio',
    'jobTitle',
    'company',
    'location',
    'website',
    'pronouns',
    'timezone',
    'preferences',
    'socials',
  ];

  const fieldsToUpdate = {};
  for (const key of EDITABLE) {
    if (req.body[key] !== undefined) fieldsToUpdate[key] = req.body[key];
  }

  // Avatar bytes go through POST /api/avatars; this field only ever accepts a
  // URL that already points at our own GridFS route (or is cleared).
  if (fieldsToUpdate.avatar !== undefined) {
    const value = fieldsToUpdate.avatar;
    const isOwnAvatar = typeof value === 'string' && /^\/api\/avatars\/[a-f0-9]{24}$/i.test(value);
    if (value !== null && value !== '' && !isOwnAvatar) {
      return res.status(400).json({
        success: false,
        message: 'Upload the image through the avatar endpoint.',
      });
    }
    fieldsToUpdate.avatar = value || null;
  }

  // Organisation entries are structured data, not free-form JSON.
  if (Array.isArray(req.body.organisations)) {
    fieldsToUpdate.organisations = req.body.organisations
      .filter((org) => org && typeof org.name === 'string' && org.name.trim())
      .slice(0, 20)
      .map((org) => ({
        name: String(org.name).trim().slice(0, 120),
        role: org.role ? String(org.role).trim().slice(0, 60) : 'Member',
        website: org.website ? String(org.website).trim().slice(0, 200) : undefined,
      }));
  }

  if (req.body.socials && typeof req.body.socials === 'object') {
    fieldsToUpdate.socials = {
      linkedin: req.body.socials.linkedin?.slice?.(0, 200) || undefined,
      x: req.body.socials.x?.slice?.(0, 200) || undefined,
      github: req.body.socials.github?.slice?.(0, 200) || undefined,
    };
  }

  if (!Object.keys(fieldsToUpdate).length) {
    return res.status(400).json({ success: false, message: 'Nothing to update' });
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});