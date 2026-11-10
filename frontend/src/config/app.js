// Configuration file to manage environment variables and app settings
const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  /*
   * No `features` block. It read VITE_ENABLE_AI_FEATURES,
   * VITE_ENABLE_NOTIFICATIONS and VITE_ENABLE_COLLABORATION, and nothing ever
   * consulted the result — so setting those flags changed no behaviour while
   * appearing to switch whole product areas on and off.
   *
   * What actually gates each area:
   *   AI            the server answers 503 AI_UNAVAILABLE when no provider key
   *                 is configured; the UI renders that state.
   *   notifications browser permission, requested from Settings.
   *   collaboration the workspace API; no data means an empty state.
   */
  
  // Third-party Integrations
  integrations: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  },
  
  // Analytics
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  
  // Limits
  limits: {
    maxTasksPerDay: parseInt(import.meta.env.VITE_MAX_TASKS_PER_DAY) || 50,
    maxTeamMembers: parseInt(import.meta.env.VITE_MAX_TEAM_MEMBERS) || 10,
    imageUploadLimit: parseInt(import.meta.env.VITE_IMAGE_UPLOAD_LIMIT) || 5242880, // 5MB
  },
  
  // Development Settings
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  mockData: import.meta.env.VITE_MOCK_DATA === 'true',
  
  // Asset Settings
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL || '',
  
  // Real-time Settings
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  socketTimeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT) || 30000,
};

export default config;