// src/services/gradebookService.js
import { apiClient } from './apiClient';

const gradebookService = {
  /**
   * Get gradebook for a class
   * @param {string} classId - Class ID
   * @returns {Promise} Gradebook data
   */
  getByClass: async (classId) => {
    const response = await apiClient.get(`/gradebook/class/${classId}`);
    return response.data;
  },

  /**
   * Get student grades
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID (optional)
   * @returns {Promise} Student grades
   */
  getStudentGrades: async (studentId, classId = null) => {
    const params = classId ? { classId } : {};
    const response = await apiClient.get(`/gradebook/student/${studentId}`, { params });
    return response.data;
  },

  /**
   * Get grade categories for a class
   * @param {string} classId - Class ID
   * @returns {Promise} Grade categories with weights
   */
  getCategories: async (classId) => {
    const response = await apiClient.get(`/gradebook/class/${classId}/categories`);
    return response.data;
  },

  /**
   * Update grade categories
   * @param {string} classId - Class ID
   * @param {Array} categories - Array of categories with weights
   * @returns {Promise} Updated categories
   */
  updateCategories: async (classId, categories) => {
    const response = await apiClient.put(`/gradebook/class/${classId}/categories`, {
      categories
    });
    return response.data;
  },

  /**
   * Add or update a grade
   * @param {Object} gradeData - {studentId, assignmentId, grade, feedback}
   * @returns {Promise} Created/updated grade
   */
  setGrade: async (gradeData) => {
    const response = await apiClient.post('/gradebook/grades', gradeData);
    return response.data;
  },

  /**
   * Bulk update grades
   * @param {Array} grades - Array of grade objects
   * @returns {Promise} Bulk update result
   */
  bulkSetGrades: async (grades) => {
    const response = await apiClient.post('/gradebook/grades/bulk', { grades });
    return response.data;
  },

  /**
   * Calculate final grades
   * @param {string} classId - Class ID
   * @returns {Promise} Final grades for all students
   */
  calculateFinalGrades: async (classId) => {
    const response = await apiClient.get(`/gradebook/class/${classId}/final-grades`);
    return response.data;
  },

  /**
   * Get grade distribution
   * @param {string} classId - Class ID
   * @param {string} assignmentId - Assignment ID (optional)
   * @returns {Promise} Grade distribution data
   */
  getDistribution: async (classId, assignmentId = null) => {
    const params = assignmentId ? { assignmentId } : {};
    const response = await apiClient.get(`/gradebook/class/${classId}/distribution`, {
      params
    });
    return response.data;
  },

  /**
   * Get grade statistics
   * @param {string} classId - Class ID
   * @returns {Promise} Grade statistics (average, median, etc.)
   */
  getStatistics: async (classId) => {
    const response = await apiClient.get(`/gradebook/class/${classId}/statistics`);
    return response.data;
  },

  /**
   * Get grade trends over time
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID
   * @returns {Promise} Grade trends data
   */
  getStudentTrends: async (studentId, classId) => {
    const response = await apiClient.get(
      `/gradebook/student/${studentId}/class/${classId}/trends`
    );
    return response.data;
  },

  /**
   * Export gradebook
   * @param {string} classId - Class ID
   * @param {string} format - Export format (csv, pdf, xlsx)
   * @returns {Promise} File download
   */
  export: async (classId, format = 'csv') => {
    const response = await apiClient.get(`/gradebook/class/${classId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get missing assignments for a student
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID
   * @returns {Promise} List of missing assignments
   */
  getMissingAssignments: async (studentId, classId) => {
    const response = await apiClient.get(
      `/gradebook/student/${studentId}/class/${classId}/missing`
    );
    return response.data;
  }
};

export default gradebookService;
