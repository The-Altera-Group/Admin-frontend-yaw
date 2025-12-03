// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/context/AuthProvider';
import AuthPage from './auth/AuthPage';
import ProtectedRoute from './components/ui/ProtectedRoute';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import Unauthorized from './components/Unauthorized';
import NotFound from './components/NotFound';
import './styles/auth.css';
import './styles/dashboard.css';

import GradeDistribution from './components/dashboard/GradeDistribution';
import Classes from './components/dashboard/Classes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="teacher-app">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/teacher/*" element={<AuthPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/overview" 
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <GradeDistribution />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              }
            />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Redirect Routes */}
            <Route path="/login" element={<Navigate to="/auth/teacher/login" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;