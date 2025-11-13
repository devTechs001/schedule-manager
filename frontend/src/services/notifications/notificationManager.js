export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
  
    if (Notification.permission === 'granted') {
      return true;
    }
  
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  
    return false;
  };
  
  export const showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
  
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
  
      return notification;
    }
  };
  
  export const scheduleNotification = (title, options, delay) => {
    setTimeout(() => {
      showNotification(title, options);
    }, delay);
  };