// src/components/ui/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallbackPath = '/auth/login',
  loadingComponent = null 
}) => {
  const { 
    isAuthenticated, 
    loading, 
    user,
    hasRole, 
    hasPermission 
  } = useAuth();
  const location = useLocation();

  // Show loading component while checking authentication
  if (loading) {
    return loadingComponent || (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: `Access denied. Required role: ${requiredRole}. Your role: ${user?.role}`,
          from: location 
        }} 
        replace 
      />
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: `Access denied. Required permission: ${requiredPermission}`,
          from: location 
        }} 
        replace 
      />
    );
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;