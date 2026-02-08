import { useState, useEffect } from 'react';
import { FaWifi, FaSync, FaCloudDownloadAlt, FaTasks, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const Offline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [checking, setChecking] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([
    { id: 1, type: 'task', action: 'create', title: 'New Task', timestamp: Date.now() - 300000 },
    { id: 2, type: 'calendar', action: 'update', title: 'Meeting Updated', timestamp: Date.now() - 600000 },
  ]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      setIsOnline(response.ok);
    } catch {
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  const formatTime = (timestamp) => {
    const diff = Math.round((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 minute ago';
    if (diff < 60) return `${diff} minutes ago`;
    return `${Math.round(diff / 60)} hours ago`;
  };

  const getActionIcon = (type) => {
    return type === 'task' ? FaTasks : FaCalendarAlt;
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
        {pendingChanges.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Pending Changes ({pendingChanges.length})
            </h2>
            <div className="space-y-3">
              {pendingChanges.map((change) => {
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
                        <p className="font-medium text-gray-800 dark:text-white">{change.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{change.action}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{formatTime(change.timestamp)}</span>
                  </div>
                );
              })}
            </div>
            {isOnline && (
              <button className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium">
                Sync Now
              </button>
            )}
          </div>
        )}

        {/* Tips */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          💡 Tip: Enable notifications to get alerted when you're back online
        </p>
      </div>
    </div>
  );
};

export default Offline;

