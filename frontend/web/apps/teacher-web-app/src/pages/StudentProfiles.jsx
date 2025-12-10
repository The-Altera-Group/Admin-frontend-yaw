import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import studentService from '../services/studentService';
import classService from '../services/classService';
import { useApi } from '../hooks/useApi';
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart2,
  MessageSquare,
  Download,
  Edit2,
  X,
  ChevronRight,
  Users,
  BookOpen,
  Loader,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const StudentProfiles = () => {
  const { user, logout } = useAuth();

  // State management
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // API integration for students
  const {
    data: students,
    loading: loadingStudents,
    error: studentsError,
    execute: fetchStudents
  } = useApi(studentService.getAll, { immediate: true, initialData: [] });

  // API integration for classes
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  // Combined loading and error states
  const loading = loadingStudents || loadingClasses;
  const error = studentsError || classesError;

  // CRUD handlers
  const handleExportStudent = async (studentId) => {
    try {
      const blob = await studentService.export(studentId, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-profile-${studentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export student profile: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle message student (navigate to messages page)
  const handleMessageStudent = (student) => {
    // In a real implementation, this would navigate to Messages page with student pre-selected
    // or open a compose message modal
    alert(`Message functionality would open composer for ${student.name} (${student.email})`);
  };

  // Handle edit student
  const handleEditStudent = (student) => {
    // In a real implementation, this would open an edit modal
    alert(`Edit functionality would open edit form for ${student.name}`);
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    let filtered = students;

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(s => s.class === selectedClass || s.classId === selectedClass);
    }

    // Filter by grade
    if (filterGrade !== 'all') {
      if (filterGrade === 'A') {
        filtered = filtered.filter(s => (s.averageGrade || 0) >= 90);
      } else if (filterGrade === 'B') {
        filtered = filtered.filter(s => (s.averageGrade || 0) >= 80 && (s.averageGrade || 0) < 90);
      } else if (filterGrade === 'C') {
        filtered = filtered.filter(s => (s.averageGrade || 0) >= 70 && (s.averageGrade || 0) < 80);
      } else if (filterGrade === 'at_risk') {
        filtered = filtered.filter(s => s.status === 'at_risk' || (s.averageGrade || 0) < 70);
      }
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedClass, filterGrade, searchTerm]);

  // Calculate overall statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length;
    const averageGrade = students.reduce((sum, s) => sum + s.averageGrade, 0) / totalStudents;
    const averageAttendance = students.reduce((sum, s) => sum + s.attendance, 0) / totalStudents;
    const atRiskCount = students.filter(s => s.status === 'at_risk').length;

    return {
      total: totalStudents,
      averageGrade: averageGrade.toFixed(1),
      averageAttendance: averageAttendance.toFixed(1),
      atRisk: atRiskCount
    };
  }, [students]);

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return { label: 'Active', color: '#10b981', icon: CheckCircle };
    }
    if (status === 'at_risk') {
      return { label: 'At Risk', color: '#ef4444', icon: AlertTriangle };
    }
    return { label: 'Inactive', color: '#6b7280', icon: Clock };
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} className="trend-up" />;
    if (trend === 'down') return <TrendingDown size={16} className="trend-down" />;
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get attendance status color
  const getAttendanceColor = (status) => {
    if (status === 'present') return '#10b981';
    if (status === 'late') return '#f59e0b';
    if (status === 'absent') return '#ef4444';
    return '#6b7280';
  };

  return (
    <MainLayout user={user} onLogout={logout} activeView="students">
      <div className="students-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading student profiles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load student profiles</h3>
            <p>{error}</p>
            <button className="action-btn" onClick={() => {
              fetchStudents();
              fetchClasses();
            }}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && !selectedStudent && (
          <>
            {/* Header */}
            <div className="page-header">
              <div className="header-content">
                <div>
                  <h1 className="page-title">Student Profiles</h1>
                  <p className="page-subtitle">View and manage student information</p>
                </div>

                <button className="action-btn">
                  <Download size={18} />
                  Export Data
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.total}</div>
                  <div className="stat-label">Total Students</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper green">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.averageGrade}%</div>
                  <div className="stat-label">Average Grade</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper purple">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.averageAttendance}%</div>
                  <div className="stat-label">Avg Attendance</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper orange">
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.atRisk}</div>
                  <div className="stat-label">At Risk Students</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filters-row">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  <option value="all">All Grades</option>
                  <option value="A">A Students (90-100%)</option>
                  <option value="B">B Students (80-89%)</option>
                  <option value="C">C Students (70-79%)</option>
                  <option value="at_risk">At Risk (60-70%)</option>
                </select>
              </div>
            </div>

            {/* Students List */}
            <div className="students-list">
              {filteredStudents.length === 0 ? (
                <div className="empty-state">
                  <User size={64} className="empty-icon" />
                  <p className="empty-title">No students found</p>
                  <p className="empty-subtitle">
                    Try adjusting your filters or search term
                  </p>
                </div>
              ) : (
                filteredStudents.map(student => {
                  const statusBadge = getStatusBadge(student.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={student.id}
                      className="student-card"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-card-header">
                        <div className="student-avatar">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="student-info-main">
                          <h3 className="student-name">
                            {student.name}
                            {getTrendIcon(student.trend)}
                          </h3>
                          <p className="student-number">{student.studentNumber}</p>
                          <p className="student-class">{student.className}</p>
                        </div>
                        <div className="student-grade-badge">
                          <div className="grade-circle">{student.grade}</div>
                          <div className="gpa-text">{student.gpa} GPA</div>
                        </div>
                      </div>

                      <div className="student-card-body">
                        <div className="info-row">
                          <div className="info-item">
                            <Mail size={14} />
                            <span>{student.email}</span>
                          </div>
                          <div className="info-item">
                            <Phone size={14} />
                            <span>{student.phone}</span>
                          </div>
                        </div>

                        <div className="metrics-row">
                          <div className="metric">
                            <BarChart2 size={14} />
                            <span className="metric-label">Avg</span>
                            <span className="metric-value">{student.averageGrade}%</span>
                          </div>
                          <div className="metric">
                            <CheckCircle size={14} />
                            <span className="metric-label">Attendance</span>
                            <span className="metric-value">{student.attendance}%</span>
                          </div>
                          <div className="metric">
                            <FileText size={14} />
                            <span className="metric-label">Assignments</span>
                            <span className="metric-value">{student.assignmentsCompleted}/{student.totalAssignments}</span>
                          </div>
                        </div>

                        <div className="student-status">
                          <div
                            className="status-badge"
                            style={{ background: statusBadge.color + '20', color: statusBadge.color }}
                          >
                            <StatusIcon size={14} />
                            {statusBadge.label}
                          </div>
                          <button className="view-profile-btn">
                            View Profile
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Student Detail View */}
        {!loading && !error && selectedStudent && (
          <div className="student-detail">
            <div className="detail-header">
              <button className="back-btn" onClick={() => setSelectedStudent(null)}>
                <X size={20} />
                Back to List
              </button>

              <div className="detail-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => handleMessageStudent(selectedStudent)}
                >
                  <MessageSquare size={18} />
                  Message
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => handleEditStudent(selectedStudent)}
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => handleExportStudent(selectedStudent.id)}
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Student Header */}
            <div className="detail-student-header">
              <div className="detail-avatar">
                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="detail-info">
                <h1 className="detail-name">{selectedStudent.name}</h1>
                <p className="detail-number">{selectedStudent.studentNumber}</p>
                <div className="detail-badges">
                  {(() => {
                    const statusBadge = getStatusBadge(selectedStudent.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <div
                        className="status-badge"
                        style={{ background: statusBadge.color + '20', color: statusBadge.color }}
                      >
                        <StatusIcon size={14} />
                        {statusBadge.label}
                      </div>
                    );
                  })()}
                  <div className="grade-badge">{selectedStudent.grade} Grade</div>
                </div>
              </div>
              <div className="detail-stats">
                <div className="detail-stat">
                  <div className="stat-value-large">{selectedStudent.averageGrade}%</div>
                  <div className="stat-label-small">Average</div>
                </div>
                <div className="detail-stat">
                  <div className="stat-value-large">{selectedStudent.attendance}%</div>
                  <div className="stat-label-small">Attendance</div>
                </div>
                <div className="detail-stat">
                  <div className="stat-value-large">{selectedStudent.gpa}</div>
                  <div className="stat-label-small">GPA</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <button
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button
                className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance
              </button>
              <button
                className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact Info
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <div className="overview-grid">
                    {/* Performance Breakdown */}
                    <div className="overview-card">
                      <h3 className="card-title">Performance by Category</h3>
                      <div className="performance-breakdown">
                        {Object.entries(selectedStudent.performance).map(([category, score]) => (
                          <div key={category} className="performance-item">
                            <div className="performance-header">
                              <span className="performance-label">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </span>
                              <span className="performance-score">{score}%</span>
                            </div>
                            <div className="performance-bar">
                              <div
                                className="performance-fill"
                                style={{
                                  width: `${score}%`,
                                  background: score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Grades */}
                    <div className="overview-card">
                      <h3 className="card-title">Recent Grades</h3>
                      <div className="recent-grades">
                        {selectedStudent.recentGrades.map((grade, index) => {
                          const percentage = (grade.grade / grade.maxPoints) * 100;
                          return (
                            <div key={index} className="grade-item">
                              <div className="grade-item-header">
                                <span className="grade-item-name">{grade.assignment}</span>
                                <span className="grade-item-date">{formatDate(grade.date)}</span>
                              </div>
                              <div className="grade-item-score">
                                <span>{grade.grade}/{grade.maxPoints}</span>
                                <span
                                  className="grade-item-percentage"
                                  style={{
                                    color: percentage >= 90 ? '#10b981' : percentage >= 80 ? '#3b82f6' : percentage >= 70 ? '#f59e0b' : '#ef4444'
                                  }}
                                >
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="overview-card full-width">
                      <h3 className="card-title">Teacher Notes</h3>
                      <div className="notes-list">
                        {selectedStudent.notes.map(note => (
                          <div
                            key={note.id}
                            className={`note-item ${note.type}`}
                          >
                            <div className="note-header">
                              <span className="note-date">{formatDate(note.date)}</span>
                              <span className={`note-type-badge ${note.type}`}>
                                {note.type === 'positive' ? '✓' : note.type === 'warning' ? '!' : 'ℹ'}
                              </span>
                            </div>
                            <p className="note-text">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="performance-tab">
                  <div className="performance-grid">
                    {/* Academic Summary */}
                    <div className="performance-card full-width">
                      <h3 className="card-title">Academic Performance Summary</h3>
                      <div className="performance-stats">
                        <div className="perf-stat">
                          <div className="perf-stat-value">{selectedStudent.averageGrade}%</div>
                          <div className="perf-stat-label">Overall Average</div>
                          <div className="perf-stat-change positive">+3.5% from last term</div>
                        </div>
                        <div className="perf-stat">
                          <div className="perf-stat-value">{selectedStudent.gpa}</div>
                          <div className="perf-stat-label">GPA</div>
                          <div className="perf-stat-change positive">+0.2 from last term</div>
                        </div>
                        <div className="perf-stat">
                          <div className="perf-stat-value">{selectedStudent.assignmentsCompleted}/{selectedStudent.totalAssignments}</div>
                          <div className="perf-stat-label">Assignments Completed</div>
                          <div className="perf-stat-change neutral">{Math.round((selectedStudent.assignmentsCompleted / selectedStudent.totalAssignments) * 100)}% completion rate</div>
                        </div>
                        <div className="perf-stat">
                          <div className="perf-stat-value">#{selectedStudent.classRank || 5}</div>
                          <div className="perf-stat-label">Class Rank</div>
                          <div className="perf-stat-change neutral">out of {selectedStudent.classSize || 28} students</div>
                        </div>
                      </div>
                    </div>

                    {/* Subject Performance */}
                    <div className="performance-card">
                      <h3 className="card-title">Performance by Subject</h3>
                      <div className="subject-performance">
                        {Object.entries(selectedStudent.performance).map(([subject, score]) => {
                          const getGrade = (score) => {
                            if (score >= 90) return 'A';
                            if (score >= 80) return 'B';
                            if (score >= 70) return 'C';
                            if (score >= 60) return 'D';
                            return 'F';
                          };

                          return (
                            <div key={subject} className="subject-item">
                              <div className="subject-header">
                                <span className="subject-name">{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                                <span className="subject-grade">{getGrade(score)}</span>
                              </div>
                              <div className="subject-score">{score}%</div>
                              <div className="subject-bar">
                                <div
                                  className="subject-fill"
                                  style={{
                                    width: `${score}%`,
                                    background: score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Strengths & Areas for Improvement */}
                    <div className="performance-card">
                      <h3 className="card-title">Strengths & Areas for Improvement</h3>
                      <div className="strengths-weaknesses">
                        <div className="strength-section">
                          <h4 className="section-subtitle"><CheckCircle size={16} className="icon-green" /> Strengths</h4>
                          <ul className="performance-list">
                            {Object.entries(selectedStudent.performance)
                              .filter(([_, score]) => score >= 85)
                              .map(([subject, score]) => (
                                <li key={subject}>
                                  <strong>{subject.charAt(0).toUpperCase() + subject.slice(1)}:</strong> Excellent performance at {score}%
                                </li>
                              ))}
                            <li><strong>Consistency:</strong> Regular attendance and on-time assignment submission</li>
                          </ul>
                        </div>
                        <div className="weakness-section">
                          <h4 className="section-subtitle"><AlertTriangle size={16} className="icon-orange" /> Areas for Improvement</h4>
                          <ul className="performance-list">
                            {Object.entries(selectedStudent.performance)
                              .filter(([_, score]) => score < 80)
                              .map(([subject, score]) => (
                                <li key={subject}>
                                  <strong>{subject.charAt(0).toUpperCase() + subject.slice(1)}:</strong> Needs focus (currently {score}%)
                                </li>
                              ))}
                            {Object.entries(selectedStudent.performance).every(([_, score]) => score >= 80) && (
                              <li>No major areas of concern. Continue current performance level.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Grade Trend */}
                    <div className="performance-card full-width">
                      <h3 className="card-title">Grade Trend Over Time</h3>
                      <div className="trend-chart">
                        <div className="trend-info">
                          <p className="trend-description">
                            {selectedStudent.trend === 'up'
                              ? `${selectedStudent.name}'s grades have been improving consistently over the past few weeks. Continue to encourage this positive trend.`
                              : selectedStudent.trend === 'down'
                              ? `${selectedStudent.name}'s grades have shown a slight decline. Consider scheduling a meeting to discuss any challenges.`
                              : `${selectedStudent.name} is maintaining steady academic performance. Keep monitoring progress.`}
                          </p>
                        </div>
                        <div className="trend-visualization">
                          {selectedStudent.recentGrades.map((grade, index) => {
                            const percentage = (grade.grade / grade.maxPoints) * 100;
                            return (
                              <div key={index} className="trend-bar-container">
                                <div className="trend-label">{grade.assignment.substring(0, 15)}...</div>
                                <div className="trend-bar-wrapper">
                                  <div
                                    className="trend-bar"
                                    style={{
                                      width: `${percentage}%`,
                                      background: percentage >= 90 ? '#10b981' : percentage >= 80 ? '#3b82f6' : percentage >= 70 ? '#f59e0b' : '#ef4444'
                                    }}
                                  >
                                    <span className="trend-value">{percentage.toFixed(0)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="attendance-tab">
                  <div className="attendance-summary">
                    <div className="attendance-stat-card">
                      <div className="attendance-percentage">{selectedStudent.attendance}%</div>
                      <div className="attendance-label">Overall Attendance</div>
                    </div>
                  </div>
                  <div className="attendance-history">
                    <h3 className="card-title">Recent Attendance</h3>
                    <div className="attendance-list">
                      {selectedStudent.attendanceHistory.map((record, index) => (
                        <div key={index} className="attendance-record">
                          <span className="attendance-date">{formatDate(record.date)}</span>
                          <span
                            className="attendance-status-badge"
                            style={{
                              background: getAttendanceColor(record.status) + '20',
                              color: getAttendanceColor(record.status)
                            }}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="contact-tab">
                  <div className="contact-grid">
                    <div className="contact-card">
                      <h3 className="card-title">Student Contact</h3>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={18} />
                          <div>
                            <div className="contact-label">Email</div>
                            <div className="contact-value">{selectedStudent.email}</div>
                          </div>
                        </div>
                        <div className="contact-item">
                          <Phone size={18} />
                          <div>
                            <div className="contact-label">Phone</div>
                            <div className="contact-value">{selectedStudent.phone}</div>
                          </div>
                        </div>
                        <div className="contact-item">
                          <MapPin size={18} />
                          <div>
                            <div className="contact-label">Address</div>
                            <div className="contact-value">
                              {selectedStudent.address.street}<br />
                              {selectedStudent.address.city}, {selectedStudent.address.state} {selectedStudent.address.zip}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="contact-card">
                      <h3 className="card-title">Parent/Guardian Contact</h3>
                      <div className="contact-info">
                        <div className="contact-item">
                          <User size={18} />
                          <div>
                            <div className="contact-label">Name</div>
                            <div className="contact-value">
                              {selectedStudent.parent.name} ({selectedStudent.parent.relationship})
                            </div>
                          </div>
                        </div>
                        <div className="contact-item">
                          <Mail size={18} />
                          <div>
                            <div className="contact-label">Email</div>
                            <div className="contact-value">{selectedStudent.parent.email}</div>
                          </div>
                        </div>
                        <div className="contact-item">
                          <Phone size={18} />
                          <div>
                            <div className="contact-label">Phone</div>
                            <div className="contact-value">{selectedStudent.parent.phone}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .students-page {
          padding: var(--space-lg);
          background: var(--bg-primary);
          min-height: 100vh;
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

        /* Header */
        .page-header {
          margin-bottom: var(--space-lg);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-md);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-primary);
        }

        .action-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .action-btn.secondary {
          background: white;
          color: var(--text-primary);
        }

        /* Statistics */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon-wrapper.blue { background: #3b82f6; }
        .stat-icon-wrapper.green { background: #10b981; }
        .stat-icon-wrapper.purple { background: #8b5cf6; }
        .stat-icon-wrapper.orange { background: #f59e0b; }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Filters */
        .filters-section {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .filters-row {
          display: flex;
          gap: var(--space-md);
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 0.625rem 0.625rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .filter-select {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary-green);
        }

        /* Students List */
        .students-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--space-lg);
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl) * 2;
          background: white;
          border: 2px dashed var(--border-color);
          border-radius: 0.75rem;
        }

        .empty-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
          opacity: 0.3;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .empty-subtitle {
          color: var(--text-tertiary);
          margin: 0;
        }

        /* Student Card */
        .student-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .student-card:hover {
          border-color: var(--primary-green);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .student-card-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--border-color);
        }

        .student-avatar,
        .detail-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary-green), #059669);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .student-info-main {
          flex: 1;
        }

        .student-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }

        .student-number {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin: 0 0 2px 0;
        }

        .student-class {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .student-grade-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .grade-circle {
          width: 48px;
          height: 48px;
          background: var(--primary-green);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .gpa-text {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .student-card-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-sm);
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .metric-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .student-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .view-profile-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-profile-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        /* Student Detail View */
        .student-detail {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.25rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .detail-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .detail-student-header {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .detail-avatar {
          width: 80px;
          height: 80px;
          font-size: 2rem;
        }

        .detail-info {
          flex: 1;
        }

        .detail-name {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .detail-number {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          margin: 0 0 var(--space-sm) 0;
        }

        .detail-badges {
          display: flex;
          gap: var(--space-sm);
        }

        .grade-badge {
          padding: 0.375rem 0.75rem;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .detail-stats {
          display: flex;
          gap: var(--space-xl);
        }

        .detail-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value-large {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label-small {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        /* Tabs */
        .detail-tabs {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-sm);
          display: flex;
          gap: var(--space-xs);
        }

        .tab-btn {
          flex: 1;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: var(--primary-green);
          color: white;
        }

        .tab-btn:hover:not(.active) {
          background: var(--bg-secondary);
        }

        /* Tab Content */
        .tab-content {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .overview-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .overview-card.full-width {
          grid-column: 1 / -1;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-md) 0;
        }

        .performance-breakdown,
        .recent-grades,
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .performance-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .performance-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .performance-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .performance-score {
          font-weight: 700;
          color: var(--text-primary);
        }

        .performance-bar {
          height: 8px;
          background: white;
          border-radius: 4px;
          overflow: hidden;
        }

        .performance-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .grade-item {
          padding: var(--space-md);
          background: white;
          border-radius: 0.5rem;
        }

        .grade-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-xs);
        }

        .grade-item-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .grade-item-date {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .grade-item-score {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .grade-item-percentage {
          font-weight: 700;
          font-size: 1rem;
        }

        .note-item {
          padding: var(--space-md);
          border-radius: 0.5rem;
          margin-bottom: var(--space-sm);
        }

        .note-item.positive {
          background: #dcfce7;
          border-left: 3px solid #10b981;
        }

        .note-item.warning {
          background: #fee2e2;
          border-left: 3px solid #ef4444;
        }

        .note-item.neutral {
          background: #dbeafe;
          border-left: 3px solid #3b82f6;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-xs);
        }

        .note-date {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .note-type-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .note-type-badge.positive {
          background: #10b981;
          color: white;
        }

        .note-type-badge.warning {
          background: #ef4444;
          color: white;
        }

        .note-type-badge.neutral {
          background: #3b82f6;
          color: white;
        }

        .note-text {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-primary);
          line-height: 1.5;
        }

        /* Attendance Tab */
        .attendance-tab {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .attendance-summary {
          display: flex;
          justify-content: center;
        }

        .attendance-stat-card {
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          padding: var(--space-xl);
          text-align: center;
        }

        .attendance-percentage {
          font-size: 3rem;
          font-weight: 700;
          color: var(--primary-green);
        }

        .attendance-label {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-top: var(--space-sm);
        }

        .attendance-history {
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .attendance-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .attendance-record {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md);
          background: white;
          border-radius: 0.5rem;
        }

        .attendance-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .attendance-status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Contact Tab */
        .contact-tab {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .contact-card {
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .contact-item {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-md);
          background: white;
          border-radius: 0.5rem;
        }

        .contact-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .contact-value {
          font-size: 0.875rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Performance Tab */
        .performance-tab {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
        }

        .performance-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .performance-card.full-width {
          grid-column: 1 / -1;
        }

        .performance-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
          margin-top: var(--space-md);
        }

        .perf-stat {
          text-align: center;
        }

        .perf-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-green);
          margin-bottom: var(--space-xs);
        }

        .perf-stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-xs);
        }

        .perf-stat-change {
          font-size: 0.75rem;
        }

        .perf-stat-change.positive {
          color: #10b981;
        }

        .perf-stat-change.neutral {
          color: var(--text-tertiary);
        }

        .perf-stat-change.negative {
          color: #ef4444;
        }

        .subject-performance {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .subject-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .subject-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .subject-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .subject-grade {
          padding: 0.25rem 0.5rem;
          background: var(--bg-secondary);
          border-radius: 0.375rem;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .subject-score {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .subject-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .subject-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .strengths-weaknesses {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          margin-top: var(--space-md);
        }

        .section-subtitle {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-sm) 0;
        }

        .icon-green {
          color: #10b981;
        }

        .icon-orange {
          color: #f59e0b;
        }

        .performance-list {
          margin: 0;
          padding-left: var(--space-lg);
          color: var(--text-secondary);
          line-height: 1.8;
        }

        .performance-list li {
          margin-bottom: var(--space-xs);
        }

        .trend-chart {
          margin-top: var(--space-md);
        }

        .trend-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 var(--space-lg) 0;
        }

        .trend-visualization {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .trend-bar-container {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .trend-label {
          width: 150px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .trend-bar-wrapper {
          flex: 1;
          height: 32px;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .trend-bar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 var(--space-sm);
          transition: width 0.3s ease;
        }

        .trend-value {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .students-list {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }

          .overview-grid,
          .contact-grid,
          .performance-grid {
            grid-template-columns: 1fr;
          }

          .performance-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .detail-student-header {
            flex-direction: column;
            text-align: center;
          }

          .detail-stats {
            width: 100%;
            justify-content: space-around;
          }
        }

        @media (max-width: 768px) {
          .students-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-row {
            flex-direction: column;
          }

          .students-list {
            grid-template-columns: 1fr;
          }

          .metrics-row {
            grid-template-columns: 1fr;
          }

          .detail-tabs {
            overflow-x: auto;
          }

          .tab-btn {
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .stats-grid,
          .performance-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default StudentProfiles;
