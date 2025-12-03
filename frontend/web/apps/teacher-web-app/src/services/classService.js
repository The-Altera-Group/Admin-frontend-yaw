// src/services/classService.js
import { apiClient } from './apiClient';

const classService = {
  /**
   * Get all classes for the current teacher
   * @returns {Promise} List of classes
   */
  getAll: async () => {
    const response = await apiClient.get('/classes');
    return response.data;
  },

  /**
   * Get a single class by ID
   * @param {string} classId - Class ID
   * @returns {Promise} Class details
   */
  getById: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}`);
    return response.data;
  },

  /**
   * Create a new class
   * @param {Object} classData - Class information
   * @returns {Promise} Created class
   */
  create: async (classData) => {
    const response = await apiClient.post('/classes', classData);
    return response.data;
  },

  /**
   * Update an existing class
   * @param {string} classId - Class ID
   * @param {Object} classData - Updated class information
   * @returns {Promise} Updated class
   */
  update: async (classId, classData) => {
    const response = await apiClient.put(`/classes/${classId}`, classData);
    return response.data;
  },

  /**
   * Delete a class
   * @param {string} classId - Class ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (classId) => {
    const response = await apiClient.delete(`/classes/${classId}`);
    return response.data;
  },

  /**
   * Get students enrolled in a class
   * @param {string} classId - Class ID
   * @returns {Promise} List of students
   */
  getStudents: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/students`);
    return response.data;
  },

  /**
   * Add students to a class
   * @param {string} classId - Class ID
   * @param {Array} studentIds - Array of student IDs
   * @returns {Promise} Updated enrollment
   */
  addStudents: async (classId, studentIds) => {
    const response = await apiClient.post(`/classes/${classId}/students`, {
      studentIds
    });
    return response.data;
  },

  /**
   * Remove a student from a class
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Updated enrollment
   */
  removeStudent: async (classId, studentId) => {
    const response = await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  /**
   * Get class schedule
   * @param {string} classId - Class ID
   * @returns {Promise} Class schedule
   */
  getSchedule: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/schedule`);
    return response.data;
  },

  /**
   * Get class statistics
   * @param {string} classId - Class ID
   * @returns {Promise} Class statistics
   */
  getStatistics: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/statistics`);
    return response.data;
  },

  /**
   * Export class roster
   * @param {string} classId - Class ID
   * @param {string} format - Export format (csv, pdf)
   * @returns {Promise} File download
   */
  exportRoster: async (classId, format = 'csv') => {
    const response = await apiClient.get(`/classes/${classId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default classService;
