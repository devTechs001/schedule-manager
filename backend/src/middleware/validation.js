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

/**
 * Task rules shared by create and update. `title` is required on create only:
 * an update is a partial patch, and the app legitimately sends just
 * `{ status }` (dragging a card) or just `{ dueDate }` (scheduling a task).
 * Requiring the title on every PUT made those calls 400 while the local
 * fallback quietly succeeded, so the feature looked broken only against a
 * real server.
 */
const taskRules = ({ requireTitle }) => {
  const title = body('title').trim();
  const titleRule = requireTitle
    ? title
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters')
    : title
        .optional()
        .notEmpty()
        .withMessage('Task title cannot be empty')
        .isLength({ min: 3 })
        .withMessage('Title must be at least 3 characters');

  return [
    titleRule,
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'completed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('dueDate')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('Invalid date format'),
    handleValidationErrors,
  ];
};

/** POST /api/tasks — a full task. */
export const validateTask = taskRules({ requireTitle: true });

/** PUT /api/tasks/:id — a partial patch; every field is optional. */
export const validateTaskUpdate = taskRules({ requireTitle: false });

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

/**
 * Event rules shared by create and update.
 *
 * Same shape as tasks: a create needs a title and a full time range, while an
 * update is a partial patch. Dragging an event on the calendar sends only
 * `{ start, end }`, and accepting a conflict resolution does the same, so
 * demanding a title on PUT rejected both.
 *
 * The end-after-start check only runs when both ends are present, which is the
 * case for every real caller — a patch that moves one end without the other
 * would otherwise compare the new value against a missing one.
 */
const eventRules = ({ requireAll }) => {
  const optional = (chain) => (requireAll ? chain : chain.optional({ nullable: true }));

  return [
    optional(body('title').trim().notEmpty().withMessage('Event title is required')),
    optional(
      body('start')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Invalid start date format')
    ),
    optional(
      body('end')
        .notEmpty()
        .withMessage('End date is required')
        .isISO8601()
        .withMessage('Invalid end date format')
    ),
    body('end').custom((value, { req }) => {
      const { start, end } = req.body;
      if (start === undefined || end === undefined || end === null) return true;
      if (new Date(end) <= new Date(start)) {
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
};

/** POST /api/schedule — a complete event. */
export const validateEvent = eventRules({ requireAll: true });

/** PUT /api/schedule/:id — a partial patch; every field is optional. */
export const validateEventUpdate = eventRules({ requireAll: false });