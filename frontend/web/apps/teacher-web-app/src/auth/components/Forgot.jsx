// src/auth/components/Forgot.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, ChevronLeft, CheckCircle2, AlertCircle, Triangle, TriangleAlert } from 'lucide-react';

const ForgotPasswordForm = ({ onToggleMode }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const isEmailValid = useMemo(() => 
    email && /\S+@\S+\.\S+/.test(email),
    [email]
  );

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
    if (error) setError(null);
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading(true);
    setError(null);
    
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isEmailValid, email, forgotPassword]);

  const handleRetry = useCallback(() => {
    setSubmitted(false);
    setEmail('');
    setError(null);
  }, []);

  if (submitted) {
    return (
      <div className="auth-form-container">
        <div className="success-state animate-fade-in">
          <div className="success-icon-container">
            <div className="success-icon">
              <CheckCircle2 size={48} />
            </div>
          </div>
          
          <div className="success-content">
            <h2 className="success-title">Check Your Email</h2>
            <p className="success-description">
              We've sent password reset instructions to:
            </p>
            <div className="email-display">{email}</div>
            
            <div className="instructions-card">
              <div className="instruction-item">
                <div className="instruction-icon">
                  <Mail size={20} />
                </div>
                <div className="instruction-text">
                  <strong>Check your inbox and spam folder</strong>
                  <p>The reset email should arrive within a few minutes</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="instruction-text">
                  <strong>Link expires in 1 hour</strong>
                  <p>For security reasons, the reset link has a time limit</p>
                </div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                onClick={onToggleMode}
                className="auth-button secondary"
              >
                Back to Login
              </button>
              <button 
                onClick={handleRetry}
                className="auth-button outline"
              >
                Send Another Email
              </button>
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
          <h1 className="auth-title">Reset Your Password</h1>
          <p className="auth-subtitle">
            Enter your school email and we'll send you secure reset instructions
          </p>
        </div>
      </div>

      {error && (
        <div className="auth-error animate-slide-in" role="alert">
          <div className="error-content">
            <TriangleAlert size={20} color='red' />
            <div>
              <strong>Reset Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="reset-email" className="form-label">
            School Email Address
          </label>
          <div className={`form-input-container ${error ? 'error' : email && isEmailValid ? 'success' : 'default'}`}>
            <div className="input-icon">
              <Mail size={20} />
            </div>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="form-input with-icon"
              placeholder="teacher@school.com"
              disabled={loading}
              autoComplete="email"
              required
              style={{ color: '#000000' }}
            />
            {email && isEmailValid && (
              <CheckCircle2 className="field-icon success" size={20} />
            )}
          </div>
          <div className="form-hint">
            Enter the email address associated with your teacher account
          </div>
        </div>

        <button
          type="submit"
          disabled={!isEmailValid || loading}
          className={`auth-button primary ${loading ? 'loading' : ''} ${isEmailValid ? 'ready' : ''}`}
        >
          <span className="button-content">
            {loading ? (
              <>
                <div className="button-spinner" aria-hidden="true"></div>
                Sending Reset Link...
              </>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </span>
        </button>
      </form>

      <div className="auth-footer">
        <button 
          type="button" 
          className="back-link"
          onClick={onToggleMode}
          disabled={loading}
        >
          <ChevronLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default React.memo(ForgotPasswordForm);