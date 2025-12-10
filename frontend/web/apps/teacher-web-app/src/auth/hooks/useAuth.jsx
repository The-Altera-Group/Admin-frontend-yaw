import { useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const {
    isAuthenticated,
    user,
    loading,
    error,
    refreshing,
    lastAuthTime,
    loginAttempts,
    rateLimited,
    retryAfter,
    login,
    logout: contextLogout,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
    refreshTokens,
    clearRateLimit
  } = context;

  // Enhanced logout with navigation
  const logout = useCallback(async (options = {}) => {
    const { redirectToLogin = true } = options;
    const result = await contextLogout({ redirectToLogin });
    
    if (result?.shouldRedirect && redirectToLogin) {
      navigate(result.redirectPath || '/auth/login');
    }
    
    return result;
  }, [contextLogout, navigate]);

  // Enhanced login with automatic redirect
  const loginWithRedirect = useCallback(async (credentials, redirectPath = '/dashboard') => {
    const result = await login(credentials);
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
    return result;
  }, [login, navigate]);

  // Memoized derived state and utilities
  const derivedState = useMemo(() => {
    const isLoading = loading || refreshing;
    const userRole = user?.role || null;
    const userName = user?.name || user?.firstName || '';
    const userEmail = user?.email || '';
    const userAvatar = user?.avatar || user?.profilePicture || '';
    const userId = user?.id || user?._id || null;

    const hasPermission = (permission) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    };

    const hasRole = (role) => {
      if (!user?.role) return false;
      return user.role === role;
    };

    const hasAnyRole = (roles) => {
      if (!user?.role || !Array.isArray(roles)) return false;
      return roles.includes(user.role);
    };

    const isSessionValid = () => {
      if (!isAuthenticated || !lastAuthTime) return false;
      const sessionDuration = 24 * 60 * 60 * 1000;
      return (Date.now() - lastAuthTime) < sessionDuration;
    };

    const getTimeUntilExpiry = () => {
      if (!lastAuthTime) return 0;
      const sessionDuration = 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - lastAuthTime;
      return Math.max(0, sessionDuration - elapsed);
    };

    const getFormattedTimeUntilExpiry = () => {
      const timeUntilExpiry = getTimeUntilExpiry();
      if (timeUntilExpiry === 0) return 'Expired';
      
      const hours = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    const getRetryTimeLeft = () => {
      if (!rateLimited || !retryAfter) return 0;
      return Math.max(0, retryAfter - Date.now());
    };

    const getFormattedRetryTimeLeft = () => {
      const timeLeft = getRetryTimeLeft();
      if (timeLeft === 0) return 'Ready';
      
      const minutes = Math.ceil(timeLeft / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const canAttemptLogin = () => {
      if (rateLimited && retryAfter > Date.now()) {
        return false;
      }
      return loginAttempts < 5;
    };

    const getRemainingAttempts = () => {
      return Math.max(0, 5 - loginAttempts);
    };

    const isFullyAuthenticated = () => {
      return isAuthenticated && isSessionValid();
    };

    // Redirect to login if session is invalid
    const requireAuth = (redirectPath = '/auth/login') => {
      if (!isFullyAuthenticated()) {
        navigate(redirectPath, { 
          state: { 
            from: window.location.pathname,
            error: 'Your session has expired. Please log in again.'
          } 
        });
        return false;
      }
      return true;
    };

    return {
      isLoading,
      userRole,
      userName,
      userEmail,
      userAvatar,
      userId,
      hasPermission,
      hasRole,
      hasAnyRole,
      isSessionValid,
      getTimeUntilExpiry,
      getFormattedTimeUntilExpiry,
      getRetryTimeLeft,
      getFormattedRetryTimeLeft,
      canAttemptLogin,
      getRemainingAttempts,
      isFullyAuthenticated,
      requireAuth
    };
  }, [isAuthenticated, user, loading, refreshing, lastAuthTime, loginAttempts, rateLimited, retryAfter, navigate]);

  return {
    // Core auth state
    isAuthenticated,
    user,
    loading,
    error,
    refreshing,
    lastAuthTime,
    loginAttempts,
    rateLimited,
    retryAfter,
    
    // Derived state and utilities
    ...derivedState,
    
    // Core auth actions
    login,
    loginWithRedirect,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
    refreshTokens,
    clearRateLimit
  };
};

export default useAuth;