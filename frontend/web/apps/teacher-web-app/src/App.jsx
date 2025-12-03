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

// Import all page components
import ClassManagement from './pages/ClassManagement';
import Assignments from './pages/Assignments';
import Gradebook from './pages/Gradebook';
import StudentProfiles from './pages/StudentProfiles';
import Attendance from './pages/Attendance';
import Messages from './pages/Messages';
import ResourceLibrary from './pages/ResourceLibrary';
import Calendar from './pages/Calendar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="teacher-app">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/teacher/*" element={<AuthPage />} />

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
              path="/classes"
              element={
                <ProtectedRoute>
                  <ClassManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <Gradebook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <ResourceLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />

            {/* Redirect Routes */}
            <Route path="/login" element={<Navigate to="/auth/teacher/login" replace />} />
            <Route path="/" element={<Navigate to="/overview" replace />} />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;