import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar, { useSidebarPreference } from './Sidebar';
import BottomNavigation from './BottomNavigation';
import CommandPalette from './CommandPalette';
import ShortcutSheet from './ShortcutSheet';
import { useTheme } from '@contexts/ThemeContext';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { QUICK_ACTIONS } from './navConfig';
import { useAuth } from '@contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaBolt } from 'react-icons/fa';

const QuickActionFab = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-20 right-4 z-[68] lg:bottom-6 lg:right-6">
      {open && (
        <div className="mb-3 space-y-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(action.to);
              }}
              className="flex w-60 items-center gap-3 rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-left shadow-lift animate-fade-up"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                <action.icon size={12} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-content">{action.label}</span>
                <span className="block truncate text-[0.65rem] text-content-subtle">{action.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-gradient text-white shadow-glow transition-transform hover:scale-105"
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
      >
        {open ? <FaTimes size={16} /> : <FaPlus size={16} />}
      </button>
    </div>
  );
};

const DemoBanner = () => {
  const { isDemo } = useAuth();
  if (!isDemo) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary-200/60 bg-primary-50 px-4 py-2 text-xs text-primary-800 dark:border-primary-500/25 dark:bg-primary-500/10 dark:text-primary-200 sm:px-6 lg:px-8">
      <span className="flex items-center gap-2">
        <FaBolt size={10} />
        <span>
          <span className="font-semibold">Demo mode</span> — you are exploring a sandbox. Data may
          reset when the session ends.
        </span>
      </span>
      <Link to="/register" className="font-semibold underline underline-offset-2 hover:no-underline">
        Create a real account
      </Link>
    </div>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { collapsed, toggle } = useSidebarPreference();
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Global keyboard shortcuts: "/" search, "?" help, "g x" navigation, "t" theme
  useEffect(() => {
    let pendingG = false;
    let pendingTimer = null;

    const onKeyDown = (event) => {
      const target = event.target;
      const typing =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();

      if (pendingG) {
        pendingG = false;
        window.clearTimeout(pendingTimer);
        const routes = {
          d: '/dashboard',
          t: '/tasks',
          p: '/planner',
          c: '/schedule',
          i: '/emails',
          f: '/focus',
          a: '/analytics',
          s: '/settings',
        };
        if (routes[key]) {
          event.preventDefault();
          navigate(routes[key]);
        }
        return;
      }

      if (key === '/') {
        event.preventDefault();
        setSearchOpen(true);
      } else if (key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (key === 'g') {
        pendingG = true;
        pendingTimer = window.setTimeout(() => {
          pendingG = false;
        }, 1200);
      } else if (key === 't') {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(pendingTimer);
    };
  }, [navigate, toggleTheme]);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggle}
      />

      <div
        className="min-h-screen pb-24 transition-[margin] duration-300 ease-spring lg:pb-0"
        style={{ marginLeft: 0 }}
        data-collapsed={collapsed ? 'true' : 'false'}
        id="app-content"
      >
        <Header onMenuClick={() => setSidebarOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <DemoBanner />

        <main id="main-content" className="app-main">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <QuickActionFab />
      <BottomNavigation />
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShortcutSheet isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
};

export default Layout;
