// src/services/mockAuthService.js
import { jwtDecode } from 'jwt-decode';

// Demo credentials
const DEMO_CREDENTIALS = {
  'teacher@demo.com': 'demopassword123',
  'demo@school.edu': 'demopassword123',
  'admin@demo.com': 'demopassword123'
};

// Mock user data
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
    school: 'Demo Academy'
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
    school: 'Smith High School'
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
    school: 'Demo District'
  }
};

// Generate mock JWT token
const generateMockToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  };
  
  // In a real scenario, this would be properly signed
  return btoa(JSON.stringify(payload));
};

class MockAuthService {
  constructor() {
    this.isDemoMode = true;
  }

  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { email, password } = credentials;
    
    // Check demo credentials
    if (DEMO_CREDENTIALS[email] && DEMO_CREDENTIALS[email] === password) {
      const user = MOCK_USERS[email];
      const accessToken = generateMockToken(user);
      const refreshToken = generateMockToken({ ...user, isRefresh: true });
      
      // Store in localStorage (mimicking real auth)
      localStorage.setItem('gfa_access_token', accessToken);
      localStorage.setItem('gfa_refresh_token', refreshToken);
      localStorage.setItem('gfa_user_data', JSON.stringify(user));
      
      return {
        user,
        accessToken,
        refreshToken,
        message: 'Demo login successful'
      };
    } else {
      throw new Error('Invalid demo credentials. Use: teacher@demo.com / demopassword123');
    }
  }

  async forgotPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (DEMO_CREDENTIALS[email]) {
      return {
        message: 'Demo: Password reset instructions would be sent to your email',
        success: true
      };
    } else {
      throw new Error('Demo: No account found with that email');
    }
  }

  async resetPassword(token, newPassword) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple demo validation
    if (newPassword.length >= 8) {
      return {
        message: 'Demo: Password reset successful',
        success: true
      };
    } else {
      throw new Error('Demo: Password must be at least 8 characters');
    }
  }

  async logout() {
    // Clear storage
    localStorage.removeItem('gfa_access_token');
    localStorage.removeItem('gfa_refresh_token');
    localStorage.removeItem('gfa_user_data');
    
    return { success: true };
  }

  isAuthenticated() {
    const token = localStorage.getItem('gfa_access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('gfa_user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Mock other methods to match your real authService interface
  async refreshTokens() {
    const user = this.getCurrentUser();
    if (user) {
      const newToken = generateMockToken(user);
      localStorage.setItem('gfa_access_token', newToken);
      return { accessToken: newToken };
    }
    throw new Error('No user logged in');
  }

  getStoredTokens() {
    return {
      accessToken: localStorage.getItem('gfa_access_token'),
      refreshToken: localStorage.getItem('gfa_refresh_token')
    };
  }

  clearAllData() {
    localStorage.removeItem('gfa_access_token');
    localStorage.removeItem('gfa_refresh_token');
    localStorage.removeItem('gfa_user_data');
  }
}

export const mockAuthService = new MockAuthService();