import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/app';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/me`);

      if (response.data.success) {
        setUser(response.data.data.user); // Note: backend wraps data in 'data' property
      } else {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Only logout if it's an authentication error
      if (error.response && error.response.status === 401) {
        logout();
      }
      throw error; // Re-throw to be handled by calling code if needed
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data; // Note: backend wraps data in 'data' property
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setToken(token);
        setUser(user);
        return user;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message ||
                            error.response.data?.error ||
                            `Login failed with status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred during login.');
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/register`, userData);

      if (response.data.success) {
        const { token, user } = response.data.data; // Note: backend wraps data in 'data' property
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setToken(token);
        setUser(user);
        return user;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message ||
                            error.response.data?.error ||
                            `Registration failed with status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred during registration.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${config.apiUrl}/auth/profile`, updates);

      if (response.data.success) {
        setUser(response.data.data.user); // Note: backend wraps data in 'data' property
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message ||
                            error.response.data?.error ||
                            `Profile update failed with status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred during profile update.');
      }
    }
  };

  // Helper function to check if user exists (for registration form feedback)
  const checkUserExists = async (email) => {
    try {
      // We'll make a request to a hypothetical endpoint that checks user existence
      // Since there isn't one, we'll handle this differently
      // For now, we'll just return a generic function that can be expanded later
      return false; // Placeholder - would check actual API endpoint
    } catch (error) {
      console.warn('Could not check user existence:', error);
      return false; // Assume user doesn't exist if we can't check
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        checkUserExists,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};