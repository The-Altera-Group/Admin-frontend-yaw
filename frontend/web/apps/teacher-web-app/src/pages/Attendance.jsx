import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import attendanceService from '../services/attendanceService';
import classService from '../services/classService';
import { useApi } from '../hooks/useApi';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Loader,
  RefreshCw
} from 'lucide-react';

const Attendance = () => {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');

  // Format date as YYYY-MM-DD for API calls
  const formattedDate = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  // API integration for classes
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  // Set first class as selected when classes load
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes, selectedClass]);

  // API integration for enriched attendance data
  const {
    data: attendanceData,
    loading: loadingAttendance,
    error: attendanceError,
    execute: fetchAttendance
  } = useApi(
    () => selectedClass
      ? attendanceService.getEnrichedAttendance(selectedClass, formattedDate)
      : Promise.resolve(null),
    { immediate: false, initialData: null }
  );

  // Fetch attendance when class or date changes
  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, formattedDate, fetchAttendance]);

  // Extract data with safe defaults
  const students = useMemo(() => attendanceData?.students || [], [attendanceData?.students]);
  const stats = useMemo(() => attendanceData?.statistics || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    notMarked: 0,
    attendanceRate: 0
  }, [attendanceData?.statistics]);
  const classInfo = useMemo(() => attendanceData?.classInfo || null, [attendanceData?.classInfo]);

  // Combined loading and error states
  const loading = loadingClasses || loadingAttendance;
  const error = classesError || attendanceError;

  // Date navigation handlers (fixed - no mutation)
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Mark attendance for individual student
  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }

    try {
      await attendanceService.markAttendance({
        studentId,
        classId: selectedClass,
        date: formattedDate,
        status,
        time: status === 'present' || status === 'late'
          ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : null
      });

      // Refresh attendance data
      fetchAttendance();
    } catch (err) {
      alert('Failed to mark attendance: ' + (err.message || 'Unknown error'));
    }
  };

  // Mark all students with the same status
  const handleMarkAll = async (status) => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }

    if (students.length === 0) {
      alert('No students found in this class');
      return;
    }

    const confirmed = window.confirm(
      `Mark all ${students.length} students as ${status}?`
    );

    if (!confirmed) return;

    try {
      const studentIds = students.map(s => s.id);
      await attendanceService.markAllStudents(
        selectedClass,
        formattedDate,
        status,
        studentIds
      );

      // Refresh attendance data
      fetchAttendance();
    } catch (err) {
      alert('Failed to mark all attendance: ' + (err.message || 'Unknown error'));
    }
  };

  // Export attendance report
  const handleExport = async () => {
    if (!selectedClass) {
      alert('Please select a class to export');
      return;
    }

    try {
      const blob = await attendanceService.export(selectedClass, {
        startDate: formattedDate,
        endDate: formattedDate,
        format: 'csv'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${classInfo?.code || selectedClass}-${formattedDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export attendance: ' + (err.message || 'Unknown error'));
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    const colors = {
      present: { bg: '#dcfce7', color: '#22c55e', border: '#bbf7d0' },
      absent: { bg: '#fee2e2', color: '#ef4444', border: '#fecaca' },
      late: { bg: '#fef3c7', color: '#f59e0b', border: '#fde68a' },
      excused: { bg: '#dbeafe', color: '#3b82f6', border: '#bfdbfe' }
    };
    return colors[status] || colors.present;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }, [selectedDate]);

  // Check if date is in the future
  const isFutureDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  }, [selectedDate]);

  return (
    <MainLayout user={user} onLogout={logout} activeView="attendance">
      <div className="attendance-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading attendance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load attendance data</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => {
              fetchAttendance();
              fetchClasses();
            }}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Attendance Tracking</h1>
                <p className="page-subtitle">
                  {classInfo ? `${classInfo.name} (${classInfo.code})` : 'Mark and manage student attendance'}
                </p>
              </div>
              <div className="header-actions">
                {!isToday && (
                  <button className="btn-secondary" onClick={goToToday}>
                    <Calendar size={18} />
                    Go to Today
                  </button>
                )}
                <button className="btn-secondary" onClick={handleExport} disabled={!selectedClass}>
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>

            {/* Future Date Warning */}
            {isFutureDate && (
              <div className="warning-banner">
                <AlertCircle size={20} />
                <span>You are viewing a future date. Attendance cannot be marked for future dates.</span>
              </div>
            )}

            {/* Stats Overview */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.present}</div>
                  <div className="stat-label">Present</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                  <XCircle size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.absent}</div>
                  <div className="stat-label">Absent</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.late}</div>
                  <div className="stat-label">Late</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.excused}</div>
                  <div className="stat-label">Excused</div>
                </div>
              </div>

              <div className="stat-card highlight">
                <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats.attendanceRate?.toFixed(1) || 0}%</div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="controls-bar">
              <div className="date-selector">
                <button className="date-nav" onClick={goToPreviousDay}>
                  <ChevronLeft size={20} />
                </button>
                <div className="current-date">
                  <Calendar size={18} />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <button className="date-nav" onClick={goToNextDay}>
                  <ChevronRight size={20} />
                </button>
              </div>

              <select
                className="class-selector"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>

              <div className="quick-actions">
                <button
                  className="quick-btn"
                  onClick={() => handleMarkAll('present')}
                  disabled={isFutureDate || students.length === 0}
                >
                  Mark All Present
                </button>
                <button
                  className="quick-btn"
                  onClick={() => handleMarkAll('absent')}
                  disabled={isFutureDate || students.length === 0}
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* No Class Selected */}
            {!selectedClass && (
              <div className="empty-state">
                <Calendar size={64} color="#9ca3af" />
                <h3>No Class Selected</h3>
                <p>Please select a class to view and mark attendance</p>
              </div>
            )}

            {/* No Students */}
            {selectedClass && students.length === 0 && !loadingAttendance && (
              <div className="empty-state">
                <AlertCircle size={64} color="#9ca3af" />
                <h3>No Students Found</h3>
                <p>There are no students enrolled in this class</p>
              </div>
            )}

            {/* Attendance Table */}
            {selectedClass && students.length > 0 && (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const attendance = student.attendance;
                      const status = attendance?.status;
                      const statusStyle = status ? getStatusColor(status) : null;

                      return (
                        <tr key={student.id}>
                          <td className="student-id">{student.studentId}</td>
                          <td className="student-name">
                            <div className="name-cell">
                              <div className="avatar">
                                {student.avatar ? (
                                  <img src={student.avatar} alt={student.name} />
                                ) : (
                                  student.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                )}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td>
                            {status ? (
                              <span
                                className="status-badge"
                                style={{
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  border: `1px solid ${statusStyle.border}`
                                }}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            ) : (
                              <span className="status-badge not-marked">
                                Not Marked
                              </span>
                            )}
                          </td>
                          <td className="time-cell">{attendance?.time || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-icon present"
                                onClick={() => handleMarkAttendance(student.id, 'present')}
                                title="Mark Present"
                                disabled={isFutureDate}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button
                                className="action-icon late"
                                onClick={() => handleMarkAttendance(student.id, 'late')}
                                title="Mark Late"
                                disabled={isFutureDate}
                              >
                                <Clock size={18} />
                              </button>
                              <button
                                className="action-icon absent"
                                onClick={() => handleMarkAttendance(student.id, 'absent')}
                                title="Mark Absent"
                                disabled={isFutureDate}
                              >
                                <XCircle size={18} />
                              </button>
                              <button
                                className="action-icon excused"
                                onClick={() => handleMarkAttendance(student.id, 'excused')}
                                title="Mark Excused"
                                disabled={isFutureDate}
                              >
                                <AlertCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .attendance-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Loading and Error States */
        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 2rem;
        }

        .loading-state p,
        .empty-state p {
          margin-top: 1rem;
          color: var(--text-muted);
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 1rem 0 0.5rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--primary-green);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 1rem 0 0.5rem;
        }

        .error-state p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: var(--primary-green-dark);
          transform: translateY(-1px);
        }

        /* Warning Banner */
        .warning-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 0.5rem;
          color: #92400e;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: var(--text-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-hover);
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-card.highlight {
          border-color: var(--primary-green);
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(5, 150, 105, 0.02));
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .controls-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.5rem;
        }

        .date-nav {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .date-nav:hover {
          background: var(--primary-green);
          color: white;
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .class-selector {
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          outline: none;
          min-width: 200px;
        }

        .class-selector:focus {
          border-color: var(--primary-green);
        }

        .quick-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .quick-btn {
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-btn:hover:not(:disabled) {
          background: var(--primary-green);
          color: white;
          border-color: var(--primary-green);
        }

        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .attendance-table-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .attendance-table thead {
          background: var(--bg-tertiary);
        }

        .attendance-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .attendance-table tbody tr {
          border-bottom: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .attendance-table tbody tr:hover {
          background: var(--bg-hover);
        }

        .attendance-table tbody tr:last-child {
          border-bottom: none;
        }

        .attendance-table td {
          padding: 1rem;
          color: var(--text-primary);
        }

        .student-id {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-green), var(--primary-green-light));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .status-badge.not-marked {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .time-cell {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .action-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .action-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .action-icon.present:hover:not(:disabled) {
          background: #dcfce7;
          color: #22c55e;
        }

        .action-icon.late:hover:not(:disabled) {
          background: #fef3c7;
          color: #f59e0b;
        }

        .action-icon.absent:hover:not(:disabled) {
          background: #fee2e2;
          color: #ef4444;
        }

        .action-icon.excused:hover:not(:disabled) {
          background: #dbeafe;
          color: #3b82f6;
        }

        @media (max-width: 768px) {
          .attendance-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .quick-actions {
            margin-left: 0;
          }

          .attendance-table-container {
            overflow-x: auto;
          }

          .attendance-table {
            min-width: 700px;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default React.memo(Attendance);
