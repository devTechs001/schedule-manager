import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

/**
 * Theme system
 * ------------------------------------------------------------------
 * - `mode`   light | dark | system
 * - `theme`  visual theme (defaults to the mode so existing components keep
 *            working): `light`, `dark`, `midnight`, `nord`, `sand`
 * - `accent` accent hue applied on top of the theme
 * - `density` comfortable | compact
 *
 * Everything is persisted to localStorage and applied as data attributes on
 * <html> so CSS variables (and Tailwind) pick the values up instantly.
 */

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'light', label: 'Daylight', mode: 'light', swatch: ['#6366f1', '#f8fafc'] },
  { id: 'dark', label: 'Slate', mode: 'dark', swatch: ['#818cf8', '#0d1426'] },
  { id: 'midnight', label: 'Midnight', mode: 'dark', swatch: ['#60a5fa', '#0b1120'] },
  { id: 'nord', label: 'Nord', mode: 'dark', swatch: ['#5e81ac', '#2e3440'] },
  { id: 'sand', label: 'Sand', mode: 'light', swatch: ['#b45309', '#fdfbf7'] },
];

export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', color: '#6366f1' },
  { id: 'ocean', label: 'Ocean', color: '#06b6d4' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'sunset', label: 'Sunset', color: '#f97316' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
];

const DENSITIES = ['comfortable', 'compact'];

const STORAGE = {
  theme: 'theme',
  mode: 'theme-mode',
  accent: 'theme-accent',
  density: 'theme-density',
  motion: 'theme-motion',
};

const read = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value || fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode) */
  }
};

const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

const systemMode = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  // A stored theme id wins; otherwise fall back to the legacy `theme` key so
  // users who toggled dark mode before this change keep their preference.
  const [theme, setThemeState] = useState(() => {
    const legacy = read(STORAGE.theme, null);
    if (legacy === 'light' || legacy === 'dark') {
      const stored = read(STORAGE.mode, null);
      return stored ? themeById(stored).id : legacy;
    }
    return read(STORAGE.mode, systemMode() === 'dark' ? 'dark' : 'light');
  });

  const [accent, setAccentState] = useState(() => read(STORAGE.accent, 'indigo'));
  const [density, setDensityState] = useState(() => read(STORAGE.density, 'comfortable'));
  const [reducedMotion, setReducedMotionState] = useState(
    () => read(STORAGE.motion, 'auto') === 'reduced'
  );
  const [system, setSystem] = useState(systemMode);

  // Track the OS preference when theme is "system"
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => setSystem(event.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? system : themeById(theme).id;
  const mode = themeById(resolvedTheme).mode;

  // Apply everything to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.remove('light', 'dark-generated');
    root.classList.add(mode === 'dark' ? 'dark' : 'light');
    root.dataset.theme = resolvedTheme;
    root.dataset.accent = accent;
    root.dataset.density = DENSITIES.includes(density) ? density : 'comfortable';
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.style.colorScheme = mode === 'dark' ? 'dark' : 'light';

    // Keep the browser chrome in sync with the active theme
    const themeColor = getComputedStyle(root).getPropertyValue('--surface').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && themeColor) {
      const [r, g, b] = themeColor.split(/\s+/).map(Number);
      if (!Number.isNaN(r)) meta.setAttribute('content', `rgb(${r}, ${g}, ${b})`);
    }
  }, [resolvedTheme, mode, accent, density, reducedMotion]);

  // Persist
  useEffect(() => {
    write(STORAGE.mode, resolvedTheme);
  }, [resolvedTheme]);
  useEffect(() => write(STORAGE.theme, mode), [mode]);
  useEffect(() => write(STORAGE.accent, accent), [accent]);
  useEffect(() => write(STORAGE.density, density), [density]);
  useEffect(() => write(STORAGE.motion, reducedMotion ? 'reduced' : 'auto'), [reducedMotion]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE.mode && event.newValue) setThemeState(event.newValue);
      if (event.key === STORAGE.accent && event.newValue) setAccentState(event.newValue);
      if (event.key === STORAGE.density && event.newValue) setDensityState(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'system' ? 'system' : themeById(next).id);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentMode = current === 'system' ? system : themeById(current).mode;
      return currentMode === 'dark' ? 'light' : 'dark';
    });
  }, [system]);

  const setAccent = useCallback((next) => {
    if (ACCENTS.some((a) => a.id === next)) setAccentState(next);
  }, []);

  const setDensity = useCallback((next) => {
    if (DENSITIES.includes(next)) setDensityState(next);
  }, []);

  const setReducedMotion = useCallback((next) => {
    setReducedMotionState(Boolean(next));
  }, []);

  const cycleAccent = useCallback(() => {
    setAccentState((current) => {
      const index = ACCENTS.findIndex((a) => a.id === current);
      return ACCENTS[(index + 1) % ACCENTS.length].id;
    });
  }, []);

  const value = useMemo(
    () => ({
      // New API
      theme: resolvedTheme,
      themeId: resolvedTheme,
      mode,
      isDark: mode === 'dark',
      accent,
      density,
      reducedMotion,
      themes: THEMES,
      accents: ACCENTS,
      setTheme,
      setAccent,
      setDensity,
      setReducedMotion,
      cycleAccent,
      // Backwards compatible API
      toggleTheme,
    }),
    [resolvedTheme, mode, accent, density, reducedMotion, setTheme, setAccent, setDensity, setReducedMotion, cycleAccent, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
