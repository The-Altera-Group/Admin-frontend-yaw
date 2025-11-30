import { createContext } from 'react';

// Auth action types
export const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  REFRESH_START: 'REFRESH_START',
  REFRESH_SUCCESS: 'REFRESH_SUCCESS',
  REFRESH_FAILURE: 'REFRESH_FAILURE',
  SET_RATE_LIMIT: 'SET_RATE_LIMIT'
};

// Initial state
export const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  refreshing: false,
  lastAuthTime: null,
  loginAttempts: 0,
  rateLimited: false,
  retryAfter: null
};

// Auth reducer
export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return { 
        ...state, 
        loading: true, 
        error: null 
      };
    
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: action.payload.user,
        error: null,
        lastAuthTime: Date.now(),
        loginAttempts: 0
      };
    
    case AUTH_ACTIONS.AUTH_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false,
        user: null,
        loginAttempts: (state.loginAttempts || 0) + 1
      };
    
    case AUTH_ACTIONS.AUTH_LOGOUT:
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false,
        error: null,
        lastAuthTime: null,
        loginAttempts: 0
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { 
        ...state, 
        error: null 
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return { 
        ...state, 
        loading: action.payload 
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.REFRESH_START:
      return {
        ...state,
        refreshing: true
      };
    
    case AUTH_ACTIONS.REFRESH_SUCCESS:
      return {
        ...state,
        refreshing: false,
        lastAuthTime: Date.now()
      };
    
    case AUTH_ACTIONS.REFRESH_FAILURE:
      return {
        ...state,
        refreshing: false,
        isAuthenticated: false,
        user: null,
        error: 'Session expired. Please log in again.'
      };
    
    case AUTH_ACTIONS.SET_RATE_LIMIT:
      return {
        ...state,
        rateLimited: action.payload.rateLimited,
        retryAfter: action.payload.retryAfter
      };
    
    default:
      return state;
  }
};

// Context
const AuthContext = createContext({
  ...initialState,
  login: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  updateUser: () => {},
  clearError: () => {},
  refreshTokens: async () => {},
  clearRateLimit: () => {}
});

export default AuthContext;