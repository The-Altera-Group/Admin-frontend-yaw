import React, { useState, useMemo } from 'react';
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
  const [selectedClass, setSelectedClass] = useState('all');

  // API integration for classes
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  // API integration for attendance
  const {
    data: attendanceData,
    loading: loadingAttendance,
    error: attendanceError,
    execute: fetchAttendance
  } = useApi(attendanceService.getAll, { immediate: true, initialData: [] });

  // Combined loading and error states
  const loading = loadingClasses || loadingAttendance;
  const error = classesError || attendanceError;

  // CRUD handlers
  const handleMarkAttendance = async (studentId, status) => {
    try {
      await attendanceService.markAttendance({
        studentId,
        classId: selectedClass,
        date: selectedDate.toISOString().split('T')[0],
        status
      });
      fetchAttendance();
    } catch (err) {
      alert('Failed to mark attendance: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredAttendance = useMemo(() => {
    if (!attendanceData || !Array.isArray(attendanceData)) return [];
    return attendanceData.filter(record => {
      if (selectedClass === 'all') return true;
      return record.classId === selectedClass;
    });
  }, [attendanceData, selectedClass]);

  const stats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(r => r.status === 'present').length;
    const absent = filteredAttendance.filter(r => r.status === 'absent').length;
    const late = filteredAttendance.filter(r => r.status === 'late').length;
    const excused = filteredAttendance.filter(r => r.status === 'excused').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, excused, rate };
  }, [filteredAttendance]);

  const handleMarkAll = (status) => {
    setAttendanceData(prev =>
      prev.map(record => ({
        ...record,
        status,
        time: status === 'present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
      }))
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      present: { bg: '#dcfce7', color: '#22c55e', border: '#bbf7d0' },
      absent: { bg: '#fee2e2', color: '#ef4444', border: '#fecaca' },
      late: { bg: '#fef3c7', color: '#f59e0b', border: '#fde68a' },
      excused: { bg: '#dbeafe', color: '#3b82f6', border: '#bfdbfe' }
    };
    return colors[status] || colors.present;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            <p className="page-subtitle">Mark and manage student attendance</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

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
              <div className="stat-value">{stats.rate}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="date-selector">
            <button className="date-nav" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>
              <ChevronLeft size={20} />
            </button>
            <div className="current-date">
              <Calendar size={18} />
              <span>{formatDate(selectedDate)}</span>
            </div>
            <button className="date-nav" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>
              <ChevronRight size={20} />
            </button>
          </div>

          <select
            className="class-selector"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>

          <div className="quick-actions">
            <button className="quick-btn" onClick={() => handleMarkAll('present')}>
              Mark All Present
            </button>
            <button className="quick-btn" onClick={() => handleMarkAll('absent')}>
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => {
                const statusStyle = getStatusColor(record.status);
                const classInfo = classes.find(c => c.id === record.classId);

                return (
                  <tr key={record.id}>
                    <td className="student-id">{record.studentId}</td>
                    <td className="student-name">
                      <div className="name-cell">
                        <div className="avatar">
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {record.name}
                      </div>
                    </td>
                    <td>{classInfo?.code}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`
                        }}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="time-cell">{record.time || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-icon present"
                          onClick={() => handleMarkAttendance(record.studentId, 'present')}
                          title="Mark Present"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          className="action-icon late"
                          onClick={() => handleMarkAttendance(record.studentId, 'late')}
                          title="Mark Late"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          className="action-icon absent"
                          onClick={() => handleMarkAttendance(record.studentId, 'absent')}
                          title="Mark Absent"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          className="action-icon excused"
                          onClick={() => handleMarkAttendance(record.studentId, 'excused')}
                          title="Mark Excused"
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
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 2rem;
        }

        .loading-state p {
          margin-top: 1rem;
          color: var(--text-muted);
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

        .btn-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--primary-green);
          color: var(--primary-green);
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

        .quick-btn:hover {
          background: var(--primary-green);
          color: white;
          border-color: var(--primary-green);
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

        .attendance-table td {
          padding: 1rem;
          color: var(--text-primary);
        }

        .student-id {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--text-muted);
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
        }

        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 600;
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
        }

        .action-icon.present:hover {
          background: #dcfce7;
          color: #22c55e;
        }

        .action-icon.late:hover {
          background: #fef3c7;
          color: #f59e0b;
        }

        .action-icon.absent:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .action-icon.excused:hover {
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
            min-width: 800px;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default React.memo(Attendance);