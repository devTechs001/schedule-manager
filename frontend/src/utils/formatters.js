import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  }
  if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${formatTime(dateObj)}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};