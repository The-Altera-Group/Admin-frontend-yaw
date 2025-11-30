// src/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Login';
import ForgotPasswordForm from './components/Forgot';
import ResetPasswordForm from './components/Reset';
import { GraduationCap } from 'lucide-react';

const AuthLayout = ({ children, pageType = 'forgot' }) => {
  const getVisualContent = () => {
    switch (pageType) {
      case 'login':
        return {
          title: "Welcome Back",
          subtitle: "Manage Classes, Students & Lessons Easily"
        };
      case 'forgot':
        return {
          title: "Secure Account Recovery",
          subtitle: "Password Reset Made Simple. Get back to teaching with our secure password recovery system.",
        };
      case 'reset':
        return {
          title: "Create Your New Password", 
          subtitle: "Set a strong password to protect your classroom data and student information.",
        };
      default:
        return {
          title: "Welcome Back",
          subtitle: "Manage Classes, Students & Lessons Easily"
        };
    }
  };

  const visualContent = getVisualContent();

  return (
    <div className="auth-page">
      <div className="auth-layout">
        {/* Left Panel - Visual Content */}
          <div className="auth-visual overlay">     
            <div className="visual-content">
              <div className="school-brand">
                <div className="school-logo">
                  <GraduationCap size={32} />
                  <span className="logo-text">OAIS</span>
                </div>
              </div>
                
              <div className="visual-details">
                <h1 className="visual-title">{visualContent.title}</h1>
                <h2 className="visual-subtitle">{visualContent.subtitle}</h2>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="auth-content">
          <div className="auth-content-inner">
            <div className="auth-container">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState('login');

  // Check for success message from password reset
  const successMessage = location.state?.message;

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Redirect to intended destination or dashboard
      const redirectPath = location.state?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  if (loading) {
    return (
      <AuthLayout pageType="login">
        <div className="loading-state">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-content">
              <h3>Checking Authentication</h3>
              <p>Please wait while we verify your session...</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout pageType="login">
      {successMessage && (
        <div className="auth-success-message animate-slide-in">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      
      {mode === 'login' ? (
        <LoginForm onToggleMode={() => setMode('forgot')} />
      ) : (
        <ForgotPasswordForm onToggleMode={() => setMode('login')} />
      )}
    </AuthLayout>
  );
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for error message from invalid reset token
  const errorMessage = location.state?.error;

  return (
    <AuthLayout pageType="forgot">
      {errorMessage && (
        <div className="auth-error-message animate-slide-in">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      <ForgotPasswordForm onToggleMode={() => navigate('/auth/login')} />
    </AuthLayout>
  );
};

const ResetPasswordPage = () => {
  return (
    <AuthLayout pageType="reset">
      <ResetPasswordForm />
    </AuthLayout>
  );
};

const AuthPage = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
};

export default AuthPage;