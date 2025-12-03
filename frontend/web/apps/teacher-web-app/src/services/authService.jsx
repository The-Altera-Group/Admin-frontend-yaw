import { apiClient } from './apiClient';
import { TEACHER_APP_CONFIG } from '../../config';
import { jwtDecode } from 'jwt-decode';

// Secure storage keys with app prefix
const ACCESS_TOKEN_KEY = 'gfa_access_token';
const REFRESH_TOKEN_KEY = 'gfa_refresh_token';
const USER_DATA_KEY = 'gfa_user_data';
const RATE_LIMIT_KEY = 'gfa_rate_limit';
const SESSION_ID_KEY = 'gfa_session_id';

class AuthService {
  constructor() {
    this.initializeService();
    this.sessionId = this.generateSessionId();
  }

  initializeService() {
    this.setupInterceptors();
    this.initializeSecurityHeaders();
  }

  generateSessionId() {
    let sessionId = this.getSecureStorage(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.setSecureStorage(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  initializeSecurityHeaders() {
    // Add security headers to all requests
    apiClient.defaults.headers.common['X-Session-ID'] = this.sessionId;
    apiClient.defaults.headers.common['X-Request-ID'] = this.generateRequestId();
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupInterceptors() {
    // Request interceptor to attach token
    apiClient.interceptors.request.use(
      (config) => {
        const token = this.getStoredTokens().accessToken;
        if (token && this.isTokenValid(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add security headers
        config.headers['X-Session-ID'] = this.sessionId;
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0';
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshTokens();
            const newToken = this.getStoredTokens().accessToken;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    try {
      const response = await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.LOGIN}`, {
        ...credentials,
        deviceInfo: this.getDeviceInfo(),
        sessionId: this.sessionId
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data securely
      this.storeTokens({ accessToken, refreshToken });
      this.storeUserData(user);
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.FORGOT_PASSWORD}`, { 
        email,
        userType: 'teacher',
        deviceInfo: this.getDeviceInfo(),
        sessionId: this.sessionId
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.RESET_PASSWORD}`, {
        token,
        newPassword,
        userType: 'teacher',
        deviceInfo: this.getDeviceInfo(),
        sessionId: this.sessionId
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async getCurrentUser() {
    try {
      // First try to get cached user data if tokens are valid
      const cachedUser = this.getCachedUserData();
      const tokens = this.getStoredTokens();
      
      if (cachedUser && tokens.accessToken && this.isTokenValid(tokens.accessToken)) {
        // Refresh user data in background
        this.refreshUserData().catch(console.warn);
        return cachedUser;
      }

      // Fetch fresh user data
      const response = await apiClient.get('/auth/me');
      const user = response.data;
      
      this.storeUserData(user);
      return user;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async refreshUserData() {
    try {
      const response = await apiClient.get('/auth/me');
      this.storeUserData(response.data);
      return response.data;
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
      throw error;
    }
  }

  async refreshTokens() {
    const refreshToken = this.getSecureStorage(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.REFRESH_TOKEN}`, {
        refreshToken,
        deviceInfo: this.getDeviceInfo(),
        sessionId: this.sessionId
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      this.storeTokens({
        accessToken,
        refreshToken: newRefreshToken || refreshToken
      });
      
      return response.data;
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      throw this.handleApiError(error);
    }
  }

  async logout() {
    const refreshToken = this.getSecureStorage(REFRESH_TOKEN_KEY);
    
    if (refreshToken) {
      try {
        await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.LOGOUT}`, { 
          refreshToken,
          deviceInfo: this.getDeviceInfo(),
          sessionId: this.sessionId
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
        // Continue with local cleanup even if server request fails
      }
    }
    
    this.clearAllData();
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post(`${TEACHER_APP_CONFIG.AUTH.CHANGE_PASSWORD}`, {
        currentPassword,
        newPassword,
        sessionId: this.sessionId
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(`${TEACHER_APP_CONFIG.AUTH.UPDATE_PROFILE}`, profileData);
      const updatedUser = response.data;
      
      this.storeUserData(updatedUser);
      return updatedUser;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  // Secure storage management
  setSecureStorage(key, value) {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
  }

  getSecureStorage(key) {
    try {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
    return null;
  }

  removeSecureStorage(key) {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
  }

  isLocalStorageAvailable() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Token and storage management
  isAuthenticated() {
    const token = this.getSecureStorage(ACCESS_TOKEN_KEY);
    return token && this.isTokenValid(token);
  }

  decodeToken(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  isTokenValid(token) {
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload) return false;

      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getStoredTokens() {
    return {
      accessToken: this.getSecureStorage(ACCESS_TOKEN_KEY),
      refreshToken: this.getSecureStorage(REFRESH_TOKEN_KEY)
    };
  }

  storeTokens({ accessToken, refreshToken }) {
    if (accessToken) {
      this.setSecureStorage(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      this.setSecureStorage(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  clearTokens() {
    this.removeSecureStorage(ACCESS_TOKEN_KEY);
    this.removeSecureStorage(REFRESH_TOKEN_KEY);
  }

  storeUserData(user) {
    this.setSecureStorage(USER_DATA_KEY, JSON.stringify(user));
  }

  getCachedUserData() {
    try {
      const userData = this.getSecureStorage(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  clearUserData() {
    this.removeSecureStorage(USER_DATA_KEY);
  }

  clearAllData() {
    this.clearTokens();
    this.clearUserData();
    this.clearRateLimit();
    // Keep session ID for analytics
  }

  // Rate limiting
  setRateLimit(retryAfter) {
    this.setSecureStorage(RATE_LIMIT_KEY, JSON.stringify({
      rateLimited: true,
      retryAfter
    }));
  }

  getRateLimitInfo() {
    try {
      const rateLimitInfo = this.getSecureStorage(RATE_LIMIT_KEY);
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
  }

  clearRateLimit() {
    this.removeSecureStorage(RATE_LIMIT_KEY);
  }

  // Utility methods
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString()
    };
  }

  handleAuthError() {
    this.clearAllData();
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }

  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          this.handleAuthError();
          return new Error('Authentication failed. Please log in again.');
        case 403:
          return new Error('Access denied. You do not have permission to perform this action.');
        case 404:
          return new Error('The requested resource was not found.');
        case 429:
          return new Error('Too many requests. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Enhanced validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Check for educational domains
    const educationalDomains = [
      '.edu',
      '.ac.',
      '.school.',
      '.college.',
      '.university.',
      '.k12.'
    ];
    
    return educationalDomains.some(domain => 
      email.toLowerCase().includes(domain)
    );
  }

  validatePassword(password) {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      noSpaces: !/\s/.test(password),
      notCommon: !this.isCommonPassword(password)
    };
    
    return validation;
  }

  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '12345678', '123456789', '12345',
      'qwerty', 'abc123', 'password1', '1234567', '1234567890'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  getPasswordStrength(password) {
    const validation = this.validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    
    if (score < 4) return 'weak';
    if (score < 6) return 'medium';
    return 'strong';
  }

  // Security utilities
  generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

export const authService = new AuthService();
export default authService;