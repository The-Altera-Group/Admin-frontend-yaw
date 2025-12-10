import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, TriangleAlert } from 'lucide-react';

const LoginForm = ({ onToggleMode }) => {
  const { loginWithRedirect, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [focusedField, setFocusedField] = useState(null);

  const validationErrors = useMemo(() => {
    const errors = {};
    
    if (touched.email) {
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (touched.password) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    }
    
    return errors;
  }, [formData.email, formData.password, touched]);

  const isFormValid = useMemo(() => 
    formData.email && 
    formData.password && 
    !validationErrors.email && 
    !validationErrors.password,
    [formData.email, formData.password, validationErrors]
  );

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFocusedField(null);
  }, []);

  const handleFocus = useCallback((field) => {
    setFocusedField(field);
    if (error) clearError();
  }, [error, clearError]);

  const handleChange = useCallback((field, value) => {
    if (error) clearError();
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [error, clearError]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });
    
    if (!isFormValid) return;

    try {
      await loginWithRedirect(formData, '/overview');
    } catch (error) {
      // Error is handled by context, but we can add additional local handling
      console.error('Login failed:', error);
      // The error will be displayed via the context error state
    }
  }, [formData, isFormValid, loginWithRedirect]);

  const getFieldStatus = (field) => {
    if (focusedField === field) return 'focused';
    if (validationErrors[field]) return 'error';
    return 'default';
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <div className="welcome-content">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>
      </div>

      {error && (
        <div className="auth-error animate-slide-in" role="alert">
          <div className="error-content">
            <TriangleAlert size={18} color='#ef4444' />
            <div className="error-text">
              <strong>Authentication Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className={`form-input-container ${getFieldStatus('email')}`}>
            <div className="input-icon">
              <Mail size={20} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              onFocus={() => handleFocus('email')}
              className="form-input with-icon"
              placeholder="teacher@school.com"
              disabled={loading}
              autoComplete="email"
              required
              style={{ color: '#000000' }}
            />
          </div>
          {validationErrors.email && (
            <div className="field-error animate-slide-in" role="alert">
              {validationErrors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className={`form-input-container password-container ${getFieldStatus('password')}`}>
            <div className="input-icon">
              <Lock size={20} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              onFocus={() => handleFocus('password')}
              className="form-input with-icon"
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
              required
              minLength="6"
              style={{ color: '#000000' }} // Ensure text is visible
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {validationErrors.password && (
            <div className="field-error animate-slide-in" role="alert">
              {validationErrors.password}
            </div>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              disabled={loading}
            />
            <span className="checkmark"></span>
            <span className="checkbox-label">Remember Me</span>
          </label>
          
          <button 
            type="button" 
            className="forgot-password-link"
            onClick={onToggleMode}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={(!isFormValid && touched.email && touched.password) || loading}
          className={`auth-button primary ${loading ? 'loading' : ''} ${isFormValid ? 'ready' : ''}`}
          aria-busy={loading}
        >
          <span className="button-content">
            {loading ? (
              <>
                <div className="button-spinner" aria-hidden="true"></div>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </span>
        </button>
      </form>
    </div>
  );
};

export default React.memo(LoginForm);