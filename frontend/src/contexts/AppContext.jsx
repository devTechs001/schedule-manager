import React, { createContext, useContext, useRef, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  /*
   * Notification ids come from a counter, not from Date.now(). Two notifications
   * raised in the same millisecond used to share an id, and since dismissal
   * filters by id, dismissing the first would silently remove both. A counter is
   * also pure — the previous version called Date.now() inside a handler that
   * react-hooks/purity treats as render-reachable.
   */
  const nextNotificationId = useRef(0);

  const addNotification = (notification) => {
    nextNotificationId.current += 1;
    const id = nextNotificationId.current;
    setNotifications(prev => [...prev, { ...notification, id }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};