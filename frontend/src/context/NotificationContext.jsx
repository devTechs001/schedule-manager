import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({
    push: true,
    email: true,
    sound: true,
    desktop: true,
    taskReminders: true,
    eventReminders: true,
    collaborationUpdates: true,
    systemAlerts: true,
  });

  // Update unread count when notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Request notification permission
  useEffect(() => {
    if (preferences.desktop && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences.desktop]);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Show desktop notification
    if (preferences.desktop && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192.png',
      });
    }

    // Play sound
    if (preferences.sound) {
      // Could play a notification sound here
    }

    return newNotification;
  }, [preferences]);

  // Mark as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Snooze notification
  const snoozeNotification = useCallback((id, duration) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, snoozedUntil: new Date(Date.now() + duration) }
          : n
      )
    );
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    localStorage.setItem('notificationPreferences', JSON.stringify({ ...preferences, ...newPrefs }));
  }, [preferences]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Schedule notification
  const scheduleNotification = useCallback((notification, scheduledTime) => {
    const delay = new Date(scheduledTime).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        addNotification(notification);
      }, delay);
    }
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    snoozeNotification,
    updatePreferences,
    getNotificationsByType,
    scheduleNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

