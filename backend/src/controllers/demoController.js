import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import Email from '../models/Email.js';
import Contact from '../models/Contact.js';
import authConfig from '../config/auth.js';
import { asyncHandler } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { isDbConnected } from '../utils/database.js';

/**
 * One-click demo session.
 *
 * Product demos and reviewers should not have to remember credentials, so this
 * endpoint creates (or reuses) a demo account and makes sure it has enough
 * sample data to look alive. It is disabled when DEMO_MODE=false or in
 * production unless explicitly enabled.
 */
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@schedai.app';
const DEMO_NAME = process.env.DEMO_NAME || 'Demo User';
const DEMO_PASSWORD =
  process.env.DEMO_PASSWORD || `demo-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

const isDemoEnabled = () =>
  process.env.DEMO_MODE !== 'false' &&
  (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true');

const generateToken = (id) =>
  jwt.sign({ id }, authConfig.jwtSecret || process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-0123456789', {
    expiresIn: authConfig.jwtExpire || '7d',
  });

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000);
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const SAMPLE_TASKS = [
  {
    title: 'Review Q4 product roadmap',
    description: 'Go through the roadmap doc and leave comments on the three open questions.',
    status: 'in-progress',
    priority: 'high',
    dueDate: hoursFromNow(5),
    tags: ['product', 'planning'],
    subtasks: [
      { title: 'Read the summary', completed: true },
      { title: 'Comment on open questions', completed: false },
      { title: 'Sync with design lead', completed: false },
    ],
  },
  {
    title: 'Send investor update draft',
    description: 'Draft the monthly update — metrics, wins, blockers.',
    status: 'todo',
    priority: 'high',
    dueDate: hoursFromNow(26),
    tags: ['writing'],
  },
  {
    title: 'Prep 1:1 notes for Amara',
    status: 'todo',
    priority: 'medium',
    dueDate: hoursFromNow(30),
    tags: ['team'],
  },
  {
    title: 'Refactor the scheduling module',
    description: 'Split the conflict resolver into its own service.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: daysFromNow(3),
    tags: ['engineering'],
  },
  {
    title: 'Clear the inbox backlog',
    status: 'completed',
    priority: 'low',
    dueDate: hoursFromNow(-20),
    completedAt: hoursFromNow(-18),
    tags: ['admin'],
  },
  {
    title: 'Book flights for the offsite',
    status: 'completed',
    priority: 'low',
    completedAt: hoursFromNow(-40),
    tags: ['travel'],
  },
  {
    title: 'Update onboarding checklist',
    status: 'todo',
    priority: 'low',
    dueDate: daysFromNow(6),
    tags: ['ops'],
  },
  {
    title: 'Fix timezone bug in recurring events',
    description: 'Events shift by an hour when the display timezone differs from the organizer.',
    status: 'todo',
    priority: 'high',
    dueDate: hoursFromNow(-6),
    tags: ['bug', 'engineering'],
  },
];

const SAMPLE_EVENTS = [
  {
    title: 'Design sync',
    description: 'Walkthrough of the new dashboard layout.',
    start: hoursFromNow(3),
    end: hoursFromNow(4),
    type: 'meeting',
    location: 'Zoom',
    meetingLink: 'https://meet.google.com/demo-link',
  },
  {
    title: 'Deep work: roadmap',
    start: hoursFromNow(5),
    end: hoursFromNow(7),
    type: 'task',
    location: 'Focus mode',
  },
  {
    title: 'Customer call — Acme',
    description: 'Quarterly review with the Acme team.',
    start: hoursFromNow(27),
    end: hoursFromNow(28),
    type: 'meeting',
    location: 'Google Meet',
  },
  {
    title: 'Proposal deadline',
    start: hoursFromNow(50),
    end: hoursFromNow(51),
    type: 'deadline',
  },
  {
    title: 'Team retro',
    start: hoursFromNow(76),
    end: hoursFromNow(77),
    type: 'meeting',
    location: 'Room 4',
  },
  {
    title: 'Pay rent',
    start: hoursFromNow(20),
    end: hoursFromNow(21),
    type: 'reminder',
  },
];

const SAMPLE_EMAILS = [
  {
    from: 'amara@acme.co',
    subject: 'Re: Project proposal feedback',
    body: 'Hi — reviewed the proposal with the team. A couple of notes on pricing and the timeline in section 4. Can we jump on a call Thursday?',
    read: false,
    starred: true,
    labels: ['work', 'priority'],
  },
  {
    from: 'notifications@github.com',
    subject: '[schedule-manager] 3 new pull requests need review',
    body: 'You have 3 pull requests waiting for your review in devTechs001/schedule-manager.',
    read: false,
    labels: ['dev'],
  },
  {
    from: 'daniel@freelance.dev',
    subject: 'Invoice #2041 — paid',
    body: 'Thanks for the quick turnaround. Payment for invoice #2041 has been sent, you should see it within two business days.',
    read: true,
    starred: true,
    labels: ['finance'],
  },
  {
    from: 'team@schedai.app',
    subject: 'Your weekly plan is ready',
    body: 'You finished 8 tasks last week (up 22%). Here are three suggestions for the week ahead.',
    read: true,
    labels: ['product'],
  },
  {
    from: 'priya@company.io',
    subject: 'Design review notes',
    body: 'Attaching the notes from the design review. Main action items: tighten the empty states, and confirm the dark theme contrast ratios.',
    read: true,
    attachments: [{ filename: 'design-review.pdf', url: '#', size: 248000 }],
    labels: ['design'],
  },
];

const SAMPLE_CONTACTS = [
  { name: 'Amara Otieno', email: 'amara@acme.co', company: 'Acme', position: 'Product Lead', phone: '+254 700 000 001', tags: ['client'], isFavorite: true },
  { name: 'Daniel Mwangi', email: 'daniel@freelance.dev', company: 'Independent', position: 'Consultant', phone: '+254 700 000 002', tags: ['partner'] },
  { name: 'Priya Raman', email: 'priya@company.io', company: 'Company IO', position: 'Engineering Manager', tags: ['team'] },
  { name: 'Jonas Kim', email: 'jonas@studio.co', company: 'Studio Co', position: 'Designer', tags: ['vendor'] },
];

const ensureSampleData = async (userId) => {
  const [taskCount, eventCount, emailCount, contactCount] = await Promise.all([
    Task.countDocuments({ user: userId }),
    Event.countDocuments({ user: userId }),
    Email.countDocuments({ user: userId }),
    Contact.countDocuments({ user: userId }),
  ]);

  const created = [];

  if (taskCount === 0) {
    await Task.insertMany(SAMPLE_TASKS.map((task) => ({ ...task, user: userId })));
    created.push(`${SAMPLE_TASKS.length} tasks`);
  }

  if (eventCount === 0) {
    await Event.insertMany(SAMPLE_EVENTS.map((event) => ({ ...event, user: userId })));
    created.push(`${SAMPLE_EVENTS.length} events`);
  }

  if (emailCount === 0) {
    await Email.insertMany(
      SAMPLE_EMAILS.map((email) => ({
        ...email,
        user: userId,
        to: [DEMO_EMAIL],
        type: 'inbox',
      }))
    );
    created.push(`${SAMPLE_EMAILS.length} emails`);
  }

  if (contactCount === 0) {
    await Contact.insertMany(SAMPLE_CONTACTS.map((contact) => ({ ...contact, user: userId })));
    created.push(`${SAMPLE_CONTACTS.length} contacts`);
  }

  return created;
};

// @desc    Start (or reuse) a demo session with sample data
// @route   POST /api/auth/demo
// @access  Public (when demo mode is enabled)
export const startDemoSession = asyncHandler(async (req, res) => {
  if (!isDemoEnabled()) {
    return res.status(403).json({
      success: false,
      message: 'Demo mode is disabled on this deployment.',
    });
  }

  // Fail fast when Mongo is unreachable — the client falls back to its local
  // sandbox instantly instead of waiting on a driver timeout.
  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      code: 'DB_UNAVAILABLE',
      message: 'Demo data store is unavailable. Start MongoDB to seed a live demo.',
    });
  }

  let user = await User.findOne({ email: DEMO_EMAIL });

  if (!user) {
    user = await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      role: 'user',
      isVerified: true,
    });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  let seeded = [];
  try {
    seeded = await ensureSampleData(user._id);
  } catch (error) {
    logger.warn(`Demo data seeding skipped: ${error.message}`);
  }

  if (seeded.length) logger.info(`Demo session seeded: ${seeded.join(', ')}`);

  res.json({
    success: true,
    message: 'Demo session ready',
    data: {
      user,
      token: generateToken(user._id),
      seeded,
      dbConnected: mongoose.connection.readyState === 1,
    },
  });
});

export default { startDemoSession };
