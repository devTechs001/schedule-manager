import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBell,
  FaBolt,
  FaBrain,
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaClock,
  FaCloud,
  FaComments,
  FaEnvelope,
  FaFingerprint,
  FaKeyboard,
  FaLayerGroup,
  FaLock,
  FaMagic,
  FaMobileAlt,
  FaPaintBrush,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaTasks,
  FaThLarge,
  FaUsers,
  FaWifi,
} from 'react-icons/fa';

const CATEGORIES = [
  { id: 'all', label: 'All features', icon: FaLayerGroup },
  { id: 'ai', label: 'AI & automation', icon: FaRobot },
  { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
  { id: 'tasks', label: 'Tasks & inbox', icon: FaTasks },
  { id: 'team', label: 'Collaboration', icon: FaUsers },
  { id: 'analytics', label: 'Analytics', icon: FaChartLine },
  { id: 'focus', label: 'Planning & focus', icon: FaClock },
  { id: 'platform', label: 'Platform', icon: FaMobileAlt },
];

const FEATURES = [
  // AI
  { cat: 'ai', icon: FaRobot, title: 'Conversational scheduling', body: 'Ask in plain language — “find 90 minutes for the proposal before Thursday” — and get a real slot, not a search box.' },
  { cat: 'ai', icon: FaBrain, title: 'Priority scoring', body: 'Every task gets a 0–100 urgency score from deadline pressure, dependencies and the effort you estimated.' },
  { cat: 'ai', icon: FaBolt, title: 'Smart suggestions', body: 'Context-aware nudges: what to defer, what to batch, and which meeting could have been an email.' },
  { cat: 'ai', icon: FaEnvelope, title: 'Email intelligence', body: 'Auto-categorise mail, extract action items with owners and dates, and draft replies in your tone.' },
  // Calendar
  { cat: 'calendar', icon: FaCalendarAlt, title: 'Month, week, day & agenda', body: 'A fast calendar with drag-to-reschedule, colour coding by event type and a clean agenda for mobile.' },
  { cat: 'calendar', icon: FaWifi, title: 'Conflict detection', body: 'Overlaps are flagged the moment they happen, with a one-tap resolution that respects your priorities.' },
  { cat: 'calendar', icon: FaBolt, title: 'Focus blocking', body: 'Reserve deep work automatically around meetings — and protect it from new invites.' },
  { cat: 'calendar', icon: FaCloud, title: 'Weather & traffic aware', body: 'Travel-heavy events factor in commute time and conditions so you leave when you actually should.' },
  // Tasks & inbox
  { cat: 'tasks', icon: FaTasks, title: 'Tasks with subtasks', body: 'Descriptions, tags, attachments, subtasks, due dates and bulk operations when the backlog grows.' },
  { cat: 'tasks', icon: FaEnvelope, title: 'Unified inbox', body: 'Read, star, search and reply without leaving the app. Email-to-task takes one click.' },
  { cat: 'tasks', icon: FaBell, title: 'Reminders that land', body: 'Snooze, smart alerts and location reminders — quietly, without notification spam.' },
  { cat: 'tasks', icon: FaCheck, title: 'Offline queue', body: 'Tick things off on a plane. Changes queue locally and sync the second you reconnect.' },
  // Team
  { cat: 'team', icon: FaUsers, title: 'Shared workspaces', body: 'Organise people and projects with roles, permissions and per-workspace calendars.' },
  { cat: 'team', icon: FaComments, title: 'Threaded comments', body: 'Discuss inside the task or event it belongs to, with mentions and full history.' },
  { cat: 'team', icon: FaCalendarAlt, title: 'Meeting polls', body: 'Find the slot that works for everyone, then create the event automatically.' },
  { cat: 'team', icon: FaArrowRight, title: 'Approval workflows', body: 'Simple review chains for anything that needs a second pair of eyes before it ships.' },
  // Analytics
  { cat: 'analytics', icon: FaChartLine, title: 'Productivity trends', body: 'Completed vs created over time, streaks and cycle time so progress is visible, not guessed.' },
  { cat: 'analytics', icon: FaBolt, title: 'Energy tracking', body: 'Log how you feel and see which hours actually produce your best work.' },
  { cat: 'analytics', icon: FaBrain, title: 'Distraction insights', body: 'Spot the patterns behind lost focus and get a plan to defend your attention.' },
  { cat: 'analytics', icon: FaChartLine, title: 'Goal & habit tracking', body: 'Set a weekly target, watch the ring fill, and keep momentum with gentle streaks.' },
  // Planning & focus
  { cat: 'focus', icon: FaThLarge, title: 'Daily timeline', body: 'Your whole day from 07:00 to 22:00 with events, a live now-line and click-a-slot time blocking.' },
  { cat: 'focus', icon: FaMagic, title: 'Auto-plan my day', body: 'One tap fills the free gaps with your highest-priority open tasks, sized 60, 45 or 30 minutes with buffers.' },
  { cat: 'focus', icon: FaBell, title: 'Reminders & activity hub', body: 'One screen for everything that needs you: overdue work, tasks due, meetings starting and calendar clashes — each fixable in place.' },
  { cat: 'focus', icon: FaClock, title: 'Pomodoro timer', body: '25/5/15 sessions with a progress ring, optional task link and a persisted history of every session.' },
  { cat: 'focus', icon: FaSearch, title: 'Universal search', body: 'Query tasks, events, emails and contacts in one place, filter by type, and share a URL that keeps the term.' },
  { cat: 'focus', icon: FaKeyboard, title: 'Keyboard-first', body: 'Command palette, G-then-letter navigation, a “?” cheat sheet and one-key theme switching.' },

  // Platform
  { cat: 'platform', icon: FaPaintBrush, title: 'Five themes, six accents', body: 'Daylight, Slate, Midnight, Nord and Sand — plus light/dark mode and a compact density.' },
  { cat: 'platform', icon: FaMobileAlt, title: 'Installable PWA', body: 'Add SchedAI to your home screen or dock. It launches instantly and works without a network.' },
  { cat: 'platform', icon: FaLock, title: 'Private by default', body: 'JWT auth, encrypted transport and scoped data access — your workspace is yours.' },
  { cat: 'platform', icon: FaFingerprint, title: 'Security centre', body: 'Password changes, session review, audit logs and permission management in one place.' },
];

const HIGHLIGHTS = [
  {
    id: 'ai',
    eyebrow: 'AI & automation',
    icon: FaRobot,
    title: 'An assistant that does the boring 20%',
    body: 'SchedAI is not a chatbot bolted onto a todo list. It reads your context — tasks, deadlines, calendar density — and acts on it with an undo button always available.',
    points: [
      'Natural-language task and event creation',
      'Automatic priority scoring and re-ordering',
      'Meeting notes turned into action items',
      'Voice commands for hands-free capture',
    ],
  },
  {
    id: 'calendar',
    eyebrow: 'Calendar',
    icon: FaCalendarAlt,
    title: 'A calendar that defends your focus',
    body: 'Switch between month, week, day and agenda views. Drag to reschedule. Let the planner carve out deep-work blocks around the meetings you cannot move.',
    points: [
      'Drag-and-drop rescheduling with instant sync',
      'Conflict detection with suggested fixes',
      'Travel, weather and traffic awareness',
      'Shared team calendars and availability',
    ],
  },
  {
    id: 'analytics',
    eyebrow: 'Analytics',
    icon: FaChartLine,
    title: 'Proof that the week went well',
    body: 'Beautiful charts that answer practical questions: what got done, when you focus best, and which commitments keep slipping.',
    points: [
      'Completed vs created trends',
      'Time tracking per project and tag',
      'Energy and distraction patterns',
      'Weekly review you can actually read',
    ],
  },
];

const Features = () => {
  const [active, setActive] = useState('all');

  useEffect(() => {
    document.title = 'Features — SchedAI';
  }, []);

  const visible = active === 'all' ? FEATURES : FEATURES.filter((feature) => feature.cat === active);

  return (
    <div>
      {/* Hero */}
      <section className="hero-art hero-art--compact relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-25" aria-hidden="true" />
        <div className="section py-16 text-center sm:py-20">
          <span className="eyebrow">Product</span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Every feature earns its <span className="gradient-text">place on your screen</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
            No feature bloat. Each capability exists because it removes a real, recurring chore from
            your week.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start free <FaArrowRight size={12} />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="section py-14">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              className={`chip ${active === category.id ? 'chip-active' : ''}`}
              aria-pressed={active === category.id}
            >
              <category.icon size={11} />
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((feature, index) => (
            <div
              key={feature.title}
              className="card card-hover card-pad animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="feature-icon h-10 w-10 rounded-xl">
                  <feature.icon size={15} />
                </div>
                <h3 className="text-sm font-semibold text-content">{feature.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-content-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep dives */}
      <section className="border-t border-line bg-surface/60">
        <div className="section space-y-20 py-20">
          {HIGHLIGHTS.map((highlight, index) => (
            <div
              key={highlight.id}
              id={highlight.id}
              className={`grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <span className="eyebrow">
                  <highlight.icon size={11} /> {highlight.eyebrow}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{highlight.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-content-muted">{highlight.body}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {highlight.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-content-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <FaCheck size={8} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card overflow-hidden">
                <div className="border-b border-line bg-surface-sunken px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-content-muted">
                    <highlight.icon size={11} className="text-primary-500" />
                    {highlight.eyebrow}
                  </div>
                </div>
                <div className="space-y-2.5 p-4">
                  {highlight.points.map((point, pointIndex) => (
                    <div key={point} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-50 text-[0.6rem] font-bold text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                        {String(pointIndex + 1).padStart(2, '0')}
                      </span>
                      <p className="flex-1 truncate text-xs font-medium text-content-muted">{point}</p>
                      <span className="badge badge-success px-1.5 py-0 text-[0.55rem]">live</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security strip */}
      <section className="section py-16">
        <div className="card card-pad grid gap-6 md:grid-cols-3">
          {[
            { icon: FaShieldAlt, title: 'Encrypted in transit', body: 'HTTPS everywhere, JWT sessions and scoped API access.' },
            { icon: FaLock, title: 'You own your data', body: 'Export or delete everything at any time — no dark patterns.' },
            { icon: FaFingerprint, title: 'Audit-friendly', body: 'Security centre with sessions, audit logs and permissions.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="feature-icon h-10 w-10 shrink-0 rounded-xl">
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm font-semibold text-content">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-content-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section pb-20">
        <div className="rounded-3xl border border-line bg-accent-gradient px-6 py-12 text-center text-white shadow-glow">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to see it with your own data?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">
            Free to start, no card required. Import your day in under two minutes.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-white/90">
              Create free account
            </Link>
            <Link to="/login" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20">
              I already have one
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
