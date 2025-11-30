import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [state, setState] = useState({
    stats: null,
    recentActivity: null,
    upcomingClasses: null,
    gradeDistribution: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        dashboardData,
        upcomingClasses,
        recentActivity,
        gradeDistribution
      ] = await Promise.all([
        dashboardService.getDashboardData(),
        dashboardService.getUpcomingClasses(),
        dashboardService.getRecentActivity(),
        dashboardService.getGradeDistribution()
      ]);

      setState({
        stats: dashboardData.stats,
        recentActivity,
        upcomingClasses,
        gradeDistribution,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Dashboard hook error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) {
        fetchDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData, state.loading]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats: state.stats,
    recentActivity: state.recentActivity,
    upcomingClasses: state.upcomingClasses,
    gradeDistribution: state.gradeDistribution,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refetch
  };
};