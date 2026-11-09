import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import client from '../services/api/client';
import { appUrl } from '@utils/basePath';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const TOKEN_KEY = 'token';

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('demoUser');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(readToken);
  const [isDemo, setIsDemo] = useState(() => {
    try {
      return localStorage.getItem('demoSession') === 'true';
    } catch {
      return false;
    }
  });
  const bootstrapped = useRef(false);

  const logout = useCallback((options = {}) => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('demoSession');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoSeeded');
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
    if (options.redirect) {
      window.location.assign(appUrl('/login'));
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const data = await client.get('/auth/me');
      const nextUser = data?.user || data;
      if (nextUser) {
        setUser(nextUser);
      }
    } catch (error) {
      // A stale or revoked token means we simply drop the session — unless this
      // is a local demo sandbox, which must stay usable without a backend.
      if (error.status === 401 || error.status === 403) {
        let inDemo = false;
        try {
          inDemo = localStorage.getItem('demoSession') === 'true';
        } catch {
          inDemo = false;
        }
        if (!inDemo) logout();
        else setIsDemo(true);
      }
      // Network errors keep the (possibly valid) token so offline mode works.
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      let demoUser = null;
      try {
        const raw = localStorage.getItem('demoUser');
        demoUser = raw ? JSON.parse(raw) : null;
      } catch {
        demoUser = null;
      }

      if (!demoUser && (typeof window !== 'undefined' && localStorage.getItem('demoSession') === 'true')) {
        demoUser = {
          name: 'Demo User',
          email: 'demo@schedai.local',
          role: 'user',
          _localSandbox: true,
        };
      }

      if (demoUser) {
        setUser(demoUser);
        setIsDemo(true);
      }
      setLoading(false);
      return;
    }
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    fetchUser();
  }, [token, fetchUser]);

  // React to 401s raised by the API client
  useEffect(() => {
    const onExpired = () => logout();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [logout]);

  const persistSession = (data) => {
    const nextToken = data?.token;
    const nextUser = data?.user;
    if (!nextToken || !nextUser) {
      throw new Error('Unexpected response from the server');
    }
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.removeItem('demoSession');
    localStorage.removeItem('demoUser');
    setToken(nextToken);
    setUser(nextUser);
    setIsDemo(false);
    return nextUser;
  };

  const login = async (email, password) => {
    try {
      const data = await client.post('/auth/login', { email, password });
      return persistSession(data);
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const data = await client.post('/auth/register', userData);
      return persistSession(data);
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await client.put('/auth/profile', updates);
      const nextUser = data?.user || data;
      if (nextUser) setUser((prev) => ({ ...prev, ...nextUser }));
      return nextUser;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await client.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      throw new Error(error.message || 'Could not change password');
    }
  };

  const checkUserExists = async () => false;

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkUserExists,
    isDemo,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
