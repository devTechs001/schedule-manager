import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AppProvider } from '@contexts/AppContext';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AIProvider } from '@contexts/AIContext';
import { CollaborationProvider } from '@context/CollaborationContext';
import { NotificationProvider } from '@context/NotificationContext';
import { OfflineProvider } from '@context/OfflineContext';
import { PerformanceProvider } from '@context/PerformanceContext';

// Layout
import Layout from '@components/layout/Layout';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Lazy load pages - Main
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Tasks = lazy(() => import('@pages/Tasks'));
const Emails = lazy(() => import('@pages/Emails'));
const Contacts = lazy(() => import('@pages/Contacts'));
const Schedule = lazy(() => import('@pages/Schedule'));
const Analytics = lazy(() => import('@pages/Analytics'));
const Settings = lazy(() => import('@pages/Settings'));

// Lazy load pages - AI Tools
const AIInsights = lazy(() => import('@pages/AI/AIInsights'));
const AIChat = lazy(() => import('@pages/AI/AIChat'));
const PredictiveScheduler = lazy(() => import('@pages/AI/PredictiveScheduler'));
const MeetingAssistant = lazy(() => import('@pages/AI/MeetingAssistant'));

// Lazy load pages - Gamification
const Leaderboard = lazy(() => import('@pages/Gamification/Leaderboard'));
const Achievements = lazy(() => import('@pages/Gamification/Achievements'));
const Challenges = lazy(() => import('@pages/Gamification/Challenges'));
const Rewards = lazy(() => import('@pages/Gamification/Rewards'));

// Lazy load pages - Analytics
const PerformanceAnalytics = lazy(() => import('@pages/Analytics/Performance'));
const TimeTracking = lazy(() => import('@pages/Analytics/TimeTracking'));
const ProductivityAnalytics = lazy(() => import('@pages/Analytics/Productivity'));

// Lazy load pages - Auth
const Login = lazy(() => import('@pages/Auth/Login'));
const Register = lazy(() => import('@pages/Auth/Register'));
const BiometricSetup = lazy(() => import('@pages/Auth/BiometricSetup'));

// Lazy load pages - Settings
const SettingsIntegrations = lazy(() => import('@pages/Settings/Integrations'));
const SettingsNotifications = lazy(() => import('@pages/Settings/Notifications'));
const SettingsSecurity = lazy(() => import('@pages/Settings/Security'));
const SettingsAccessibility = lazy(() => import('@pages/Settings/Accessibility'));

// Lazy load pages - Collaboration
const TeamWorkspace = lazy(() => import('@pages/Collaboration/TeamWorkspace'));
const Projects = lazy(() => import('@pages/Collaboration/Projects'));
const Meetings = lazy(() => import('@pages/Collaboration/Meetings'));

// Lazy load pages - Onboarding
const SplashScreen = lazy(() => import('@pages/Onboarding/SplashScreen'));
const Welcome = lazy(() => import('@pages/Onboarding/Welcome'));
const SetupWizard = lazy(() => import('@pages/Onboarding/SetupWizard'));
const Tour = lazy(() => import('@pages/Onboarding/Tour'));

// Lazy load pages - Error
const NotFound = lazy(() => import('@pages/Error/404'));
const ServerError = lazy(() => import('@pages/Error/500'));
const Offline = lazy(() => import('@pages/Error/Offline'));

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
          {/* Onboarding Routes - Always available */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="/tour" element={<Tour />} />

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

          {/* Auth Routes */}
          <Route
            path="/biometric-setup"
            element={
              <ProtectedRoute>
                <BiometricSetup />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Layout with Outlet */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="emails" element={<Emails />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="analytics" element={<Analytics />} />

            {/* Analytics Sub-routes */}
            <Route path="analytics/performance" element={<PerformanceAnalytics />} />
            <Route path="analytics/time-tracking" element={<TimeTracking />} />
            <Route path="analytics/productivity" element={<ProductivityAnalytics />} />

            {/* Settings Routes */}
            <Route path="settings" element={<Settings />} />
            <Route path="settings/integrations" element={<SettingsIntegrations />} />
            <Route path="settings/notifications" element={<SettingsNotifications />} />
            <Route path="settings/security" element={<SettingsSecurity />} />
            <Route path="settings/accessibility" element={<SettingsAccessibility />} />

            {/* Collaboration Routes */}
            <Route path="collaboration" element={<TeamWorkspace />} />
            <Route path="collaboration/workspace" element={<TeamWorkspace />} />
            <Route path="collaboration/projects" element={<Projects />} />
            <Route path="collaboration/meetings" element={<Meetings />} />

            {/* AI Routes */}
            <Route path="ai/insights" element={<AIInsights />} />
            <Route path="ai/chat" element={<AIChat />} />
            <Route path="ai/scheduler" element={<PredictiveScheduler />} />
            <Route path="ai/meeting-assistant" element={<MeetingAssistant />} />

            {/* AI Routes - Hyphenated versions for sidebar compatibility */}
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="predictive-scheduler" element={<PredictiveScheduler />} />
            <Route path="meeting-assistant" element={<MeetingAssistant />} />

            {/* Gamification Routes */}
            <Route path="gamification/leaderboard" element={<Leaderboard />} />
            <Route path="gamification/achievements" element={<Achievements />} />
            <Route path="gamification/challenges" element={<Challenges />} />
            <Route path="gamification/rewards" element={<Rewards />} />

            {/* Gamification Routes - Hyphenated versions for sidebar compatibility */}
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="rewards" element={<Rewards />} />
          </Route>

          {/* Error Routes */}
          <Route path="/offline" element={<Offline />} />
          <Route path="/error" element={<ServerError />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
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
              <CollaborationProvider>
                <NotificationProvider>
                  <OfflineProvider>
                    <PerformanceProvider>
                      <AppContent />
                    </PerformanceProvider>
                  </OfflineProvider>
                </NotificationProvider>
              </CollaborationProvider>
            </AIProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;