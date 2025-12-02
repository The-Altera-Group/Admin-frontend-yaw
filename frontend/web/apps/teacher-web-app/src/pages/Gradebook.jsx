import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import gradebookService from '../services/gradebookService';
import classService from '../services/classService';
import assignmentService from '../services/assignmentService';
import { useApi } from '../hooks/useApi';
import {
  Download,
  Upload,
  Calculator,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Plus,
  Edit2,
  Save,
  X,
  Loader,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Gradebook = () => {
  const { user, logout } = useAuth();

  // State management
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingCell, setEditingCell] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  // API integration for classes
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  // API integration for assignments
  const {
    data: assignments,
    loading: loadingAssignments,
    error: assignmentsError,
    execute: fetchAssignments
  } = useApi(assignmentService.getAll, { immediate: true, initialData: [] });

  // API integration for gradebook data
  const {
    data: gradebookData,
    loading: loadingGradebook,
    error: gradebookError,
    execute: fetchGradebook
  } = useApi(
    () => selectedClass !== 'all' ? gradebookService.getByClass(selectedClass) : Promise.resolve({ grades: [], categories: [] }),
    { immediate: false, initialData: { grades: [], categories: [] } }
  );

  // Fetch gradebook when class changes
  useEffect(() => {
    if (selectedClass !== 'all') {
      fetchGradebook();
    }
  }, [selectedClass, fetchGradebook]);

  // Extract data from API response with safe defaults (memoized to prevent re-renders)
  const grades = useMemo(() => gradebookData?.grades || [], [gradebookData?.grades]);
  const gradeCategories = useMemo(() => gradebookData?.categories || [], [gradebookData?.categories]);

  // Combined loading and error states
  const loading = loadingClasses || loadingAssignments || loadingGradebook;
  const error = classesError || assignmentsError || gradebookError;

  // CRUD handlers
  const handleSetGrade = async (studentId, assignmentId, grade) => {
    try {
      await gradebookService.setGrade({
        studentId,
        assignmentId,
        classId: selectedClass,
        grade: parseFloat(grade)
      });
      setEditingCell(null);
      fetchGradebook();
    } catch (err) {
      alert('Failed to set grade: ' + (err.message || 'Unknown error'));
    }
  };

  const handleExportGradebook = async () => {
    if (selectedClass === 'all') {
      alert('Please select a specific class to export');
      return;
    }
    try {
      const blob = await gradebookService.export(selectedClass, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gradebook-${selectedClass}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export gradebook: ' + (err.message || 'Unknown error'));
    }
  };


  // Calculate weighted grade for a student
  const calculateWeightedGrade = useCallback((studentGrades) => {
    if (!gradeCategories || !Array.isArray(gradeCategories) || gradeCategories.length === 0) {
      return 0;
    }

    let totalPoints = 0;
    let totalWeight = 0;

    gradeCategories.forEach(category => {
      const categoryAssignments = assignments && Array.isArray(assignments)
        ? assignments.filter(a => a.category === category.id)
        : [];
      let categoryPoints = 0;
      let categoryMaxPoints = 0;
      let hasGrades = false;

      categoryAssignments.forEach(assignment => {
        const grade = studentGrades?.[assignment.id];
        if (grade !== null && grade !== undefined) {
          categoryPoints += grade;
          categoryMaxPoints += assignment.maxPoints || 0;
          hasGrades = true;
        }
      });

      if (hasGrades && categoryMaxPoints > 0) {
        const categoryPercentage = (categoryPoints / categoryMaxPoints) * 100;
        totalPoints += categoryPercentage * ((category.weight || 0) / 100);
        totalWeight += (category.weight || 0);
      }
    });

    return totalWeight > 0 ? (totalPoints / totalWeight) * 100 : 0;
  }, [gradeCategories, assignments]);

  // Convert percentage to letter grade
  const getLetterGrade = (percentage) => {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  // Get GPA from letter grade
  const getGPA = (letterGrade) => {
    const gpaMap = {
      'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gpaMap[letterGrade] || 0.0;
  };

  // Filter assignments by category
  const filteredAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];
    if (selectedCategory === 'all') return assignments;
    return assignments.filter(a => a.category === selectedCategory);
  }, [selectedCategory, assignments]);

  // Filter students by search
  const filteredGrades = useMemo(() => {
    if (!grades || !Array.isArray(grades)) return [];
    if (!searchTerm) return grades;
    return grades.filter(student =>
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, grades]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    if (!filteredGrades || !Array.isArray(filteredGrades) || filteredGrades.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        distribution: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
        missingCount: 0
      };
    }

    const allGrades = filteredGrades.map(student => {
      const weightedGrade = calculateWeightedGrade(student.grades || {});
      return weightedGrade;
    }).filter(grade => grade > 0);

    const average = allGrades.length > 0
      ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length
      : 0;

    const highest = allGrades.length > 0 ? Math.max(...allGrades) : 0;
    const lowest = allGrades.length > 0 ? Math.min(...allGrades) : 0;

    // Grade distribution
    const distribution = {
      'A': allGrades.filter(g => g >= 90).length,
      'B': allGrades.filter(g => g >= 80 && g < 90).length,
      'C': allGrades.filter(g => g >= 70 && g < 80).length,
      'D': allGrades.filter(g => g >= 60 && g < 70).length,
      'F': allGrades.filter(g => g < 60).length
    };

    // Missing assignments
    const missingCount = filteredGrades.reduce((total, student) => {
      if (!assignments || !Array.isArray(assignments)) return total;
      const missing = assignments.filter(a =>
        !student.grades || student.grades[a.id] === null || student.grades[a.id] === undefined
      ).length;
      return total + missing;
    }, 0);

    return { average, highest, lowest, distribution, missingCount };
  }, [filteredGrades, assignments, calculateWeightedGrade]);


  return (
    <MainLayout user={user} onLogout={logout} activeView="gradebook">
      <div className="gradebook-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading gradebook...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load gradebook</h3>
            <p>{error}</p>
            <button className="action-btn primary" onClick={() => {
              fetchGradebook();
              fetchClasses();
              fetchAssignments();
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
          <div className="header-content">
            <div>
              <h1 className="page-title">Gradebook</h1>
              <p className="page-subtitle">Manage grades and track student performance</p>
            </div>

            <div className="header-actions">
              <button className="action-btn secondary">
                <Upload size={18} />
                Import
              </button>
              <button className="action-btn secondary" onClick={handleExportGradebook}>
                <Download size={18} />
                Export
              </button>
              <button className="action-btn primary" onClick={() => setShowAddAssignment(true)}>
                <Plus size={18} />
                Add Assignment
              </button>
            </div>
          </div>
        </div>

        {/* Class Selector and Filters */}
        <div className="controls-section">
          <div className="controls-row">
            <div className="control-group">
              <label>Class</label>
              <select
                className="select-input"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Category</label>
              <select
                className="select-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {gradeCategories && Array.isArray(gradeCategories) && gradeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.weight}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group search-group">
              <label>Search Students</label>
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Class Average</span>
              <Calculator size={20} className="stat-icon" />
            </div>
            <div className="stat-value">{classStats.average.toFixed(1)}%</div>
            <div className="stat-footer">
              <span className="stat-badge success">
                {getLetterGrade(classStats.average)}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Highest Grade</span>
              <TrendingUp size={20} className="stat-icon" />
            </div>
            <div className="stat-value">{classStats.highest.toFixed(1)}%</div>
            <div className="stat-footer">
              <span className="stat-meta">{classStats.lowest.toFixed(1)}% lowest</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Missing Work</span>
              <AlertTriangle size={20} className="stat-icon warning" />
            </div>
            <div className="stat-value">{classStats.missingCount}</div>
            <div className="stat-footer">
              <span className="stat-meta">Assignments not submitted</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Grade Distribution</span>
              <Filter size={20} className="stat-icon" />
            </div>
            <div className="distribution-bars">
              {Object.entries(classStats.distribution).map(([grade, count]) => (
                <div key={grade} className="distribution-item">
                  <span className="grade-label">{grade}</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(count / filteredGrades.length) * 100}%`,
                        background: grade === 'A' ? '#10b981' :
                                   grade === 'B' ? '#3b82f6' :
                                   grade === 'C' ? '#f59e0b' :
                                   grade === 'D' ? '#f97316' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="count-label">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Weights */}
        {gradeCategories && Array.isArray(gradeCategories) && gradeCategories.length > 0 && (
          <div className="category-weights-card">
            <h3 className="section-title">Grade Categories & Weights</h3>
            <div className="category-grid">
              {gradeCategories.map(category => (
                <div key={category.id} className="category-item">
                  <div
                    className="category-color"
                    style={{ background: category.color }}
                  />
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-weight">{category.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gradebook Table */}
        <div className="gradebook-table-container">
          <div className="table-scroll">
            <table className="gradebook-table">
              <thead>
                <tr>
                  <th className="sticky-col student-col">Student</th>
                  {filteredAssignments.map(assignment => {
                    const category = gradeCategories.find(c => c.id === assignment.category);
                    return (
                      <th key={assignment.id} className="assignment-col">
                        <div className="assignment-header">
                          <div
                            className="category-indicator"
                            style={{ background: category?.color }}
                          />
                          <div className="assignment-info">
                            <span className="assignment-name">{assignment.name}</span>
                            <span className="assignment-points">{assignment.maxPoints} pts</span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="sticky-col-right total-col">
                    <div className="total-header">
                      <span>Total</span>
                      <span className="total-sub">Grade</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map(student => {
                  const weightedGrade = calculateWeightedGrade(student.grades);
                  const letterGrade = getLetterGrade(weightedGrade);
                  const gpa = getGPA(letterGrade);
                  const isExpanded = expandedStudent === student.studentId;

                  return (
                    <React.Fragment key={student.studentId}>
                      <tr className="student-row">
                        <td className="sticky-col student-cell">
                          <div className="student-info">
                            <button
                              className="expand-btn"
                              onClick={() => setExpandedStudent(isExpanded ? null : student.studentId)}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <div>
                              <div className="student-name">{student.studentName}</div>
                              <div className="student-number">{student.studentNumber}</div>
                            </div>
                          </div>
                        </td>
                        {filteredAssignments.map(assignment => {
                          const grade = student.grades[assignment.id];
                          const isEditing = editingCell === `${student.studentId}-${assignment.id}`;
                          const isMissing = grade === null || grade === undefined;
                          const percentage = isMissing ? 0 : (grade / assignment.maxPoints) * 100;

                          return (
                            <td
                              key={assignment.id}
                              className={`grade-cell ${isMissing ? 'missing' : ''}`}
                              onClick={() => setEditingCell(`${student.studentId}-${assignment.id}`)}
                            >
                              {isEditing ? (
                                <input
                                  type="number"
                                  className="grade-input"
                                  value={grade === null ? '' : grade}
                                  onChange={(e) => {
                                    // Update on change for immediate feedback, but save on blur
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value !== (grade === null ? '' : grade.toString())) {
                                      handleSetGrade(student.studentId, assignment.id, value || 0);
                                    } else {
                                      setEditingCell(null);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = e.target.value;
                                      handleSetGrade(student.studentId, assignment.id, value || 0);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  autoFocus
                                  min="0"
                                  max={assignment.maxPoints}
                                  step="0.5"
                                />
                              ) : (
                                <div className="grade-display">
                                  {isMissing ? (
                                    <span className="missing-indicator">-</span>
                                  ) : (
                                    <>
                                      <span className="grade-value">{grade}</span>
                                      <span className="grade-percentage">
                                        {percentage.toFixed(0)}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="sticky-col-right total-cell">
                          <div className="total-grade">
                            <span className="total-percentage">
                              {weightedGrade.toFixed(1)}%
                            </span>
                            <div className="grade-badges">
                              <span className={`letter-badge ${letterGrade === 'F' ? 'fail' : letterGrade.startsWith('A') ? 'excellent' : letterGrade.startsWith('B') ? 'good' : 'average'}`}>
                                {letterGrade}
                              </span>
                              <span className="gpa-badge">
                                {gpa.toFixed(1)} GPA
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-row">
                          <td colSpan={filteredAssignments.length + 2}>
                            <div className="expanded-content">
                              <div className="expanded-stats">
                                <div className="expanded-stat">
                                  <span className="expanded-label">Completed Assignments</span>
                                  <span className="expanded-value">
                                    {student.grades ? Object.values(student.grades).filter(g => g !== null && g !== undefined).length : 0} / {assignments?.length || 0}
                                  </span>
                                </div>
                                <div className="expanded-stat">
                                  <span className="expanded-label">Missing Assignments</span>
                                  <span className="expanded-value warning">
                                    {assignments && Array.isArray(assignments) && student.grades
                                      ? assignments.filter(a => student.grades[a.id] === null || student.grades[a.id] === undefined).length
                                      : 0
                                    }
                                  </span>
                                </div>
                                <div className="expanded-stat">
                                  <span className="expanded-label">Average Score</span>
                                  <span className="expanded-value">
                                    {weightedGrade.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>

      <style jsx>{`
        .gradebook-page {
          padding: var(--space-lg);
          max-width: 100%;
          background: var(--bg-primary);
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

        .header-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .action-btn.primary {
          background: var(--primary-green);
          color: white;
        }

        .action-btn.primary:hover {
          background: var(--primary-green-hover);
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: white;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        /* Controls */
        .controls-section {
          background: white;
          border-radius: 0.75rem;
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
          border: 1px solid var(--border-color);
        }

        .controls-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-md);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .control-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .select-input {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-input:hover {
          border-color: var(--primary-green);
        }

        .select-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .search-input-wrapper {
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
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        /* Statistics Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-icon {
          color: var(--primary-green);
        }

        .stat-icon.warning {
          color: #f59e0b;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .stat-footer {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .stat-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .stat-badge.success {
          background: #dcfce7;
          color: #16a34a;
        }

        .stat-meta {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .distribution-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .distribution-item {
          display: grid;
          grid-template-columns: 24px 1fr 32px;
          align-items: center;
          gap: var(--space-sm);
        }

        .grade-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .bar-container {
          height: 24px;
          background: #f1f5f9;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .count-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: right;
        }

        /* Category Weights */
        .category-weights-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-md) 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border-radius: 0.5rem;
        }

        .category-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .category-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .category-weight {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Gradebook Table */
        .gradebook-table-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .table-scroll {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 600px;
        }

        .gradebook-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.875rem;
        }

        .gradebook-table thead {
          position: sticky;
          top: 0;
          z-index: 10;
          background: white;
        }

        .gradebook-table th {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--border-color);
          font-weight: 600;
          color: var(--text-primary);
          text-align: left;
        }

        .sticky-col {
          position: sticky;
          left: 0;
          z-index: 15;
          background: var(--bg-secondary);
        }

        .sticky-col-right {
          position: sticky;
          right: 0;
          z-index: 15;
          background: var(--bg-secondary);
          box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
        }

        .student-col {
          min-width: 250px;
          max-width: 250px;
        }

        .assignment-col {
          min-width: 150px;
          max-width: 150px;
        }

        .total-col {
          min-width: 150px;
          max-width: 150px;
        }

        .assignment-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-xs);
        }

        .category-indicator {
          width: 4px;
          height: 100%;
          min-height: 40px;
          border-radius: 2px;
        }

        .assignment-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .assignment-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .assignment-points {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .total-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: center;
        }

        .total-sub {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-tertiary);
        }

        .gradebook-table tbody tr {
          background: white;
        }

        .gradebook-table tbody tr:hover {
          background: var(--bg-secondary);
        }

        .gradebook-table td {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-color);
        }

        .student-cell {
          position: sticky;
          left: 0;
          background: white;
          z-index: 5;
        }

        .student-row:hover .student-cell {
          background: var(--bg-secondary);
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .expand-btn {
          padding: 0.25rem;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .expand-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .student-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .student-number {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .grade-cell {
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .grade-cell:hover {
          background: var(--bg-secondary);
        }

        .grade-cell.missing {
          background: #fef2f2;
        }

        .grade-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .grade-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .grade-percentage {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .missing-indicator {
          color: var(--text-tertiary);
          font-size: 1.25rem;
        }

        .grade-input {
          width: 100%;
          padding: 0.5rem;
          border: 2px solid var(--primary-green);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          text-align: center;
          outline: none;
        }

        .total-cell {
          position: sticky;
          right: 0;
          background: white;
          z-index: 5;
        }

        .student-row:hover .total-cell {
          background: var(--bg-secondary);
        }

        .total-grade {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }

        .total-percentage {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .grade-badges {
          display: flex;
          gap: var(--space-xs);
        }

        .letter-badge,
        .gpa-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .letter-badge.excellent {
          background: #dcfce7;
          color: #16a34a;
        }

        .letter-badge.good {
          background: #dbeafe;
          color: #2563eb;
        }

        .letter-badge.average {
          background: #fef3c7;
          color: #d97706;
        }

        .letter-badge.fail {
          background: #fee2e2;
          color: #dc2626;
        }

        .gpa-badge {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        /* Expanded Row */
        .expanded-row {
          background: var(--bg-secondary) !important;
        }

        .expanded-content {
          padding: var(--space-md);
        }

        .expanded-stats {
          display: flex;
          gap: var(--space-xl);
        }

        .expanded-stat {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .expanded-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .expanded-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .expanded-value.warning {
          color: #f59e0b;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .controls-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .gradebook-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .table-scroll {
            max-height: 500px;
          }

          .expanded-stats {
            flex-direction: column;
            gap: var(--space-md);
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Gradebook;
