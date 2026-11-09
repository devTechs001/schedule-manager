/**
 * Local fallback store
 * ------------------------------------------------------------------
 * When the API (or its database) is unreachable, the app stays fully usable:
 * collections are read from and written to localStorage, seeded with a small,
 * realistic demo dataset on first use. Once the API responds again, the hooks
 * automatically switch back to the server.
 */

const PREFIX = 'schedai:';
const SEEDED_KEY = `${PREFIX}seeded:v1`;

const uid = () =>
  `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const hoursFromNow = (hours) => new Date(Date.now() + hours * 3600 * 1000).toISOString();
const daysFromNow = (days) => new Date(Date.now() + days * 86400 * 1000).toISOString();

export const seedTasks = [
  {
    _id: uid(),
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
    createdAt: hoursFromNow(-30),
  },
  {
    _id: uid(),
    title: 'Send investor update draft',
    description: 'Draft the monthly update — metrics, wins, blockers.',
    status: 'todo',
    priority: 'high',
    dueDate: hoursFromNow(26),
    tags: ['writing'],
    createdAt: hoursFromNow(-20),
  },
  {
    _id: uid(),
    title: 'Prep 1:1 notes for Amara',
    status: 'todo',
    priority: 'medium',
    dueDate: hoursFromNow(30),
    tags: ['team'],
    createdAt: hoursFromNow(-18),
  },
  {
    _id: uid(),
    title: 'Refactor the scheduling module',
    description: 'Split the conflict resolver into its own service.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: daysFromNow(3),
    tags: ['engineering'],
    createdAt: hoursFromNow(-70),
  },
  {
    _id: uid(),
    title: 'Clear the inbox backlog',
    status: 'completed',
    priority: 'low',
    completedAt: hoursFromNow(-18),
    createdAt: hoursFromNow(-90),
  },
  {
    _id: uid(),
    title: 'Book flights for the offsite',
    status: 'completed',
    priority: 'low',
    completedAt: hoursFromNow(-40),
    createdAt: hoursFromNow(-120),
  },
  {
    _id: uid(),
    title: 'Update onboarding checklist',
    status: 'todo',
    priority: 'low',
    dueDate: daysFromNow(6),
    tags: ['ops'],
    createdAt: hoursFromNow(-10),
  },
  {
    _id: uid(),
    title: 'Fix timezone bug in recurring events',
    description: 'Events shift by an hour when the display timezone differs from the organizer.',
    status: 'todo',
    priority: 'high',
    dueDate: hoursFromNow(-6),
    tags: ['bug', 'engineering'],
    createdAt: hoursFromNow(-50),
  },
];

export const seedEvents = [
  {
    _id: uid(),
    title: 'Design sync',
    description: 'Walkthrough of the new dashboard layout.',
    start: hoursFromNow(3),
    end: hoursFromNow(4),
    type: 'meeting',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/demo-link',
  },
  {
    _id: uid(),
    title: 'Deep work: roadmap',
    start: hoursFromNow(5),
    end: hoursFromNow(7),
    type: 'task',
    location: 'Focus mode',
  },
  {
    _id: uid(),
    title: 'Customer call — Acme',
    description: 'Quarterly review with the Acme team.',
    start: hoursFromNow(27),
    end: hoursFromNow(28),
    type: 'meeting',
    location: 'Zoom',
  },
  {
    _id: uid(),
    title: 'Proposal deadline',
    start: hoursFromNow(50),
    end: hoursFromNow(51),
    type: 'deadline',
  },
  {
    _id: uid(),
    title: 'Team retro',
    start: hoursFromNow(76),
    end: hoursFromNow(77),
    type: 'meeting',
    location: 'Room 4',
  },
  {
    _id: uid(),
    title: 'Pay rent',
    start: hoursFromNow(20),
    end: hoursFromNow(21),
    type: 'reminder',
  },
];

export const seedEmails = [
  {
    _id: uid(),
    from: 'amara@acme.co',
    to: ['you@schedai.app'],
    subject: 'Re: Project proposal feedback',
    body: 'Hi — reviewed the proposal with the team. A couple of notes on pricing and the timeline in section 4. Can we jump on a call Thursday?',
    read: false,
    starred: true,
    type: 'inbox',
    labels: ['work', 'priority'],
    createdAt: hoursFromNow(-2),
  },
  {
    _id: uid(),
    from: 'notifications@github.com',
    to: ['you@schedai.app'],
    subject: '[schedule-manager] 3 pull requests need review',
    body: 'You have 3 pull requests waiting for your review in devTechs001/schedule-manager.',
    read: false,
    type: 'inbox',
    labels: ['dev'],
    createdAt: hoursFromNow(-5),
  },
  {
    _id: uid(),
    from: 'daniel@freelance.dev',
    to: ['you@schedai.app'],
    subject: 'Invoice #2041 — paid',
    body: 'Thanks for the quick turnaround. Payment for invoice #2041 has been sent; expect it within two business days.',
    read: true,
    starred: true,
    type: 'inbox',
    labels: ['finance'],
    createdAt: hoursFromNow(-20),
  },
  {
    _id: uid(),
    from: 'team@schedai.app',
    to: ['you@schedai.app'],
    subject: 'Your weekly plan is ready',
    body: 'You finished 8 tasks last week (up 22%). Here are three suggestions for the week ahead.',
    read: true,
    type: 'inbox',
    labels: ['product'],
    createdAt: hoursFromNow(-30),
  },
  {
    _id: uid(),
    from: 'priya@company.io',
    to: ['you@schedai.app'],
    subject: 'Design review notes',
    body: 'Attaching the notes from the design review. Main action items: tighten the empty states and confirm dark theme contrast ratios.',
    read: true,
    type: 'inbox',
    labels: ['design'],
    attachments: [{ filename: 'design-review.pdf', url: '#', size: 248000 }],
    createdAt: hoursFromNow(-44),
  },
];

export const seedContacts = [
  { _id: uid(), name: 'Amara Otieno', email: 'amara@acme.co', company: 'Acme', position: 'Product Lead', phone: '+254 700 000 001', tags: ['client'], isFavorite: true },
  { _id: uid(), name: 'Daniel Mwangi', email: 'daniel@freelance.dev', company: 'Independent', position: 'Consultant', phone: '+254 700 000 002', tags: ['partner'] },
  { _id: uid(), name: 'Priya Raman', email: 'priya@company.io', company: 'Company IO', position: 'Engineering Manager', tags: ['team'] },
  { _id: uid(), name: 'Jonas Kim', email: 'jonas@studio.co', company: 'Studio Co', position: 'Designer', tags: ['vendor'] },
];

export const seedAppointments = [
  {
    _id: uid(),
    title: 'Standup with the team',
    notes: 'Quick round-robin on blockers.',
    at: hoursFromNow(1),
    notifyMinutesBefore: 10,
    repeat: 'weekdays',
    categories: ['work'],
    linkedTaskId: null,
    linkedEventId: null,
    done: false,
    createdAt: hoursFromNow(-72),
  },
  {
    _id: uid(),
    title: 'Renew the domain',
    notes: 'Card on file expires soon — check before renewing.',
    at: hoursFromNow(20),
    notifyMinutesBefore: 1440,
    repeat: 'none',
    categories: ['admin'],
    linkedTaskId: null,
    linkedEventId: null,
    done: false,
    createdAt: hoursFromNow(-120),
  },
  {
    _id: uid(),
    title: 'Call Amara about the proposal',
    notes: 'Confirm scope and the delivery date.',
    at: hoursFromNow(4),
    notifyMinutesBefore: 30,
    repeat: 'none',
    categories: ['client'],
    linkedTaskId: null,
    linkedEventId: null,
    done: false,
    createdAt: hoursFromNow(-48),
  },
];

const SEEDS = {
  tasks: seedTasks,
  events: seedEvents,
  emails: seedEmails,
  contacts: seedContacts,
  appointments: seedAppointments,
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export const readCollection = (name) => {
  const seed = SEEDS[name] || [];
  try {
    const raw = localStorage.getItem(`${PREFIX}${name}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* corrupt storage — fall through to the seed */
  }
  const initial = clone(seed);
  writeCollection(name, initial);
  return initial;
};

export const writeCollection = (name, items) => {
  try {
    localStorage.setItem(`${PREFIX}${name}`, JSON.stringify(items));
  } catch {
    /* storage full or blocked */
  }
  return items;
};

export const resetCollections = () => {
  Object.keys(SEEDS).forEach((name) => {
    try {
      localStorage.removeItem(`${PREFIX}${name}`);
    } catch {
      /* ignore */
    }
  });
  try {
    localStorage.removeItem(SEEDED_KEY);
  } catch {
    /* ignore */
  }
};

export const newLocalId = uid;
