import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { socketService } from '@services/socket/socketService';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: true,
    push: true,
    desktop: true,
    sound: true,
    taskReminders: true,
    meetingReminders: true,
    deadlineAlerts: true,
    collaborationUpdates: true,
  },
  isLoading: false,
  error: null,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'ADD_NOTIFICATION':
      const newNotification = {
        ...action.payload,
        id: action.payload.id || Date.now(),
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    
    case 'DELETE_NOTIFICATION':
      const notificationToDelete = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToDelete && !notificationToDelete.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    // Listen to socket events for real-time notifications
    const unsubscribeNewNotification = socketService.on('notification:new', (notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      
      // Show desktop notification if enabled
      if (state.settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title || 'New Notification', {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          tag: notification.id,
        });
      }
      
      // Play sound if enabled
      if (state.settings.sound) {
        playNotificationSound();
      }
    });

    const unsubscribeNotificationRead = socketService.on('notification:read', (notificationId) => {
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    });

    return () => {
      unsubscribeNewNotification?.();
      unsubscribeNotificationRead?.();
    };
  }, [state.settings]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors from autoplay policies
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const addNotification = async (notification) => {
    try {
      // API call to create notification
      // const newNotification = await notificationAPI.create(notification);
      socketService.emit('notification:create', notification);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
      socketService.emit('notification:read', { notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const markAllAsRead = async () => {
    try {
      dispatch({ type: 'MARK_ALL_AS_READ' });
      // API call to mark all as read
      // await notificationAPI.markAllAsRead();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      // API call to delete notification
      // await notificationAPI.delete(notificationId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const clearAllNotifications = async () => {
    try {
      dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
      // API call to clear all notifications
      // await notificationAPI.clearAll();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      // API call to update settings
      // await notificationAPI.updateSettings(newSettings);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const fetchNotifications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call to fetch notifications
      // const response = await notificationAPI.getNotifications();
      // dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    fetchNotifications,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
