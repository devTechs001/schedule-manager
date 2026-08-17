import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Dexie } from 'dexie';
import { syncManager } from '@services/storage/syncManager';

const OfflineContext = createContext();

const initialState = {
  isOnline: navigator.onLine,
  isOfflineMode: false,
  pendingActions: [],
  syncInProgress: false,
  lastSyncTime: null,
  syncErrors: [],
  offlineStorage: null,
  queueSize: 0,
};

const offlineReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    
    case 'SET_OFFLINE_MODE':
      return { ...state, isOfflineMode: action.payload };
    
    case 'ADD_PENDING_ACTION':
      return {
        ...state,
        pendingActions: [...state.pendingActions, action.payload],
        queueSize: state.queueSize + 1,
      };
    
    case 'REMOVE_PENDING_ACTION':
      const filteredActions = state.pendingActions.filter(
        action => action.id !== action.payload
      );
      return {
        ...state,
        pendingActions: filteredActions,
        queueSize: state.queueSize - 1,
      };
    
    case 'SET_SYNC_PROGRESS':
      return { ...state, syncInProgress: action.payload };
    
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    
    case 'ADD_SYNC_ERROR':
      return {
        ...state,
        syncErrors: [...state.syncErrors, action.payload],
      };
    
    case 'CLEAR_SYNC_ERRORS':
      return { ...state, syncErrors: [] };
    
    case 'SET_OFFLINE_STORAGE':
      return { ...state, offlineStorage: action.payload };
    
    case 'UPDATE_QUEUE_SIZE':
      return { ...state, queueSize: action.payload };
    
    default:
      return state;
  }
};

export const OfflineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);

  useEffect(() => {
    // Initialize offline storage
    const db = new Dexie('ScheduleManagerOffline');
    db.version(1).stores({
      pendingActions: '++id,type,timestamp,data',
      cachedData: '++id,type,endpoint,data,timestamp',
      syncLog: '++id,timestamp,action,status,error',
    });
    dispatch({ type: 'SET_OFFLINE_STORAGE', payload: db });

    // Listen for online/offline events
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      dispatch({ type: 'SET_OFFLINE_MODE', payload: false });
      // Trigger sync when coming back online
      if (state.queueSize > 0) {
        syncPendingActions();
      }
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      dispatch({ type: 'SET_OFFLINE_MODE', payload: true });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.queueSize]);

  const addPendingAction = async (action) => {
    try {
      const pendingAction = {
        ...action,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        retries: 0,
      };

      // Store in IndexedDB
      await state.offlineStorage.pendingActions.add(pendingAction);
      dispatch({ type: 'ADD_PENDING_ACTION', payload: pendingAction });

      // Try to sync if online
      if (state.isOnline && !state.syncInProgress) {
        syncPendingActions();
      }
    } catch (error) {
      console.error('Failed to add pending action:', error);
    }
  };

  const removePendingAction = async (actionId) => {
    try {
      await state.offlineStorage.pendingActions.delete(actionId);
      dispatch({ type: 'REMOVE_PENDING_ACTION', payload: actionId });
    } catch (error) {
      console.error('Failed to remove pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (state.syncInProgress || !state.isOnline) return;

    try {
      dispatch({ type: 'SET_SYNC_PROGRESS', payload: true });

      const pendingActions = await state.offlineStorage.pendingActions.toArray();
      
      for (const action of pendingActions) {
        try {
          await syncManager.syncAction(action);
          await removePendingAction(action.id);
        } catch (error) {
          // Increment retry count
          action.retries = (action.retries || 0) + 1;
          
          // Remove action if max retries exceeded
          if (action.retries >= 3) {
            await removePendingAction(action.id);
            dispatch({
              type: 'ADD_SYNC_ERROR',
              payload: {
                action,
                error: error.message,
                timestamp: new Date().toISOString(),
              },
            });
          } else {
            // Update retry count
            await state.offlineStorage.pendingActions.update(action.id, {
              retries: action.retries,
            });
          }
        }
      }

      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date().toISOString() });
      dispatch({ type: 'CLEAR_SYNC_ERRORS' });
    } catch (error) {
      dispatch({
        type: 'ADD_SYNC_ERROR',
        payload: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      dispatch({ type: 'SET_SYNC_PROGRESS', payload: false });
      
      // Update queue size
      const remainingActions = await state.offlineStorage.pendingActions.count();
      dispatch({ type: 'UPDATE_QUEUE_SIZE', payload: remainingActions });
    }
  };

  const cacheData = async (type, endpoint, data) => {
    try {
      await state.offlineStorage.cachedData.add({
        type,
        endpoint,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const getCachedData = async (type, endpoint) => {
    try {
      const cached = await state.offlineStorage.cachedData
        .where({ type, endpoint })
        .first();
      return cached ? cached.data : null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  const clearCache = async (type = null) => {
    try {
      if (type) {
        await state.offlineStorage.cachedData.where({ type }).delete();
      } else {
        await state.offlineStorage.cachedData.clear();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const forceSync = async () => {
    await syncPendingActions();
  };

  const getSyncStatus = () => ({
    isOnline: state.isOnline,
    isOfflineMode: state.isOfflineMode,
    queueSize: state.queueSize,
    syncInProgress: state.syncInProgress,
    lastSyncTime: state.lastSyncTime,
    hasErrors: state.syncErrors.length > 0,
  });

  const value = {
    ...state,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    clearCache,
    forceSync,
    getSyncStatus,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;
