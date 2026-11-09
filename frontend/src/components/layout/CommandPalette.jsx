import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaArrowRight,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaLightbulb,
  FaWindowClose,
} from 'react-icons/fa';
import { SEARCH_ENTRIES } from './navConfig';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const actions = useMemo(
    () => [
      {
        type: 'action',
        label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
        icon: isDark ? FaSun : FaMoon,
        hint: 'Appearance',
        run: toggleTheme,
        keywords: 'theme dark light appearance',
      },
      {
        type: 'action',
        label: 'Sign out',
        icon: FaSignOutAlt,
        hint: 'Account',
        run: () => logout({ redirect: true }),
        keywords: 'logout exit account',
      },
    ],
    [isDark, toggleTheme, logout]
  );

  const results = useMemo(() => {
    const pool = [...actions, ...SEARCH_ENTRIES];
    const term = query.trim().toLowerCase();
    if (!term) return pool.slice(0, 9);
    return pool
      .filter((entry) => `${entry.label} ${entry.hint} ${entry.keywords || ''}`.toLowerCase().includes(term))
      .slice(0, 9);
  }, [actions, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const entry = results[activeIndex];
        if (!entry) return;
        onClose();
        if (entry.run) entry.run();
        else if (entry.to) navigate(entry.to);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, results, activeIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="fixed inset-0 bg-neutral-950/55 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-lift animate-fade-up">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <FaSearch size={13} className="shrink-0 text-content-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, actions, settings…"
            className="flex-1 bg-transparent text-sm text-content placeholder:text-content-subtle focus:outline-none"
            aria-label="Search"
          />
          <button
            type="button"
            onClick={onClose}
            className="kbd"
            aria-label="Close search"
          >
            esc
          </button>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <FaLightbulb className="text-amber-400" size={18} />
              <p className="text-sm font-medium text-content">No matches for “{query}”</p>
              <p className="text-xs text-content-muted">
                Try “task”, “calendar”, “theme” or “settings”.
              </p>
            </li>
          )}

          {results.map((entry, index) => (
            <li key={`${entry.type}-${entry.label}`}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  onClose();
                  if (entry.run) entry.run();
                  else if (entry.to) navigate(entry.to);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  index === activeIndex ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200' : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-xs">
                  <entry.icon size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-content">{entry.label}</span>
                  <span className="block truncate text-[0.7rem] text-content-subtle">
                    {entry.type === 'action' ? 'Action' : entry.hint}
                  </span>
                </span>
                {entry.type === 'page' ? (
                  <FaArrowRight size={10} className="shrink-0 opacity-50" />
                ) : (
                  <FaWindowClose size={10} className="shrink-0 opacity-0" />
                )}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(`/search?q=${encodeURIComponent(query)}`);
          }}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-surface-sunken px-4 py-2 text-[0.7rem] font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10"
        >
          Search all my data for “{query || '…'}” <FaArrowRight size={8} />
        </button>

        <div className="flex items-center justify-between border-t border-line bg-surface-sunken px-4 py-2 text-[0.68rem] text-content-subtle">
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">↵</span>
            open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">esc</span>
            close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
