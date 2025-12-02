// src/services/assignmentService.js
import { apiClient } from './apiClient';

const assignmentService = {
  /**
   * Get all assignments for the current teacher
   * @param {Object} filters - Filter options (classId, type, status)
   * @returns {Promise} List of assignments
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/assignments', { params: filters });
    return response.data;
  },

  /**
   * Get a single assignment by ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise} Assignment details
   */
  getById: async (assignmentId) => {
    const response = await apiClient.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Create a new assignment
   * @param {Object} assignmentData - Assignment information
   * @returns {Promise} Created assignment
   */
  create: async (assignmentData) => {
    const response = await apiClient.post('/assignments', assignmentData);
    return response.data;
  },

  /**
   * Update an existing assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment information
   * @returns {Promise} Updated assignment
   */
  update: async (assignmentId, assignmentData) => {
    const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },

  /**
   * Delete an assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (assignmentId) => {
    const response = await apiClient.delete(`/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Get submissions for an assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise} List of submissions
   */
  getSubmissions: async (assignmentId) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  /**
   * Get a specific submission
   * @param {string} assignmentId - Assignment ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Submission details
   */
  getSubmission: async (assignmentId, studentId) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions/${studentId}`);
    return response.data;
  },

  /**
   * Grade a submission
   * @param {string} assignmentId - Assignment ID
   * @param {string} studentId - Student ID
   * @param {Object} gradeData - Grade and feedback
   * @returns {Promise} Updated submission
   */
  gradeSubmission: async (assignmentId, studentId, gradeData) => {
    const response = await apiClient.put(
      `/assignments/${assignmentId}/submissions/${studentId}/grade`,
      gradeData
    );
    return response.data;
  },

  /**
   * Upload assignment file/attachment
   * @param {string} assignmentId - Assignment ID
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload result
   */
  uploadFile: async (assignmentId, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/assignments/${assignmentId}/files`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      }
    );
    return response.data;
  },

  /**
   * Download assignment file
   * @param {string} assignmentId - Assignment ID
   * @param {string} fileId - File ID
   * @returns {Promise} File download
   */
  downloadFile: async (assignmentId, fileId) => {
    const response = await apiClient.get(
      `/assignments/${assignmentId}/files/${fileId}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get assignment statistics
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise} Assignment statistics
   */
  getStatistics: async (assignmentId) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/statistics`);
    return response.data;
  },

  /**
   * Bulk grade submissions
   * @param {string} assignmentId - Assignment ID
   * @param {Array} grades - Array of {studentId, grade, feedback}
   * @returns {Promise} Bulk grade result
   */
  bulkGrade: async (assignmentId, grades) => {
    const response = await apiClient.post(`/assignments/${assignmentId}/bulk-grade`, {
      grades
    });
    return response.data;
  },

  /**
   * Export assignment data
   * @param {string} assignmentId - Assignment ID
   * @param {string} format - Export format (csv, pdf)
   * @returns {Promise} File download
   */
  export: async (assignmentId, format = 'csv') => {
    const response = await apiClient.get(`/assignments/${assignmentId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default assignmentService;
