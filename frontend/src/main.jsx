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
            <div className="text-6xl mb-4">⚠️</div>
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
            {process.env.NODE_ENV === 'development' && (
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

// Request notification permission on app load
if ('Notification' in window && Notification.permission === 'default') {
  setTimeout(() => {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }, 3000); // Ask after 3 seconds to not annoy users immediately
}

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  if (theme === 'dark') {
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

// Render App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

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