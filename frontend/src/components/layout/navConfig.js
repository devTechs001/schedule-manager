import {
  FaHome,
  FaTasks,
  FaCalendarAlt,
  FaEnvelope,
  FaUsers,
  FaChartLine,
  FaRobot,
  FaComments,
  FaStar,
  FaCog,
  FaSearch,
  FaPlus,
  FaRegSun,
  FaRegMoon,
  FaColumns,
  FaHourglassHalf,
  FaBell,
  FaTrophy,
  FaGift,
  FaFingerprint,
  FaClock,
  FaChartBar,
  FaStopwatch,
  FaThLarge,
  FaStickyNote,
  FaBullseye,
  FaShieldAlt,
  FaPlug,
} from 'react-icons/fa';

/**
 * Single source of truth for navigation.
 * Sidebar, bottom nav, the mobile drawer and the command palette all read from
 * here so links can never drift apart again.
 */
export const NAV_SECTIONS = [
  {
    id: 'workspace',
    title: 'My work',
    items: [
      { to: '/dashboard', icon: FaHome, label: 'Dashboard', keywords: 'home overview today' },
      { to: '/activity', icon: FaBell, label: 'Activity hub', keywords: 'reminders alerts overdue conflicts schedule attention' },
      { to: '/tasks', icon: FaTasks, label: 'Tasks', keywords: 'todo backlog' },
      { to: '/notes', icon: FaStickyNote, label: 'Notes', keywords: 'scratchpad memo jot quick note' },
      { to: '/goals', icon: FaBullseye, label: 'Goals & habits', keywords: 'goals habits streak track target' },
      { to: '/schedule', icon: FaCalendarAlt, label: 'Schedule', keywords: 'calendar events meetings' },
      { to: '/planner', icon: FaColumns, label: 'Daily planner', keywords: 'timeline day plan time blocking' },
      { to: '/focus', icon: FaHourglassHalf, label: 'Focus timer', keywords: 'pomodoro deep work' },
      { to: '/emails', icon: FaEnvelope, label: 'Inbox', keywords: 'emails mail' },
      { to: '/contacts', icon: FaUsers, label: 'Contacts', keywords: 'people address book' },
      { to: '/analytics', icon: FaChartLine, label: 'Analytics', keywords: 'stats performance charts' },
      { to: '/analytics/performance', icon: FaChartBar, label: 'Performance', keywords: 'analytics stats trends growth' },
      { to: '/analytics/time-tracking', icon: FaStopwatch, label: 'Time tracking', keywords: 'analytics hours logged time' },
      { to: '/analytics/productivity', icon: FaThLarge, label: 'Productivity', keywords: 'analytics output focus score' },
    ],
  },
  {
    id: 'ai',
    title: 'AI studio',
    items: [
      { to: '/ai-insights', icon: FaRobot, label: 'AI insights', keywords: 'assistant tips' },
      { to: '/ai-chat', icon: FaComments, label: 'AI chat', keywords: 'assistant ask' },
      { to: '/predictive-scheduler', icon: FaCalendarAlt, label: 'Predictive planner', keywords: 'auto schedule' },
      { to: '/meeting-assistant', icon: FaComments, label: 'Meeting assistant', keywords: 'notes recording' },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    collapsible: true,
    items: [
      { to: '/collaboration', icon: FaComments, label: 'Team overview', keywords: 'workspace team collab' },
      { to: '/collaboration/projects', icon: FaTasks, label: 'Projects', keywords: 'initiatives tags' },
      { to: '/schedule', icon: FaCalendarAlt, label: 'Meetings', keywords: 'calls sync calendar' },
      { to: '/leaderboard', icon: FaStar, label: 'Leaderboard', keywords: 'gamification points' },
      { to: '/achievements', icon: FaStar, label: 'Achievements', keywords: 'badges gamification' },
      { to: '/challenges', icon: FaTrophy, label: 'Challenges', keywords: 'gamification goals compete streak' },
      { to: '/rewards', icon: FaGift, label: 'Rewards', keywords: 'gamification points redeem perks' },
    ],
  },
];

export const SETTINGS_ITEM = { to: '/settings', icon: FaCog, label: 'Settings' };

/**
 * Secondary destinations that live in Settings but deserve a direct link.
 * Without these, /biometric-setup and the advanced settings pages were routed
 * but unreachable — no nav entry, no link, no way in except typing the URL.
 */
export const FOOTER_LINKS = [
  { to: '/settings/security', icon: FaShieldAlt, label: 'Security' },
  { to: '/settings/integrations', icon: FaPlug, label: 'Integrations' },
  { to: '/biometric-setup', icon: FaFingerprint, label: 'Biometric unlock' },
];

export const MOBILE_PRIMARY = [
  { to: '/dashboard', icon: FaHome, label: 'Home' },
  { to: '/tasks', icon: FaTasks, label: 'Tasks' },
  { to: '/planner', icon: FaColumns, label: 'Planner' },
  { to: '/schedule', icon: FaCalendarAlt, label: 'Calendar' },
  { to: '/focus', icon: FaHourglassHalf, label: 'Focus' },
];

export const MOBILE_SECONDARY = [
  { to: '/analytics', icon: FaChartLine, label: 'Analytics' },
  { to: '/contacts', icon: FaUsers, label: 'Contacts' },
  { to: '/collaboration', icon: FaComments, label: 'Team' },
  { to: '/ai-insights', icon: FaRobot, label: 'AI tools' },
  { to: '/leaderboard', icon: FaStar, label: 'Leaderboard' },
  { to: '/settings', icon: FaCog, label: 'Settings' },
];

export const QUICK_ACTIONS = [
  { to: '/tasks', icon: FaPlus, label: 'New task', hint: 'Capture something to do', keywords: 'create add todo' },
  { to: '/activity', icon: FaBell, label: 'Set a reminder', hint: 'Never miss a moment', keywords: 'reminder alert notify' },
  { to: '/planner', icon: FaColumns, label: 'Plan my day', hint: 'Time-block the schedule', keywords: 'planner timeline' },
  { to: '/focus', icon: FaHourglassHalf, label: 'Start focus timer', hint: '25 minutes of deep work', keywords: 'pomodoro timer' },
  { to: '/schedule', icon: FaCalendarAlt, label: 'New event', hint: 'Block time on the calendar', keywords: 'meeting create' },
  { to: '/emails', icon: FaEnvelope, label: 'Compose email', hint: 'Write from your inbox', keywords: 'mail send' },
  { to: '/ai-chat', icon: FaRobot, label: 'Ask the AI', hint: 'Plan in plain language', keywords: 'assistant chat' },
  { to: '/analytics', icon: FaChartLine, label: 'Review analytics', hint: 'See how the week went', keywords: 'stats charts' },
];

export const THEME_SHORTCUTS = [
  { id: 'light', label: 'Light mode', icon: FaRegSun },
  { id: 'dark', label: 'Dark mode', icon: FaRegMoon },
];

export const ALL_NAV_ITEMS = [
  ...NAV_SECTIONS.flatMap((section) => section.items.map((item) => ({ ...item, section: section.title }))),
  { ...SETTINGS_ITEM, section: 'Account' },
];

export const SEARCH_ENTRIES = [
  ...ALL_NAV_ITEMS.map((item) => ({
    type: 'page',
    label: item.label,
    to: item.to,
    icon: item.icon,
    hint: item.section,
    keywords: `${item.label} ${item.keywords || ''} ${item.section}`,
  })),
  ...QUICK_ACTIONS.map((action) => ({
    type: 'action',
    label: action.label,
    to: action.to,
    icon: action.icon,
    hint: action.hint,
    keywords: `${action.label} ${action.keywords || ''}`,
  })),
];
