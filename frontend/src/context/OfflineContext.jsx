import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OfflineContext = createContext();

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'pending', 'syncing', 'error'

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(true);
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOnline(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue change for sync
  const queueChange = useCallback((change) => {
    const pendingChange = {
      id: Date.now(),
      ...change,
      timestamp: new Date(),
      status: 'pending',
    };
    setPendingChanges(prev => [...prev, pendingChange]);
    setSyncStatus('pending');

    // Store in IndexedDB or localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('pendingChanges') || '[]');
    localStorage.setItem('pendingChanges', JSON.stringify([...stored, pendingChange]));

    return pendingChange;
  }, []);

  // Sync pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || pendingChanges.length === 0) {
      setIsReconnecting(false);
      return;
    }

    setSyncStatus('syncing');

    try {
      for (const change of pendingChanges) {
        // Simulate API call
        await new Promise(r => setTimeout(r, 500));
        
        // Mark change as synced
        setPendingChanges(prev =>
          prev.map(c => c.id === change.id ? { ...c, status: 'synced' } : c)
        );
      }

      // Clear synced changes
      setPendingChanges(prev => prev.filter(c => c.status !== 'synced'));
      localStorage.setItem('pendingChanges', JSON.stringify([]));
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      setIsReconnecting(false);
    }
  }, [isOnline, pendingChanges]);

  // Retry sync
  const retrySync = useCallback(() => {
    if (isOnline) {
      syncPendingChanges();
    }
  }, [isOnline, syncPendingChanges]);

  // Clear pending changes
  const clearPendingChanges = useCallback(() => {
    setPendingChanges([]);
    localStorage.setItem('pendingChanges', JSON.stringify([]));
    setSyncStatus('synced');
  }, []);

  // Get cached data
  const getCachedData = useCallback((key) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  // Set cached data
  const setCachedData = useCallback((key, data) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  // Check if data is stale
  const isDataStale = useCallback((key, maxAge = 300000) => {
    const cached = getCachedData(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp > maxAge;
  }, [getCachedData]);

  const value = {
    isOnline,
    isReconnecting,
    lastOnline,
    pendingChanges,
    pendingCount: pendingChanges.length,
    syncStatus,
    queueChange,
    syncPendingChanges,
    retrySync,
    clearPendingChanges,
    getCachedData,
    setCachedData,
    isDataStale,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext;

