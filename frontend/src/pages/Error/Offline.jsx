import { useState, useEffect } from 'react';
import { FaWifi, FaSync, FaCloudDownloadAlt, FaTasks, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { useOfflineOptional } from '@contexts/OfflineContext';
import config from '../../config/app';

/**
 * `/health` lives at the API root, not under the `/api` prefix. Derive it from
 * the configured base so a deployment that sets VITE_API_URL to an absolute
 * origin still points at the right host.
 */
const HEALTH_ENDPOINT = `${String(config.apiUrl || '/api').replace(/\/$/, '').replace(/\/api$/, '')}/health`;

/**
 * Offline page.
 *
 * The "Pending Changes" list used to be two hardcoded rows — "New Task" and
 * "Meeting Updated" — invented on every visit, whatever the user had actually
 * queued. The app does have a real offline queue (OfflineContext, backed by
 * IndexedDB), so this reads from that instead. "Sync Now" was a button with no
 * handler; it now flushes the queue.
 */
const Offline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);
  const { pendingActions, queueSize, syncInProgress, forceSync } = useOfflineOptional();

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

  /**
   * The health route is mounted at the server root (`/health`), not under
   * `/api` — see Status.jsx, which has always called the right one. This used
   * to fetch `/api/health`, which is a 404, so the check reported "offline"
   * every single time, even on a healthy connection.
   */
  const checkConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch(HEALTH_ENDPOINT, { method: 'HEAD', cache: 'no-cache' });
      setIsOnline(response.ok);
    } catch {
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  const formatTime = (timestamp) => {
    const then = new Date(timestamp).getTime();
    if (!Number.isFinite(then)) return '';
    const diff = Math.round((Date.now() - then) / 60000);
    if (diff < 0) return 'Just now';
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 minute ago';
    if (diff < 60) return `${diff} minutes ago`;
    return `${Math.round(diff / 60)} hours ago`;
  };

  const getActionIcon = (type) => {
    return type === 'task' ? FaTasks : FaCalendarAlt;
  };

  const describeAction = (action) => {
    const title = action?.data?.title || action?.title;
    if (title) return title;
    return action?.action ? `${action.type || 'Change'} ${action.action}` : 'Queued change';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              <FaWifi className={`text-6xl ${
                isOnline ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>
            {!isOnline && (
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">!</span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          {isOnline ? "You're Back Online!" : "You're Offline"}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {isOnline
            ? 'Your connection has been restored. Syncing your changes...'
            : "Don't worry! You can still access your data. Changes will sync when you're back online."}
        </p>

        {/* Connection Check Button */}
        <button
          onClick={checkConnection}
          disabled={checking}
          className={`flex items-center justify-center mx-auto px-6 py-3 rounded-xl transition-colors mb-8 ${
            isOnline
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50`}
        >
          <FaSync className={`mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : isOnline ? 'Connected' : 'Check Connection'}
        </button>

        {/* Offline Capabilities */}
        {!isOnline && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-center">
              <FaCloudDownloadAlt className="mr-2 text-blue-500" />
              Available Offline
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FaTasks, label: 'View Tasks' },
                { icon: FaCalendarAlt, label: 'View Calendar' },
                { icon: FaCheck, label: 'Complete Tasks' },
                { icon: FaSync, label: 'Create Tasks' },
              ].map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <item.icon className="text-2xl text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Changes */}
        {pendingActions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Pending Changes ({queueSize || pendingActions.length})
            </h2>
            <div className="space-y-3">
              {pendingActions.map((change) => {
                const Icon = getActionIcon(change.type);
                return (
                  <div
                    key={change.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        change.type === 'task' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Icon className={change.type === 'task' ? 'text-blue-500' : 'text-purple-500'} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800 dark:text-white">{describeAction(change)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{change.action || change.type}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{formatTime(change.timestamp)}</span>
                  </div>
                );
              })}
            </div>
            {isOnline && (
              <button
                onClick={() => forceSync()}
                disabled={syncInProgress}
                className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl font-medium"
              >
                {syncInProgress ? 'Syncing…' : 'Sync Now'}
              </button>
            )}
          </div>
        )}

        {pendingActions.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nothing is waiting to sync. Changes you make while offline appear here
              and are sent once the connection returns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offline;

