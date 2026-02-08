import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FaLock, FaSpinner } from 'react-icons/fa';

/**
 * AuthGuard - Route protection component
 * Wraps protected routes and redirects unauthenticated users
 */
const AuthGuard = ({
  children,
  isAuthenticated = false,
  isLoading = false,
  requiredRoles = [],
  userRoles = [],
  redirectTo = '/login',
  fallback = null,
}) => {
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <FaSpinner className="mx-auto text-4xl text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to access this page.
              Required roles: {requiredRoles.join(', ')}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

/**
 * withAuthGuard - HOC for wrapping components with auth protection
 */
export const withAuthGuard = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

/**
 * useAuthGuard - Hook for checking auth status in components
 */
export const useAuthGuard = (requiredRoles = []) => {
  // This would typically use a context or store
  const isAuthenticated = true; // Replace with actual auth check
  const userRoles = ['user']; // Replace with actual user roles
  
  const hasAccess = requiredRoles.length === 0 || 
    requiredRoles.some(role => userRoles.includes(role));

  return {
    isAuthenticated,
    hasAccess,
    userRoles,
  };
};

export default AuthGuard;

