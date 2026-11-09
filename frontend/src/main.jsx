import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/animations.css';

// Import service worker registration
import { registerSW } from 'virtual:pwa-register';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient text-white shadow-glow">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 8v5" />
                <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
                <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
            {import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });
}

// Notification permission is requested from Settings → Notifications, never
// on page load. Unprompted permission dialogs are blocked by browsers anyway.

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme-mode') || localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (theme === 'dark' || theme === 'midnight' || theme === 'nord') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initializeTheme();

// Performance monitoring (optional)
if (import.meta.env.PROD) {
  // Report Web Vitals
  const reportWebVitals = (metric) => {
    console.log(metric);
    // You can send to analytics here
  };

  // Listen for web vitals
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals(entry);
        }
      });
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (e) {
      console.error('Performance observer error:', e);
    }
  }
}

/**
 * Tear down the boot splash painted by index.html. We fade it out only after
 * React has committed its first paint, so users never see an empty screen.
 */
const dismissBootSplash = () => {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;

  const status = document.getElementById('boot-status');
  if (status) status.textContent = 'Ready';

  // Hand the background over to the app before fading, so a themed page never
  // flashes the splash's neutral backdrop on the way out.
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface');
  if (surface.trim()) {
    document.body.style.background = `rgb(${surface.trim().split(/\s+/).join(', ')})`;
  }

  // On the marketing home the hero artwork is already painted underneath, so
  // dissolve the splash instead of sliding out — the transition reads as one
  // continuous first screen rather than a loader being swapped for a page.
  if (window.location.pathname === '/' || /^\/(features|about|contact)\/?$/.test(window.location.pathname)) {
    splash.style.transition = 'opacity 0.55s ease';
  }

  splash.classList.add('boot--leaving');
  // Remove from the DOM after the fade so it cannot trap pointer events.
  const remove = () => splash.remove();
  splash.addEventListener('transitionend', remove, { once: true });
  setTimeout(remove, 700);
};

/**
 * GitHub Pages fallback. public/404.html rewrites a deep link into
 * `?redirect=/the/original/path`; restore it here, before the router mounts,
 * so the history entry is correct on the very first render.
 */
const restoreRedirectedPath = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('redirect');
    if (!target || !target.startsWith('/')) return;
    params.delete('redirect');
    const query = params.toString();
    const next = `${target}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', next);
  } catch {
    /* malformed URL — let the router show the 404 page */
  }
};

restoreRedirectedPath();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Double rAF: the first frame has been scheduled, the second guarantees the
// root has painted something before the splash goes away.
requestAnimationFrame(() => {
  requestAnimationFrame(dismissBootSplash);
});

// Safety net — never let a stalled boundary leave the splash up forever.
setTimeout(dismissBootSplash, 12000);

// Log app version (helpful for debugging)
console.log(
  '%c🤖 AI Schedule Manager v1.0.0',
  'color: #6366f1; font-size: 20px; font-weight: bold;'
);
console.log(
  '%cBuilt with ❤️ using React + Vite',
  'color: #22c55e; font-size: 12px;'
);

if (import.meta.env.DEV) {
  console.log('%c⚡ Running in Development Mode', 'color: #f59e0b; font-weight: bold;');
}