import { useState, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import assignmentService from '../services/assignmentService';
import classService from '../services/classService';
import { useApi } from '../hooks/useApi';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Users,
  BarChart2,
  X,
  Save,
  Loader,
  RefreshCw
} from 'lucide-react';

const Assignments = () => {
  const { user, logout } = useAuth();

  // State management
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);

  // API integration for assignments
  const {
    data: assignments,
    loading: loadingAssignments,
    error: assignmentsError,
    execute: fetchAssignments
  } = useApi(assignmentService.getAll, { immediate: true, initialData: [] });

  // API integration for classes
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  // Create/Edit form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    class: '',
    type: 'homework',
    points: 100,
    dueDate: '',
    dueTime: '23:59',
    assignedDate: new Date().toISOString().split('T')[0],
    instructions: '',
    attachments: [],
    allowLateSubmission: true,
    rubric: []
  });

  // Combined loading and error states
  const loading = loadingAssignments || loadingClasses;
  const error = assignmentsError || classesError;

  // Assignment types with colors
  const assignmentTypes = [
    { id: 'homework', name: 'Homework', color: '#3b82f6', icon: FileText },
    { id: 'quiz', name: 'Quiz', color: '#8b5cf6', icon: AlertCircle },
    { id: 'test', name: 'Test', color: '#ec4899', icon: FileText },
    { id: 'project', name: 'Project', color: '#10b981', icon: Users },
    { id: 'lab', name: 'Lab', color: '#f59e0b', icon: BarChart2 }
  ];

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) return [];
    let filtered = assignments;

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(a => a.class === selectedClass || a.classId === selectedClass);
    }

    // Filter by status
    if (selectedStatus === 'active') {
      filtered = filtered.filter(a => a.status === 'active');
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter(a => a.status === 'completed');
    } else if (selectedStatus === 'grading') {
      filtered = filtered.filter(a => (a.submissions || 0) > (a.graded || 0) && a.status === 'active');
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.className?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by due date
    return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [assignments, selectedClass, selectedStatus, searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!assignments || !Array.isArray(assignments)) {
      return { total: 0, active: 0, needGrading: 0, completionRate: 0 };
    }
    const activeAssignments = assignments.filter(a => a.status === 'active');
    const totalAssignments = assignments.length;
    const needGrading = activeAssignments.filter(a => (a.submissions || 0) > (a.graded || 0)).length;
    const completionRate = activeAssignments.length > 0
      ? (activeAssignments.reduce((sum, a) => sum + ((a.submissions || 0) / (a.totalStudents || 1)), 0) / activeAssignments.length) * 100
      : 0;

    return {
      total: totalAssignments,
      active: activeAssignments.length,
      needGrading,
      completionRate: completionRate.toFixed(0)
    };
  }, [assignments]);

  // CRUD Operation Handlers
  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentService.delete(assignmentId);
        fetchAssignments();
      } catch (err) {
        alert('Failed to delete assignment: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleCreateAssignment = async (formData) => {
    try {
      await assignmentService.create(formData);
      setShowCreateModal(false);
      setAssignmentForm({
        title: '',
        description: '',
        class: '',
        type: 'homework',
        points: 100,
        dueDate: '',
        dueTime: '23:59',
        assignedDate: new Date().toISOString().split('T')[0],
        instructions: '',
        attachments: [],
        allowLateSubmission: true,
        rubric: []
      });
      fetchAssignments();
    } catch (err) {
      alert('Failed to create assignment: ' + (err.message || 'Unknown error'));
    }
  };

  // Get submission status
  const getSubmissionStatus = (assignment) => {
    const submissions = assignment.submissions || 0;
    const total = assignment.totalStudents || 1;
    const percentage = (submissions / total) * 100;
    if (percentage === 100) return { label: 'Complete', color: '#10b981' };
    if (percentage >= 75) return { label: 'Most Submitted', color: '#3b82f6' };
    if (percentage >= 50) return { label: 'Half Submitted', color: '#f59e0b' };
    return { label: 'Few Submitted', color: '#ef4444' };
  };

  // Get grading status
  const getGradingStatus = (assignment) => {
    if (assignment.graded === assignment.submissions) {
      return { label: 'Graded', color: '#10b981', icon: CheckCircle };
    }
    if (assignment.graded > 0) {
      return { label: 'In Progress', color: '#f59e0b', icon: Clock };
    }
    return { label: 'Not Graded', color: '#ef4444', icon: AlertCircle };
  };

  // Check if assignment is overdue
  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get days until due
  const getDaysUntil = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainLayout user={user} onLogout={logout} activeView="assignments">
      <div className="assignments-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading assignments...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load assignments</h3>
            <p>{error}</p>
            <button className="create-btn" onClick={() => {
              fetchAssignments();
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
          <div className="header-content">
            <div>
              <h1 className="page-title">Assignments</h1>
              <p className="page-subtitle">Create and manage class assignments</p>
            </div>

            <button className="create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Assignment
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Assignments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.active}</div>
              <div className="stat-label">Active Assignments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.needGrading}</div>
              <div className="stat-label">Need Grading</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <BarChart2 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.completionRate}%</div>
              <div className="stat-label">Avg Completion</div>
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
                placeholder="Search assignments..."
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
              {classes && Array.isArray(classes) && classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="grading">Needs Grading</option>
            </select>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Grid/List */}
        <div className={`assignments-container ${viewMode}`}>
          {filteredAssignments.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} className="empty-icon" />
              <p className="empty-title">No assignments found</p>
              <p className="empty-subtitle">
                {searchTerm ? 'Try a different search term' : 'Create your first assignment to get started'}
              </p>
              <button className="create-btn-empty" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
                Create Assignment
              </button>
            </div>
          ) : (
            filteredAssignments.map(assignment => {
              const typeInfo = assignmentTypes.find(t => t.id === assignment.type);
              const TypeIcon = typeInfo?.icon || FileText;
              const submissionStatus = getSubmissionStatus(assignment);
              const gradingStatus = getGradingStatus(assignment);
              const GradingIcon = gradingStatus.icon;
              const overdue = isOverdue(assignment.dueDate, assignment.status);
              const daysUntil = getDaysUntil(assignment.dueDate);

              return (
                <div key={assignment.id} className="assignment-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div
                      className="type-badge"
                      style={{ background: typeInfo?.color + '20', color: typeInfo?.color }}
                    >
                      <TypeIcon size={14} />
                      {typeInfo?.name}
                    </div>

                    <div className="card-actions">
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmissions(true);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <h3 className="assignment-title">{assignment.title}</h3>
                    <p className="assignment-description">{assignment.description}</p>

                    <div className="assignment-meta">
                      <div className="meta-item">
                        <Users size={14} />
                        <span>{assignment.className}</span>
                      </div>
                      <div className="meta-item">
                        <BarChart2 size={14} />
                        <span>{assignment.points} points</span>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className={`due-date-box ${overdue ? 'overdue' : ''}`}>
                      <Calendar size={14} />
                      <span>
                        {overdue ? 'Overdue: ' : 'Due: '}
                        {formatDate(assignment.dueDate)}
                        {!overdue && daysUntil >= 0 && (
                          <span className="days-until">
                            {daysUntil === 0 ? ' (Today)' : daysUntil === 1 ? ' (Tomorrow)' : ` (${daysUntil} days)`}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Submissions</span>
                        <span className="progress-value">
                          {assignment.submissions}/{assignment.totalStudents}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(assignment.submissions / assignment.totalStudents) * 100}%`,
                            background: submissionStatus.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="status-badges">
                      <div
                        className="status-badge"
                        style={{ background: submissionStatus.color + '20', color: submissionStatus.color }}
                      >
                        {submissionStatus.label}
                      </div>
                      <div
                        className="status-badge"
                        style={{ background: gradingStatus.color + '20', color: gradingStatus.color }}
                      >
                        <GradingIcon size={12} />
                        {gradingStatus.label}
                      </div>
                    </div>

                    {/* Average Grade */}
                    {assignment.graded > 0 && (
                      <div className="average-grade">
                        <span className="average-label">Average Grade:</span>
                        <span className="average-value">{assignment.averageGrade}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Assignment</h2>
                <button className="close-modal-btn" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label>Assignment Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter assignment title..."
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brief description..."
                      rows="2"
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="form-field">
                    <label>Class *</label>
                    <select
                      className="form-select"
                      value={assignmentForm.class}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, class: e.target.value }))}
                    >
                      <option value="">Select class...</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Type</label>
                    <select
                      className="form-select"
                      value={assignmentForm.type}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      {assignmentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Points</label>
                    <input
                      type="number"
                      className="form-input"
                      value={assignmentForm.points}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                      min="0"
                    />
                  </div>

                  <div className="form-field">
                    <label>Due Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>

                  <div className="form-field">
                    <label>Due Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={assignmentForm.dueTime}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueTime: e.target.value }))}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Instructions</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Detailed instructions for students..."
                      rows="4"
                      value={assignmentForm.instructions}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>

                  <div className="form-field full-width checkbox-field">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={assignmentForm.allowLateSubmission}
                        onChange={(e) => setAssignmentForm(prev => ({ ...prev, allowLateSubmission: e.target.checked }))}
                      />
                      <span>Allow late submissions</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleCreateAssignment}>
                  <Save size={18} />
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <style jsx>{`
        .assignments-page {
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
          font-size: 1rem;
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

        .create-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-btn:hover {
          background: var(--primary-green-hover);
          transform: translateY(-1px);
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
        .stat-icon-wrapper.orange { background: #f59e0b; }
        .stat-icon-wrapper.purple { background: #8b5cf6; }

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

        .view-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          padding: 4px;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: white;
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Assignments Container */
        .assignments-container {
          display: grid;
          gap: var(--space-lg);
        }

        .assignments-container.grid {
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        }

        .assignments-container.list {
          grid-template-columns: 1fr;
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
          margin: 0 0 var(--space-lg) 0;
        }

        .create-btn-empty {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-btn-empty:hover {
          background: var(--primary-green-hover);
        }

        /* Assignment Card */
        .assignment-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          transition: all 0.2s ease;
        }

        .assignment-card:hover {
          border-color: var(--primary-green);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .type-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: var(--space-xs);
        }

        .icon-btn {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .icon-btn.delete:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #ef4444;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .assignment-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .assignment-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .assignment-meta {
          display: flex;
          gap: var(--space-md);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .due-date-box {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.625rem;
          background: #dbeafe;
          border-left: 3px solid #3b82f6;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e40af;
        }

        .due-date-box.overdue {
          background: #fee2e2;
          border-color: #ef4444;
          color: #991b1b;
        }

        .days-until {
          font-weight: 400;
          opacity: 0.8;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .progress-label {
          color: var(--text-secondary);
        }

        .progress-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-bar {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .status-badges {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .average-grade {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-sm);
          border-top: 1px solid var(--border-color);
          font-size: 0.875rem;
        }

        .average-label {
          color: var(--text-secondary);
        }

        .average-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary-green);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal-content {
          background: white;
          border-radius: 0.75rem;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-modal-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .checkbox-field {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-sm);
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .cancel-btn:hover {
          background: var(--bg-secondary);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          background: var(--primary-green);
          border: none;
          color: white;
        }

        .submit-btn:hover {
          background: var(--primary-green-hover);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .assignments-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .assignments-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .create-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-row {
            flex-direction: column;
          }

          .search-box,
          .filter-select,
          .view-toggle {
            width: 100%;
          }

          .assignments-container.grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Assignments;
