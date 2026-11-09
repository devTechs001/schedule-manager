import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AppProvider } from '@contexts/AppContext';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AIProvider } from '@contexts/AIContext';
import { CollaborationProvider } from '@contexts/CollaborationContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import { OfflineProvider } from '@contexts/OfflineContext';
import { PerformanceProvider } from '@contexts/PerformanceContext';

// Layout
import Layout from '@components/layout/Layout';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Public / marketing (eager — this is the first paint for logged-out visitors)
import Home from '@pages/Public/Home';
import PublicLayout from '@pages/Public/PublicLayout';
const Features = lazy(() => import('@pages/Public/Features'));
const About = lazy(() => import('@pages/Public/About'));
const Contact = lazy(() => import('@pages/Public/Contact'));

// Main app pages
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Tasks = lazy(() => import('@pages/Tasks'));
const Emails = lazy(() => import('@pages/Emails'));
const Contacts = lazy(() => import('@pages/Contacts'));
const Schedule = lazy(() => import('@pages/Schedule'));
const Analytics = lazy(() => import('@pages/Analytics'));
const Settings = lazy(() => import('@pages/Settings'));
const Planner = lazy(() => import('@pages/Planner'));
const Focus = lazy(() => import('@pages/Focus'));
const SearchPage = lazy(() => import('@pages/Search'));

// AI tools
const AIInsights = lazy(() => import('@pages/AI/AIInsights'));
const AIChat = lazy(() => import('@pages/AI/AIChat'));
const PredictiveScheduler = lazy(() => import('@pages/AI/PredictiveScheduler'));
const MeetingAssistant = lazy(() => import('@pages/AI/MeetingAssistant'));

// Gamification
const Leaderboard = lazy(() => import('@pages/Gamification/Leaderboard'));
const Achievements = lazy(() => import('@pages/Gamification/Achievements'));
const Challenges = lazy(() => import('@pages/Gamification/Challenges'));
const Rewards = lazy(() => import('@pages/Gamification/Rewards'));

// Analytics sub-pages
const PerformanceAnalytics = lazy(() => import('@pages/Analytics/Performance'));
const TimeTrackingPage = lazy(() => import('@pages/Analytics/TimeTracking'));
const ProductivityAnalytics = lazy(() => import('@pages/Analytics/Productivity'));

// Auth
const Login = lazy(() => import('@pages/Auth/Login'));
const Register = lazy(() => import('@pages/Auth/Register'));
const BiometricSetup = lazy(() => import('@pages/Auth/BiometricSetup'));

// Settings sub-pages
const SettingsIntegrations = lazy(() => import('@pages/Settings/Integrations'));
const SettingsNotifications = lazy(() => import('@pages/Settings/Notifications'));
const SettingsSecurity = lazy(() => import('@pages/Settings/Security'));
const SettingsAccessibility = lazy(() => import('@pages/Settings/Accessibility'));

// Collaboration
const TeamWorkspace = lazy(() => import('@pages/Collaboration/TeamWorkspace'));
const Projects = lazy(() => import('@pages/Collaboration/Projects'));
const Meetings = lazy(() => import('@pages/Collaboration/Meetings'));

// Onboarding
const Welcome = lazy(() => import('@pages/Onboarding/Welcome'));
const SetupWizard = lazy(() => import('@pages/Onboarding/SetupWizard'));
const Tour = lazy(() => import('@pages/Onboarding/Tour'));

// Error pages
const NotFound = lazy(() => import('@pages/Error/404'));
const ServerError = lazy(() => import('@pages/Error/500'));
const Offline = lazy(() => import('@pages/Error/Offline'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
    <LoadingSpinner size="lg" />
    <p className="text-sm text-content-muted">Loading…</p>
  </div>
);

const FullScreenLoader = () => (
  <div className="app-shell flex min-h-screen items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-sm font-medium text-content-muted">Setting things up…</p>
    </div>
  </div>
);

/** Requires an authenticated user; remembers where they were headed. */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
};

/** Keeps signed-in users out of /login and /register. */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/** Scrolls to top on every navigation for the app shell. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

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
    <div className="fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-lift dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      You are offline — changes are saved locally
    </div>
  );
};

function AppContent() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ScrollToTop />
      <Routes>
        {/* ================= PUBLIC MARKETING (SPA) ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ================= AUTH ================= */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* ================= ONBOARDING (public) ================= */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/tour" element={<Tour />} />

        {/* ================= APP SHELL (protected) ================= */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/emails" element={<Emails />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/performance" element={<PerformanceAnalytics />} />
          <Route path="/analytics/time-tracking" element={<TimeTrackingPage />} />
          <Route path="/analytics/productivity" element={<ProductivityAnalytics />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/integrations" element={<SettingsIntegrations />} />
          <Route path="/settings/notifications" element={<SettingsNotifications />} />
          <Route path="/settings/security" element={<SettingsSecurity />} />
          <Route path="/settings/accessibility" element={<SettingsAccessibility />} />

          <Route path="/collaboration" element={<TeamWorkspace />} />
          <Route path="/collaboration/projects" element={<Projects />} />
          <Route path="/collaboration/meetings" element={<Meetings />} />

          <Route path="/ai/insights" element={<AIInsights />} />
          <Route path="/ai/chat" element={<AIChat />} />
          <Route path="/ai/scheduler" element={<PredictiveScheduler />} />
          <Route path="/ai/meeting-assistant" element={<MeetingAssistant />} />
          {/* Short aliases used by the sidebar / command palette */}
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/predictive-scheduler" element={<PredictiveScheduler />} />
          <Route path="/meeting-assistant" element={<MeetingAssistant />} />

          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/rewards" element={<Rewards />} />

          <Route path="/biometric-setup" element={<BiometricSetup />} />
        </Route>

        {/* ================= ERRORS ================= */}
        <Route path="/offline" element={<Offline />} />
        <Route path="/error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
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
                      <NetworkStatus />
                      <Toaster
                        position="top-right"
                        gutter={8}
                        toastOptions={{
                          duration: 4000,
                          className: 'toast-root',
                          success: { duration: 3000 },
                          error: { duration: 5000 },
                        }}
                      />
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
