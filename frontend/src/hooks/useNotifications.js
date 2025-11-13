import { useEffect } from 'react';
import { requestNotificationPermission, showNotification } from '@services/notifications/notificationManager';

export const useNotifications = () => {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const notify = (title, options = {}) => {
    showNotification(title, options);
  };

  return { notify };
};