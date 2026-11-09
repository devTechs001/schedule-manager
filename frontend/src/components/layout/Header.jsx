import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaBars,
  FaSearch,
  FaSignOutAlt,
  FaCog,
  FaUser,
  FaChevronDown,
  FaHome,
} from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';
import ThemeMenu from './ThemeMenu';
import { ALL_NAV_ITEMS } from './navConfig';
import { buildReminders, summariseReminders } from '@utils/reminders';
import { subscribeActivity, getActivitySnapshot } from '@services/store/activitySnapshot';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/activity': 'Activity hub',
  '/tasks': 'Tasks',
  '/schedule': 'Schedule',
  '/planner': 'Daily planner',
  '/focus': 'Focus timer',
  '/search': 'Search',
  '/emails': 'Inbox',
  '/contacts': 'Contacts',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/ai-insights': 'AI insights',
  '/ai-chat': 'AI chat',
  '/predictive-scheduler': 'Predictive planner',
  '/meeting-assistant': 'Meeting assistant',
  '/collaboration': 'Team overview',
  '/collaboration/projects': 'Projects',
  '/leaderboard': 'Leaderboard',
  '/achievements': 'Achievements',
  '/challenges': 'Challenges',
  '/rewards': 'Rewards',
};

const NotificationsPanel = ({ open, onClose }) => {
  // Same shared snapshot as the bell badge — no fetching in the layout.
  const { tasks, events } = useSyncExternalStore(
    subscribeActivity,
    getActivitySnapshot,
    getActivitySnapshot
  );
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!open) return undefined;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, [open]);

  const reminders = buildReminders({ tasks, events, now, lookaheadHours: 24 });
  const summary = summariseReminders(reminders);
  const top = reminders.slice(0, 4);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[85]" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full z-[86] mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-lift animate-fade-in">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-content">Needs attention</p>
          <span className={`badge ${summary.urgent > 0 ? 'badge-danger' : 'badge-success'}`}>
            {summary.urgent > 0 ? summary.urgent : 'clear'}
          </span>
        </div>

        {top.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-content-muted">
            Nothing overdue or starting soon. Nice work.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {top.map((reminder) => (
              <li key={`${reminder.source}-${reminder.id}`} className="flex gap-3 px-4 py-3">
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                    reminder.severity === 'critical' || reminder.severity === 'high'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-content">{reminder.title}</p>
                  <p className="mt-0.5 text-xs capitalize text-content-muted">{reminder.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/activity"
          onClick={onClose}
          className="block border-t border-line px-4 py-2.5 text-center text-xs font-semibold text-primary-600 hover:bg-surface-sunken"
        >
          Open activity hub
        </Link>
        <Link
          to="/settings/notifications"
          onClick={onClose}
          className="block border-t border-line px-4 py-2 text-center text-[0.68rem] text-content-subtle hover:bg-surface-sunken"
        >
          Notification settings
        </Link>
      </div>
    </>
  );
};

const Header = ({ onMenuClick, onOpenSearch, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);

  // Live urgent count for the bell badge. Reads the shared snapshot published
  // by whichever page already fetched the data — the header must never trigger
  // its own request, or every route change would double the traffic.
  const activity = useSyncExternalStore(subscribeActivity, getActivitySnapshot, getActivitySnapshot);
  const [bellNow, setBellNow] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setBellNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const headerUrgent = useMemo(
    () =>
      summariseReminders(
        buildReminders({
          tasks: activity.tasks,
          events: activity.events,
          now: bellNow,
          lookaheadHours: 24,
        })
      ).urgent,
    [activity, bellNow]
  );

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  // Cmd/Ctrl+K anywhere opens search
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpenSearch]);

  const title = PAGE_TITLES[location.pathname] || breadcrumb || 'Dashboard';
  const parent = ALL_NAV_ITEMS.find((item) => item.to === location.pathname)?.section;
  const initials = (user?.name || 'You')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-[65] flex h-[var(--header-h)] items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon -ml-2 lg:hidden"
        aria-label="Open menu"
      >
        <FaBars size={17} />
      </button>

      {/* Breadcrumb */}
      <div className="min-w-0">
        <nav className="hidden items-center gap-1.5 text-[0.7rem] font-medium text-content-subtle sm:flex" aria-label="Breadcrumb">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary-600">
            <FaHome size={9} /> App
          </Link>
          {parent && parent !== 'My work' && (
            <>
              <span aria-hidden="true">/</span>
              <span>{parent}</span>
            </>
          )}
        </nav>
        <h1 className="truncate text-base font-semibold text-content">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="group hidden items-center gap-2 rounded-xl border border-line bg-surface-sunken/70 px-3 py-2 text-xs text-content-subtle transition-colors hover:border-primary-300 hover:text-content sm:flex"
          aria-label="Open command palette"
        >
          <FaSearch size={11} />
          <span className="w-28 text-left lg:w-40">Search anything…</span>
          <span className="kbd ml-1 hidden lg:inline-flex">⌘K</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="btn btn-ghost btn-icon sm:hidden"
          aria-label="Search"
        >
          <FaSearch size={15} />
        </button>

        <ThemeMenu />

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className={`btn btn-ghost btn-icon ${notificationsOpen ? 'bg-gray-100 dark:bg-white/5' : ''}`}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <FaBell size={16} />
            {headerUrgent > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
                {headerUrgent > 9 ? '9+' : headerUrgent}
              </span>
            )}
          </button>
          <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-1 flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-[0.65rem] font-bold text-white">
              {initials}
            </span>
            <span className="hidden max-w-[9rem] truncate text-xs font-semibold text-content md:block">
              {user?.name?.split(' ')[0] || 'Guest'}
            </span>
            <FaChevronDown size={9} className="hidden text-content-subtle md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-lift animate-fade-in">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-semibold text-content">{user?.name || 'Guest'}</p>
                <p className="truncate text-xs text-content-subtle">{user?.email || 'Not signed in'}</p>
                {user?.role && (
                  <span className="badge badge-accent mt-2 capitalize">{user.role}</span>
                )}
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-muted hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <FaUser size={12} /> Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-muted hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <FaCog size={12} /> Settings
                </button>
                <button
                  type="button"
                  onClick={() => logout({ redirect: true })}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <FaSignOutAlt size={12} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
