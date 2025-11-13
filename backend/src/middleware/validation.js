import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  handleValidationErrors,
];

export const validateEmail = [
  body('to')
    .notEmpty()
    .withMessage('Recipient is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Email body is required'),
  handleValidationErrors,
];

export const validateContact = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationErrors,
];

export const validateEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required'),
  body('start')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('end')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('type')
    .optional()
    .isIn(['meeting', 'task', 'deadline', 'reminder'])
    .withMessage('Invalid event type'),
  handleValidationErrors,
];