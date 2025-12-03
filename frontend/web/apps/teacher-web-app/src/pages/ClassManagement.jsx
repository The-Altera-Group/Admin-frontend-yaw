import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import classService from '../services/classService';
import { useApi } from '../hooks/useApi';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  BookOpen,
  TrendingUp,
  Calendar,
  Mail,
  AlertCircle,
  RefreshCw,
  Loader
} from 'lucide-react';

const ClassManagement = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterBy, setFilterBy] = useState('all');

  // API integration - Replace mock data with real API calls
  const {
    data: classes,
    loading,
    error,
    execute: fetchClasses
  } = useApi(classService.getAll, { immediate: true, initialData: [] });

  const filteredClasses = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return [];
    return classes.filter(cls => {
      const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || cls.status === filterBy;
      return matchesSearch && matchesFilter;
    });
  }, [classes, searchTerm, filterBy]);

  const totalStudents = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return 0;
    return classes.reduce((sum, cls) => sum + (cls.students || 0), 0);
  }, [classes]);

  const activeClasses = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return 0;
    return classes.filter(cls => cls.status === 'active').length;
  }, [classes]);

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(classId);
        // Refresh the classes list after deletion
        fetchClasses();
      } catch (err) {
        alert('Failed to delete class: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await classService.exportAll({ format: 'csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `classes-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export classes: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <MainLayout user={user} onLogout={logout} activeView="classes">
      <div className="class-management-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading classes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load classes</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => fetchClasses()}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Class Management</h1>
              <p className="page-subtitle">Manage your classes, students, and schedules</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              Add New Class
            </button>
          </div>

          {/* Stats Overview */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{classes.length}</span>
                <span className="stat-label">Total Classes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
                <Users size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{totalStudents}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{activeClasses}</span>
                <span className="stat-label">Active Classes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">Fall 2024</span>
                <span className="stat-label">Current Semester</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search classes by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button
              className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
              onClick={() => setFilterBy('all')}
            >
              All Classes
            </button>
            <button
              className={`filter-btn ${filterBy === 'active' ? 'active' : ''}`}
              onClick={() => setFilterBy('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filterBy === 'archived' ? 'active' : ''}`}
              onClick={() => setFilterBy('archived')}
            >
              Archived
            </button>
          </div>

          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Classes Grid */}
        <div className="classes-grid">
          {filteredClasses.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-header" style={{ borderLeftColor: classItem.color }}>
                <div className="class-info">
                  <h3 className="class-name">{classItem.name}</h3>
                  <span className="class-code">{classItem.code}</span>
                </div>
                <div className="class-actions">
                  <button className="action-btn" title="View Details">
                    <Eye size={18} />
                  </button>
                  <button className="action-btn" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button
                    className="action-btn danger"
                    title="Delete"
                    onClick={() => handleDeleteClass(classItem.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="class-body">
                <div className="class-detail">
                  <div className="detail-icon">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="detail-label">Period</span>
                    <span className="detail-value">{classItem.period}</span>
                  </div>
                </div>

                <div className="class-detail">
                  <div className="detail-icon">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="detail-label">Room</span>
                    <span className="detail-value">{classItem.room}</span>
                  </div>
                </div>

                <div className="class-detail">
                  <div className="detail-icon">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="detail-label">Students</span>
                    <span className="detail-value">{classItem.students}</span>
                  </div>
                </div>

                <div className="class-schedule">
                  <span className="schedule-label">Schedule:</span>
                  <span className="schedule-value">{classItem.schedule}</span>
                </div>
              </div>

              <div className="class-footer">
                <button className="class-btn">
                  <Mail size={16} />
                  Email Class
                </button>
                <button className="class-btn primary">
                  <Eye size={16} />
                  View Roster
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="empty-state">
            <BookOpen size={64} color="var(--text-muted)" />
            <h3>No classes found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
          </>
        )}
      </div>

      <style jsx>{`
        .class-management-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

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
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
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

        .error-state .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .header-content {
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
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
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
          border-color: var(--primary-green);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
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

        .toolbar {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: none;
          color: var(--text-primary);
          font-size: 0.9375rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: var(--text-muted);
        }

        .filter-group {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-tertiary);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: var(--bg-hover);
        }

        .filter-btn.active {
          background: var(--primary-green);
          color: white;
        }

        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .class-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }

        .class-card:hover {
          border-color: var(--primary-green);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .class-header {
          padding: 1.25rem;
          border-left: 4px solid;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: var(--bg-tertiary);
        }

        .class-info h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .class-code {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .class-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--bg-hover);
          color: var(--primary-green);
        }

        .action-btn.danger:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .class-body {
          padding: 1.25rem;
        }

        .class-detail {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.875rem;
        }

        .detail-icon {
          width: 36px;
          height: 36px;
          background: var(--bg-tertiary);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .detail-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          display: block;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .class-schedule {
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 0.5rem;
          margin-top: 0.75rem;
        }

        .schedule-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.25rem;
        }

        .schedule-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .class-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 0.75rem;
        }

        .class-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .class-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .class-btn.primary {
          background: var(--primary-green);
          color: white;
          border-color: var(--primary-green);
        }

        .class-btn.primary:hover {
          background: var(--primary-green-dark);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 1rem 0 0.5rem;
        }

        .empty-state p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .class-management-page {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-primary {
            width: 100%;
            justify-content: center;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .filter-group {
            width: 100%;
            justify-content: space-between;
          }

          .classes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default React.memo(ClassManagement);
