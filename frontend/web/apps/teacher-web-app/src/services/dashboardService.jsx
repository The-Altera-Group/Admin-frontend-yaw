import { apiClient } from './apiClient';

class DashboardService {
  async getDashboardData() {
    try {
      const response = await apiClient.get('/teacher/dashboard');
      return this.transformDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw new Error(error.message || 'Failed to load dashboard data');
    }
  }

  async getUpcomingClasses() {
    try {
      const response = await apiClient.get('/teacher/classes/upcoming');
      return response.data.classes || [];
    } catch (error) {
      console.error('Upcoming classes service error:', error);
      throw new Error(error.message || 'Failed to load upcoming classes');
    }
  }

  async getRecentActivity() {
    try {
      const response = await apiClient.get('/teacher/activity/recent');
      return response.data.activities || [];
    } catch (error) {
      console.error('Recent activity service error:', error);
      throw new Error(error.message || 'Failed to load recent activity');
    }
  }

  async getGradeDistribution() {
    try {
      const response = await apiClient.get('/teacher/grades/distribution');
      return this.transformGradeData(response.data);
    } catch (error) {
      console.error('Grade distribution service error:', error);
      throw new Error(error.message || 'Failed to load grade distribution');
    }
  }

  async getQuickStats() {
    try {
      const response = await apiClient.get('/teacher/stats/quick');
      return response.data;
    } catch (error) {
      console.error('Quick stats service error:', error);
      throw new Error(error.message || 'Failed to load statistics');
    }
  }

  transformDashboardData(apiData) {
    if (!apiData) {
      throw new Error('Invalid dashboard data received');
    }

    return {
      stats: {
        totalStudents: apiData.totalStudents || 0,
        activeClasses: apiData.activeClasses || 0,
        assignmentsDue: apiData.pendingAssignments || 0,
        averageGrade: apiData.averageGrade || 0,
        attendanceRate: apiData.attendanceRate || 0,
      },
      recentActivity: apiData.recentActivities || [],
      upcomingClasses: apiData.upcomingClasses || [],
      gradeDistribution: apiData.gradeDistribution || [],
    };
  }

  transformGradeData(gradeData) {
    if (!gradeData || !Array.isArray(gradeData.distribution)) {
      return [];
    }

    return gradeData.distribution.map(item => ({
      grade: item.letterGrade,
      count: item.studentCount,
      percentage: item.percentage,
      color: this.getGradeColor(item.letterGrade)
    }));
  }

  getGradeColor(grade) {
    const colorMap = {
      'A': '#10b981',
      'B': '#3b82f6',
      'C': '#f59e0b',
      'D': '#ef4444',
      'F': '#dc2626'
    };
    return colorMap[grade] || '#6b7280';
  }
}

export const dashboardService = new DashboardService();