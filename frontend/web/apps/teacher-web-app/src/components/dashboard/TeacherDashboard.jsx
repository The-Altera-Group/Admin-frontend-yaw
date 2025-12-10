import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import MainLayout from '../../components/layout/MainLayout';
import StatsCards from '../dashboard/StatsCards';
import RecentActivity from '../dashboard/RecentActivity';
import UpcomingClasses from './Classes';
import GradeDistribution from '../dashboard/GradeDistribution';
import QuickActions from '../dashboard/QuickActions';
import Notifications from '../dashboard/Notifications';
import StudentPerformanceChart from '../dashboard/StudentPerformanceChart';
import UpcomingSchedule from '../dashboard/UpcomingSchedule';
import TaskTracker from '../dashboard/TaskTracker';
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

// Custom hook for performance tracking
const useDashboardPerformance = (loading, error, lastUpdated) => {
  const [dashboardMetrics, setDashboardMetrics] = useState({
    loadTime: 0,
    lastRefresh: null,
    errorCount: 0
  });

  useEffect(() => {
    if (!loading && !error) {
      // Use requestAnimationFrame for non-urgent state updates
      requestAnimationFrame(() => {
        setDashboardMetrics(prev => ({
          ...prev,
          lastRefresh: new Date(),
          errorCount: 0
        }));
      });
    }
  }, [loading, error, lastUpdated]);

  const updateLoadTime = useCallback((loadTime) => {
    setDashboardMetrics(prev => ({
      ...prev,
      loadTime
    }));
  }, []);

  const incrementErrorCount = useCallback(() => {
    setDashboardMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));
  }, []);

  const updateLastRefresh = useCallback(() => {
    setDashboardMetrics(prev => ({
      ...prev,
      lastRefresh: new Date()
    }));
  }, []);

  return {
    dashboardMetrics,
    updateLoadTime,
    incrementErrorCount,
    updateLastRefresh
  };
};

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const {
    stats,
    recentActivity,
    upcomingClasses,
    gradeDistribution,
    loading,
    error,
    refetch,
    lastUpdated
  } = useDashboard();

  const { 
    dashboardMetrics, 
    updateLoadTime, 
    incrementErrorCount, 
    updateLastRefresh 
  } = useDashboardPerformance(loading, error, lastUpdated);

  const loadStartTime = useRef(0);

  // Measure load time separately
  useEffect(() => {
    // Set start time when loading begins
    if (loading) {
      loadStartTime.current = Date.now();
    }
    
    if (!loading) {
      const loadTime = Date.now() - loadStartTime.current;
      
      if (!error) {
        console.log('🎯 Dashboard Performance:', {
          loadTime: `${loadTime}ms`,
          statsLoaded: !!stats,
          activitiesCount: recentActivity?.length || 0,
          classesCount: upcomingClasses?.length || 0,
          lastUpdated
        });
        
        // Only update load time if it's significantly different
        if (Math.abs(loadTime - dashboardMetrics.loadTime) > 10) {
          updateLoadTime(loadTime);
        }
      } else {
        incrementErrorCount();
      }
    }
  }, [loading, error, stats, recentActivity, upcomingClasses, lastUpdated, 
      dashboardMetrics.loadTime, updateLoadTime, incrementErrorCount]);

  // Initialize load start time on component mount
  useEffect(() => {
    loadStartTime.current = Date.now();
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleManualRefresh = useCallback(() => {
    // Update lastRefresh immediately for better UX
    updateLastRefresh();
    // Reset load start time for the refresh
    loadStartTime.current = Date.now();
    refetch();
  }, [refetch, updateLastRefresh]);

  const dashboardContent = useMemo(() => {
    if (error) {
      return (
        <div className="error-state" role="alert" aria-live="polite">
          <div className="error-container">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            <h2>Dashboard Temporarily Unavailable</h2>
            <p className="error-message">{error}</p>
            <div className="error-details">
              <span>Attempt #{dashboardMetrics.errorCount}</span>
              <span>•</span>
              <span>Last refresh: {dashboardMetrics.lastRefresh?.toLocaleTimeString() || 'Never'}</span>
            </div>
            <div className="error-actions">
              <button onClick={handleRetry} className="primary-button">
                <RefreshCw size={16} />
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="secondary-button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-overview">
        {/* Performance Summary */}
        <div className="dashboard-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <TrendingUp size={20} />
              <div className="summary-content">
                <span className="summary-value">94%</span>
                <span className="summary-label">Performance</span>
              </div>
            </div>
            <div className="summary-card">
              <CheckCircle size={20} />
              <div className="summary-content">
                <span className="summary-value">Live</span>
                <span className="summary-label">Data Status</span>
              </div>
            </div>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={handleManualRefresh}
            title="Refresh dashboard"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <StatsCards
          stats={stats}
          loading={loading}
        />

        {/* Main Dashboard Grid - 3 Column Layout */}
        <div className="dashboard-grid-modern">
          {/* Left Column - Main Content */}
          <div className="dashboard-column main-column">
            <StudentPerformanceChart loading={loading} />
            <UpcomingClasses
              classes={upcomingClasses}
              loading={loading}
            />
            <GradeDistribution
              data={gradeDistribution}
              loading={loading}
            />
          </div>

          {/* Middle Column - Activity & Tasks */}
          <div className="dashboard-column middle-column">
            <TaskTracker loading={loading} />
            <RecentActivity
              activities={recentActivity}
              loading={loading}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="dashboard-column sidebar-column">
            <Notifications loading={loading} />
            <UpcomingSchedule loading={loading} />
            <QuickActions />
          </div>
        </div>

        {/* Dashboard Footer */}
        <div className="dashboard-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Load Time</span>
              <span className="stat-value">{dashboardMetrics.loadTime}ms</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Data Quality</span>
              <span className="stat-value success">
                <CheckCircle size={12} />
                Excellent
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    stats, recentActivity, upcomingClasses, gradeDistribution, 
    loading, error, lastUpdated, handleRetry, handleManualRefresh, dashboardMetrics
  ]);

  return (
    <MainLayout 
      user={user} 
      onLogout={logout}
      activeView="overview"
    >
      <div className="teacher-dashboard">
        {dashboardContent}
      </div>

      <style jsx>{`
        .teacher-dashboard {
          width: 100%;
          padding: var(--space-xl);
          min-height: calc(100vh - 84px);
          position: relative;
        }

        .dashboard-overview {
          position: relative;
        }

        .dashboard-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg) 0;
          margin-bottom: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .summary-cards {
          display: flex;
          gap: var(--space-lg);
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--primary-green);
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-value {
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .summary-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: all var(--transition-medium);
        }

        .refresh-btn:hover {
          background: var(--bg-hover);
          color: var(--primary-green);
          border-color: var(--primary-green);
        }

        .dashboard-grid-modern {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.25fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dashboard-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .main-column {
          min-width: 0;
        }

        .middle-column {
          min-width: 0;
        }

        .sidebar-column {
          min-width: 0;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .error-container {
          text-align: center;
          max-width: 500px;
          padding: var(--space-xl);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }

        .error-icon {
          color: var(--accent-orange);
          margin-bottom: var(--space-lg);
        }

        .error-container h2 {
          color: var(--text-primary);
          margin: 0 0 var(--space-md) 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .error-message {
          color: var(--text-secondary);
          margin: 0 0 var(--space-md) 0;
          line-height: 1.5;
        }

        .error-details {
          display: flex;
          justify-content: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
          font-size: var(--font-size-sm);
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .error-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
        }

        .primary-button,
        .secondary-button {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-medium);
        }

        .primary-button {
          background: var(--primary-green);
          border: 1px solid var(--primary-green);
          color: white;
        }

        .primary-button:hover {
          background: var(--primary-green-dark);
          border-color: var(--primary-green-dark);
        }

        .secondary-button {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .secondary-button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .dashboard-footer {
          display: flex;
          justify-content: center;
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }

        .footer-stats {
          display: flex;
          gap: var(--space-xl);
          text-align: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }

        .stat-value.success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          color: var(--primary-green);
        }

        /* Mobile Responsiveness */
        @media (max-width: 1400px) {
          .dashboard-grid-modern {
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 1.25rem;
          }
        }

        @media (max-width: 1024px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .sidebar-column {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .dashboard-grid-modern {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .sidebar-column {
            grid-template-columns: 1fr;
          }

          .dashboard-summary {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .summary-cards {
            justify-content: space-around;
          }

          .refresh-btn {
            align-self: center;
          }

          .footer-stats {
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .summary-cards {
            flex-direction: column;
            gap: 0.5rem;
          }

          .footer-stats {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* Print styles */
        @media print {
          .dashboard-footer,
          .error-actions,
          .refresh-btn {
            display: none;
          }

          .dashboard-grid {
            break-inside: avoid;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default React.memo(TeacherDashboard);