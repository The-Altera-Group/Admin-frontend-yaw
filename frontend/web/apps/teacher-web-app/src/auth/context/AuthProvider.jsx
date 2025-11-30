// src/auth/context/AuthProvider.jsx - DEMO VERSION
import React, { useReducer, useCallback, useEffect, useRef } from 'react';
import AuthContext, { authReducer, initialState, AUTH_ACTIONS } from './AuthContext';

// Demo credentials and mock data
const DEMO_CREDENTIALS = {
  'teacher@demo.com': 'demopassword123',
  'demo@school.edu': 'demopassword123', 
  'admin@demo.com': 'demopassword123'
};

const MOCK_USERS = {
  'teacher@demo.com': {
    id: 'user_1',
    email: 'teacher@demo.com',
    name: 'Demo Teacher',
    firstName: 'Demo',
    lastName: 'Teacher',
    role: 'teacher',
    avatar: '',
    permissions: ['view_classes', 'manage_students', 'create_lessons'],
    school: 'Demo Academy',
    gradeLevel: '9-12',
    subjects: ['Math', 'Science']
  },
  'demo@school.edu': {
    id: 'user_2', 
    email: 'demo@school.edu',
    name: 'John Smith',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    avatar: '',
    permissions: ['view_classes', 'manage_students'],
    school: 'Smith High School',
    gradeLevel: '6-8',
    subjects: ['English', 'History']
  },
  'admin@demo.com': {
    id: 'user_3',
    email: 'admin@demo.com',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User', 
    role: 'admin',
    avatar: '',
    permissions: ['view_classes', 'manage_students', 'manage_teachers', 'system_settings'],
    school: 'Demo District',
    gradeLevel: 'K-12',
    subjects: ['All']
  }
};

// Generate mock JWT token
const generateMockToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    iss: 'demo-auth-service'
  };
  
  return btoa(JSON.stringify(payload));
};

// Mock storage functions
const setSecureStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('LocalStorage not available:', error);
  }
};

const getSecureStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('LocalStorage not available:', error);
    return null;
  }
};

const removeSecureStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('LocalStorage not available:', error);
  }
};

// Mock auth service functions
const mockAuthService = {
  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    const { email, password } = credentials;
    
    if (DEMO_CREDENTIALS[email] && DEMO_CREDENTIALS[email] === password) {
      const user = MOCK_USERS[email];
      const accessToken = generateMockToken(user);
      const refreshToken = generateMockToken({ ...user, isRefresh: true });
      
      // Store in localStorage
      setSecureStorage('gfa_access_token', accessToken);
      setSecureStorage('gfa_refresh_token', refreshToken);
      setSecureStorage('gfa_user_data', JSON.stringify(user));
      
      return {
        user,
        accessToken,
        refreshToken,
        message: 'Demo login successful'
      };
    } else {
      throw new Error('Invalid demo credentials. Try: teacher@demo.com / demopassword123');
    }
  },

  async forgotPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (DEMO_CREDENTIALS[email]) {
      return {
        message: 'Demo: Password reset instructions sent to your email',
        success: true,
        resetToken: 'demo_reset_token_' + Date.now()
      };
    } else {
      throw new Error('Demo: No account found with that email address');
    }
  },

  async resetPassword(token, newPassword) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple demo validation
    if (newPassword.length >= 8) {
      return {
        message: 'Demo: Password reset successful! You can now login with your new password.',
        success: true
      };
    } else {
      throw new Error('Demo: Password must be at least 8 characters long');
    }
  },

  async logout() {
    // Clear storage
    removeSecureStorage('gfa_access_token');
    removeSecureStorage('gfa_refresh_token');
    removeSecureStorage('gfa_user_data');
    removeSecureStorage('gfa_rate_limit');
    
    return { success: true, message: 'Demo logout successful' };
  },

  isAuthenticated() {
    const token = getSecureStorage('gfa_access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  async getCurrentUser() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const userData = getSecureStorage('gfa_user_data');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch {
      // Fall through to return null
    }
    
    return null;
  },

  async refreshTokens() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = getSecureStorage('gfa_user_data');
    if (userData) {
      const user = JSON.parse(userData);
      const newToken = generateMockToken(user);
      setSecureStorage('gfa_access_token', newToken);
      return { accessToken: newToken };
    }
    throw new Error('No user logged in');
  },

  getStoredTokens() {
    return {
      accessToken: getSecureStorage('gfa_access_token'),
      refreshToken: getSecureStorage('gfa_refresh_token')
    };
  },

  getRateLimitInfo() {
    try {
      const rateLimitInfo = getSecureStorage('gfa_rate_limit');
      if (rateLimitInfo) {
        const data = JSON.parse(rateLimitInfo);
        if (data.retryAfter > Date.now()) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading rate limit info:', error);
    }
    
    return { rateLimited: false, retryAfter: null };
  },

  setRateLimit(retryAfter) {
    setSecureStorage('gfa_rate_limit', JSON.stringify({
      rateLimited: true,
      retryAfter
    }));
  },

  clearRateLimit() {
    removeSecureStorage('gfa_rate_limit');
  },

  clearAllData() {
    removeSecureStorage('gfa_access_token');
    removeSecureStorage('gfa_refresh_token');
    removeSecureStorage('gfa_user_data');
    removeSecureStorage('gfa_rate_limit');
  }
};

// Demo Banner Component
const DemoBanner = () => (
  <div style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '10px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    borderBottom: '1px solid #553c9a',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    🚀 DEMO MODE - Using mock authentication service
  </div>
);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing demo authentication...');
        
        // Check if we're rate limited
        const rateLimitInfo = mockAuthService.getRateLimitInfo();
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

        if (mockAuthService.isAuthenticated()) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
          
          const user = await mockAuthService.getCurrentUser();
          dispatch({ 
            type: AUTH_ACTIONS.AUTH_SUCCESS, 
            payload: { user } 
          });
          console.log('✅ Demo user authenticated:', user.email);
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          console.log('ℹ️ No demo user logged in');
        }
      } catch (error) {
        console.error('Failed to initialize demo auth:', error);
        
        // Clear potentially corrupted data
        await mockAuthService.logout();
        dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh tokens before expiry (demo version)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkTokenExpiry = () => {
      const tokens = mockAuthService.getStoredTokens();
      if (!tokens.accessToken) return;

      try {
        const payload = JSON.parse(atob(tokens.accessToken));
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
      await mockAuthService.refreshTokens();
      dispatch({ type: AUTH_ACTIONS.REFRESH_SUCCESS });
      console.log('✅ Demo tokens refreshed');
    } catch (error) {
      console.error('Demo token refresh failed:', error);
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
      const response = await mockAuthService.login(credentials);
      
      // Reset rate limiting on successful login
      mockAuthService.clearRateLimit();
      dispatch({
        type: AUTH_ACTIONS.SET_RATE_LIMIT,
        payload: { rateLimited: false, retryAfter: null }
      });

      dispatch({ 
        type: AUTH_ACTIONS.AUTH_SUCCESS, 
        payload: { user: response.user } 
      });
      
      console.log('✅ Demo login successful for:', credentials.email);
      return response;
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (error.message.includes('Invalid demo credentials')) {
        errorMessage = error.message;
        
        // Implement rate limiting
        const newAttempts = state.loginAttempts + 1;
        if (newAttempts >= 5) {
          const retryAfter = Date.now() + (15 * 60 * 1000); // 15 minutes
          mockAuthService.setRateLimit(retryAfter);
          dispatch({
            type: AUTH_ACTIONS.SET_RATE_LIMIT,
            payload: { rateLimited: true, retryAfter }
          });
          errorMessage = 'Too many failed attempts. Please try again in 15 minutes.';
        }
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
      await mockAuthService.logout();
      console.log('✅ Demo logout successful');
    } catch (error) {
      console.error('Demo logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
      
      // Return navigation info instead of navigating directly
      return {
        shouldRedirect: redirectToLogin,
        redirectPath: '/auth/login'
      };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await mockAuthService.forgotPassword(email);
      console.log('✅ Demo password reset requested for:', email);
      return response;
    } catch (error) {
      let errorMessage = 'Failed to send reset instructions.';
      
      if (error.message.includes('No account found')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });
    
    try {
      const response = await mockAuthService.resetPassword(token, newPassword);
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      console.log('✅ Demo password reset successful');
      return response;
    } catch (error) {
      let errorMessage = 'Failed to reset password.';
      
      if (error.message.includes('Password must be')) {
        errorMessage = error.message;
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
    mockAuthService.clearRateLimit();
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
      <DemoBanner />
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;