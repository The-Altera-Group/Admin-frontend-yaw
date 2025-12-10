import React, { useReducer, useCallback, useEffect, useRef } from 'react';
import AuthContext, { authReducer, initialState, AUTH_ACTIONS } from './AuthContext';
import { authService } from '../../services/authService';

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're rate limited
        const rateLimitInfo = authService.getRateLimitInfo();
        if (rateLimitInfo.rateLimited && rateLimitInfo.retryAfter > Date.now()) {
          dispatch({
            type: AUTH_ACTIONS.SET_RATE_LIMIT,
            payload: {
              rateLimited: true,
              retryAfter: rateLimitInfo.retryAfter
            }
          });
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }

        if (authService.isAuthenticated()) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          
          const user = await authService.getCurrentUser();
          dispatch({ 
            type: AUTH_ACTIONS.AUTH_SUCCESS, 
            payload: { user } 
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        
        // Clear potentially corrupted tokens
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh tokens before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkTokenExpiry = () => {
      const tokens = authService.getStoredTokens();
      if (!tokens.accessToken) return;

      try {
        const payload = authService.decodeToken(tokens.accessToken);
        if (!payload) return;

        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // Refresh token 5 minutes before expiry
        if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshTokens();
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    // Clear any existing interval
    if (refreshTimeoutRef.current) {
      clearInterval(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setInterval(checkTokenExpiry, 60000);
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [state.isAuthenticated]);

  const refreshTokens = useCallback(async () => {
    if (state.refreshing) return;

    try {
      dispatch({ type: AUTH_ACTIONS.REFRESH_START });
      await authService.refreshTokens();
      dispatch({ type: AUTH_ACTIONS.REFRESH_SUCCESS });
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: AUTH_ACTIONS.REFRESH_FAILURE });
    }
  }, [state.refreshing]);

  const login = useCallback(async (credentials) => {
    // Check rate limiting
    if (state.rateLimited && state.retryAfter > Date.now()) {
      const timeLeft = Math.ceil((state.retryAfter - Date.now()) / 1000);
      throw new Error(`Too many attempts. Please try again in ${timeLeft} seconds.`);
    }

    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    
    try {
      const response = await authService.login(credentials);
      
      // Reset rate limiting on successful login
      authService.clearRateLimit();
      dispatch({
        type: AUTH_ACTIONS.SET_RATE_LIMIT,
        payload: { rateLimited: false, retryAfter: null }
      });

      dispatch({ 
        type: AUTH_ACTIONS.AUTH_SUCCESS, 
        payload: { user: response.user } 
      });
      
      return response;
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
        
        // Implement rate limiting
        const newAttempts = state.loginAttempts + 1;
        if (newAttempts >= 5) {
          const retryAfter = Date.now() + (15 * 60 * 1000); // 15 minutes
          authService.setRateLimit(retryAfter);
          dispatch({
            type: AUTH_ACTIONS.SET_RATE_LIMIT,
            payload: { rateLimited: true, retryAfter }
          });
          errorMessage = 'Too many failed attempts. Please try again in 15 minutes.';
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Your account has been suspended. Please contact support.';
      } else if (error.response?.status === 429) {
        const retryAfter = Date.now() + (5 * 60 * 1000); // 5 minutes
        authService.setRateLimit(retryAfter);
        dispatch({
          type: AUTH_ACTIONS.SET_RATE_LIMIT,
          payload: { rateLimited: true, retryAfter }
        });
        errorMessage = 'Too many login attempts. Please try again in 5 minutes.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, [state.loginAttempts, state.rateLimited, state.retryAfter]);

  const logout = useCallback(async (options = {}) => {
    const { redirectToLogin = true } = options;
    
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
      
      // Return navigation info instead of navigating directly
      return {
        shouldRedirect: redirectToLogin,
        redirectPath: '/auth/login'
      };
    }
  }, []); // Remove navigate dependency

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      let errorMessage = 'Failed to send reset instructions.';
      
      if (error.response?.status === 404) {
        errorMessage = 'No account found with that email address.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many reset requests. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    
    try {
      const response = await authService.resetPassword(token, newPassword);
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      return response;
    } catch (error) {
      let errorMessage = 'Failed to reset password.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid reset token. Please request a new password reset link.';
      } else if (error.response?.status === 410) {
        errorMessage = 'This reset link has expired. Please request a new password reset link.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Invalid reset token. Please check your reset link and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const clearRateLimit = useCallback(() => {
    authService.clearRateLimit();
    dispatch({
      type: AUTH_ACTIONS.SET_RATE_LIMIT,
      payload: { rateLimited: false, retryAfter: null }
    });
  }, []);

  // Memoize the context value
  const value = React.useMemo(() => ({
    ...state,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    clearError,
    refreshTokens,
    clearRateLimit
  }), [state, login, logout, forgotPassword, resetPassword, updateUser, clearError, refreshTokens, clearRateLimit]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
