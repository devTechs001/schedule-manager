export const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
  };
  
  export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };
  
  export const EVENT_TYPES = {
    MEETING: 'meeting',
    TASK: 'task',
    DEADLINE: 'deadline',
    REMINDER: 'reminder',
  };
  
  export const EMAIL_FILTERS = {
    INBOX: 'inbox',
    STARRED: 'starred',
    SENT: 'sent',
    TRASH: 'trash',
  };
  
  export const FEEDBACK_CATEGORIES = {
    GENERAL: 'general',
    BUG: 'bug',
    FEATURE: 'feature',
    UI: 'ui',
    PERFORMANCE: 'performance',
  };
  
  export const API_ENDPOINTS = {
    AUTH: '/auth',
    TASKS: '/tasks',
    EMAILS: '/emails',
    CONTACTS: '/contacts',
    SCHEDULE: '/schedule',
    AI: '/ai',
    FEEDBACK: '/feedback',
  };
  
  export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };
  
  export const STORAGE_KEYS = {
    TOKEN: 'token',
    THEME: 'theme',
    USER: 'user',
    SETTINGS: 'settings',
  };
  
  export const DATE_FORMATS = {
    FULL: 'MMMM d, yyyy h:mm a',
    SHORT: 'MMM d, yyyy',
    TIME: 'h:mm a',
    ISO: "yyyy-MM-dd'T'HH:mm:ss",
  };
  
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  };