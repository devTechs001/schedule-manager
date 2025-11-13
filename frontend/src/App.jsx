import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AppProvider } from '@contexts/AppContext';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AIProvider } from '@contexts/AIContext';

// Layout
import Layout from '@components/layout/Layout';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Tasks = lazy(() => import('@pages/Tasks'));
const Emails = lazy(() => import('@pages/Emails'));
const Contacts = lazy(() => import('@pages/Contacts'));
const Schedule = lazy(() => import('@pages/Schedule'));
const Analytics = lazy(() => import('@pages/Analytics'));
const Settings = lazy(() => import('@pages/Settings'));
const Login = lazy(() => import('@pages/Auth/Login'));
const Register = lazy(() => import('@pages/Auth/Register'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return !user ? children : <Navigate to="/" replace />;
};

// Network status indicator
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="font-medium">You're offline</span>
    </div>
  );
};

// Main App Component
function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="emails" element={<Emails />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-9xl font-bold text-primary-600">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
                    Page Not Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>

      {/* Network Status Indicator */}
      <NetworkStatus />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <AIProvider>
              <AppContent />
            </AIProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;