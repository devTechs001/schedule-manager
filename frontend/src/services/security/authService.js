// Authentication Service

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.userKey = 'auth_user';
    this.listeners = [];
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Get current user
  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // Check if authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Check token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Login
  async login(credentials) {
    try {
      // API call would go here
      await new Promise(r => setTimeout(r, 1000));

      // Mock successful login
      const response = {
        token: `mock-jwt-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: {
          id: 'user-1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'user',
        },
      };

      this.setSession(response);
      this.notifyListeners('login', response.user);

      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Register
  async register(userData) {
    try {
      await new Promise(r => setTimeout(r, 1500));

      const response = {
        token: `mock-jwt-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        user: {
          id: `user-${Date.now()}`,
          email: userData.email,
          name: userData.name,
          role: 'user',
        },
      };

      this.setSession(response);
      this.notifyListeners('register', response.user);

      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.notifyListeners('logout', null);
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    try {
      await new Promise(r => setTimeout(r, 500));

      const newToken = `mock-jwt-${Date.now()}`;
      localStorage.setItem(this.tokenKey, newToken);

      return newToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Set session
  setSession(authData) {
    localStorage.setItem(this.tokenKey, authData.token);
    localStorage.setItem(this.refreshTokenKey, authData.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(authData.user));
  }

  // Update user
  async updateUser(updates) {
    const user = this.getUser();
    if (!user) throw new Error('Not authenticated');

    await new Promise(r => setTimeout(r, 500));

    const updatedUser = { ...user, ...updates };
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
    this.notifyListeners('update', updatedUser);

    return updatedUser;
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    await new Promise(r => setTimeout(r, 1000));
    // API call would validate and change password
    return { success: true };
  }

  // Request password reset
  async requestPasswordReset(email) {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true, message: 'Reset email sent' };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true };
  }

  // Add auth state listener
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify listeners
  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  // Get auth header
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
export default authService;

