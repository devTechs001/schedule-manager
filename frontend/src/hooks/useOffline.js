import { useState, useEffect } from 'react';
import syncManager from '@services/storage/syncManager';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedActions, setQueuedActions] = useState([]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncManager.syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = async (action, data) => {
    await syncManager.queueAction({ action, data, timestamp: Date.now() });
    setQueuedActions(prev => [...prev, { action, data }]);
  };

  return {
    isOnline,
    queuedActions,
    queueAction,
  };
};