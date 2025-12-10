// src/auth/components/Reset.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Shield, Eye, EyeOff, AlertCircle, Check, X, ChevronLeft } from 'lucide-react';

const PasswordRequirement = ({ met, children }) => (
  <div className={`password-requirement ${met ? 'met' : 'unmet'}`}>
    <div className="requirement-icon">
      {met ? <Check size={14} /> : <X size={14} />}
    </div>
    <span>{children}</span>
  </div>
);

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuth();
  
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [touched, setTouched] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/auth/forgot-password', { 
        state: { error: 'Invalid or missing reset token. Please request a new password reset.' } 
      });
    }
  }, [token, navigate]);

  const passwordValidation = useMemo(() => {
    const password = formData.newPassword;
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
  }, [formData.newPassword]);

  const validationErrors = useMemo(() => {
    const errors = {};
    
    if (touched.newPassword && formData.newPassword) {
      const validation = passwordValidation;
      const failedChecks = Object.values(validation).filter(check => !check).length;
      
      if (failedChecks > 0) {
        errors.newPassword = 'Password does not meet all requirements';
      }
    }
    
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  }, [formData, touched, passwordValidation]);

  const isFormValid = useMemo(() => {
    const allPasswordChecks = Object.values(passwordValidation).every(check => check);
    return formData.newPassword && 
           formData.confirmPassword && 
           allPasswordChecks &&
           formData.newPassword === formData.confirmPassword;
  }, [formData, passwordValidation]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleChange = useCallback((field, value) => {
    clearError();
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [clearError]);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched({ newPassword: true, confirmPassword: true });
    
    if (!isFormValid || !token) return;

    try {
      await resetPassword(token, formData.newPassword);
      setResetSuccess(true);
      
      setTimeout(() => {
        navigate('/auth/teacher/login', { 
          state: { 
            message: 'Your password has been reset successfully. Please sign in with your new password.' 
          } 
        });
      }, 3000);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  }, [isFormValid, token, resetPassword, navigate, formData]);

  if (resetSuccess) {
    return (
      <div className="auth-form-container">
        <div className="success-state animate-fade-in">
          <div className="success-icon-container">
            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>
          </div>
          
          <div className="success-content">
            <h2 className="success-title">Password Reset Successful!</h2>
            <p className="success-description">
              Your password has been updated successfully.
            </p>
            <p>Redirecting to login page...</p>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">Redirecting in 3 seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <div className="header-content">
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">Set a strong, secure password for your account</p>
          
          <div className="security-notice">
            <Shield size={16} />
            <span><strong>Secure Reset:</strong> This link will expire after use</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="auth-error animate-slide-in" role="alert">
          <div className="error-content">
            <div className="error-icon">
              <AlertCircle size={20} />
            </div>
            <div>
              <strong>Reset Error</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <div className={`form-input-container password-container ${validationErrors.newPassword ? 'error' : ''}`}>
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.newPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              onBlur={() => handleBlur('newPassword')}
              className="form-input"
              placeholder="Enter new password"
              disabled={loading}
              autoComplete="new-password"
              required
              minLength="8"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('newPassword')}
              disabled={loading}
              aria-label={showPasswords.newPassword ? 'Hide password' : 'Show password'}
            >
              {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="password-requirements">
            <div className="requirements-header">
              <strong>Password Requirements:</strong>
            </div>
            <div className="requirements-list">
              <PasswordRequirement met={passwordValidation.length}>
                At least 8 characters
              </PasswordRequirement>
              <PasswordRequirement met={passwordValidation.uppercase}>
                One uppercase letter
              </PasswordRequirement>
              <PasswordRequirement met={passwordValidation.lowercase}>
                One lowercase letter
              </PasswordRequirement>
              <PasswordRequirement met={passwordValidation.number}>
                One number
              </PasswordRequirement>
              <PasswordRequirement met={passwordValidation.special}>
                One special character
              </PasswordRequirement>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <div className={`form-input-container password-container ${validationErrors.confirmPassword ? 'error' : ''}`}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className="form-input"
              placeholder="Confirm new password"
              disabled={loading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              disabled={loading}
              aria-label={showPasswords.confirmPassword ? 'Hide password' : 'Show password'}
            >
              {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <div className="field-error animate-slide-in">
              {validationErrors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`auth-button primary ${loading ? 'loading' : ''} ${isFormValid ? 'ready' : ''}`}
        >
          <span className="button-content">
            {loading ? (
              <>
                <div className="button-spinner" aria-hidden="true"></div>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </span>
        </button>
      </form>

      <div className="auth-footer">
        <button 
          type="button" 
          className="back-link"
          onClick={() => navigate('/auth/teacher/login')}
          disabled={loading}
        >
          <ChevronLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default React.memo(ResetPasswordForm);