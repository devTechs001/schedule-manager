import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FaLock, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';

/**
 * Route protection for a subtree.
 *
 * Props default to the live auth context, so `<AuthGuard>` works on its own
 * and `<AuthGuard requiredRoles={['admin']}>` adds a role check. Pass
 * `isAuthenticated` / `isLoading` explicitly only when guarding against
 * something other than the signed-in user.
 */
const AuthGuard = ({
  children,
  isAuthenticated,
  isLoading,
  requiredRoles = [],
  userRoles,
  redirectTo = '/login',
  fallback = null,
}) => {
  const location = useLocation();
  const auth = useAuth();

  const authenticated = isAuthenticated ?? Boolean(auth?.user);
  const loading = isLoading ?? Boolean(auth?.loading);
  const roles = userRoles ?? (auth?.user?.role ? [auth.user.role] : []);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-surface-sunken">
          <div className="text-center">
            <FaSpinner className="mx-auto text-4xl text-primary-600 animate-spin mb-4" />
            <p className="text-content-muted">Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication
  if (!authenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-sunken">
          <div className="text-center p-8 bg-surface rounded-lg shadow-lg max-w-md">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-content mb-2">Access Denied</h2>
            <p className="text-content-muted mb-6">
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
 * Read the current auth status and evaluate a role requirement.
 *
 * This used to return `isAuthenticated: true` unconditionally with a
 * placeholder `['user']` role list. Any caller that trusted it would have
 * treated a signed-out visitor as authorised, so it now reads the real
 * context and fails closed.
 */
export const useAuthGuard = (requiredRoles = []) => {
  const { user, loading } = useAuth();
  const userRoles = user?.role ? [user.role] : [];

  const isAuthenticated = Boolean(user);
  const hasAccess =
    isAuthenticated &&
    (requiredRoles.length === 0 || requiredRoles.some((role) => userRoles.includes(role)));

  return { isAuthenticated, hasAccess, userRoles, loading };
};

export default AuthGuard;

