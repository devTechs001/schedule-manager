import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaMoon, FaPalette, FaSun, FaAdjust, FaMagic } from 'react-icons/fa';
import { useTheme } from '@contexts/ThemeContext';

/**
 * ThemeMenu — a compact popover used in the header/top bar and on marketing
 * pages. Lets people switch mode, visual theme, accent and density.
 */
const ThemeMenu = ({ align = 'right', compact = false, className = '' }) => {
  const {
    theme: currentTheme,
    isDark,
    accent,
    density,
    themes,
    accents,
    setTheme,
    setAccent,
    setDensity,
    toggleTheme,
  } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <FaSun size={17} /> : <FaMoon size={17} />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`btn btn-ghost btn-icon ${open ? 'bg-gray-100 dark:bg-white/5' : ''}`}
          aria-label="Appearance settings"
          aria-expanded={open}
          title="Themes & accents"
        >
          <FaPalette size={17} />
        </button>
      </div>

      {open && (
        <div
          className={`absolute z-[90] mt-2 w-[min(18rem,calc(100vw-1.5rem))] origin-top overflow-hidden rounded-2xl border border-line bg-surface-raised p-4 shadow-lift animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
              Appearance
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Done
            </button>
          </div>

          {/* Mode */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                !isDark
                  ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                  : 'border-line text-content-muted hover:border-primary-300'
              }`}
            >
              <FaSun /> Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                isDark
                  ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                  : 'border-line text-content-muted hover:border-primary-300'
              }`}
            >
              <FaMoon /> Dark
            </button>
          </div>

          {/* Themes */}
          {!compact && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
                Theme
              </p>
              <div className="mb-4 space-y-1.5">
                {themes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                      currentTheme === option.id
                        ? 'border-primary-400 bg-primary-50/70 text-content dark:bg-primary-500/10'
                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border border-line"
                      style={{
                        background: `linear-gradient(135deg, ${option.swatch[0]} 0 50%, ${option.swatch[1]} 50% 100%)`,
                      }}
                    />
                    <span className="flex-1">{option.label}</span>
                    {currentTheme === option.id && <FaCheck className="text-primary-600" />}
                  </button>
                ))}
              </div>

              {/* Accents */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
                Accent
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {accents.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAccent(option.id)}
                    title={option.label}
                    aria-label={`${option.label} accent`}
                    aria-pressed={accent === option.id}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                      accent === option.id ? 'ring-2 ring-offset-2 ring-offset-surface-raised' : ''
                    }`}
                    style={{
                      backgroundColor: option.color,
                      '--tw-ring-color': option.color,
                    }}
                  >
                    {accent === option.id && <FaCheck size={10} className="text-white" />}
                  </button>
                ))}
              </div>

              {/* Density */}
              <div className="flex items-center justify-between rounded-xl bg-surface-sunken px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-medium text-content-muted">
                  <FaAdjust size={12} /> Compact mode
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={density === 'compact'}
                  onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    density === 'compact' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      density === 'compact' ? 'translate-x-[1.15rem]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-content-subtle">
                <FaMagic size={10} /> Saved automatically on this device
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeMenu;
