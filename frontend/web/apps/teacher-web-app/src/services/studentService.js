// src/services/studentService.js
import { apiClient } from './apiClient';

const studentService = {
  /**
   * Get all students (with optional filters)
   * @param {Object} filters - Filter options (classId, grade, status)
   * @returns {Promise} List of students
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/students', { params: filters });
    return response.data;
  },

  /**
   * Get a single student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Student details
   */
  getById: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}`);
    return response.data;
  },

  /**
   * Create a new student record
   * @param {Object} studentData - Student information
   * @returns {Promise} Created student
   */
  create: async (studentData) => {
    const response = await apiClient.post('/students', studentData);
    return response.data;
  },

  /**
   * Update student information
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student information
   * @returns {Promise} Updated student
   */
  update: async (studentId, studentData) => {
    const response = await apiClient.put(`/students/${studentId}`, studentData);
    return response.data;
  },

  /**
   * Delete a student record
   * @param {string} studentId - Student ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (studentId) => {
    const response = await apiClient.delete(`/students/${studentId}`);
    return response.data;
  },

  /**
   * Get student academic performance
   * @param {string} studentId - Student ID
   * @returns {Promise} Performance data
   */
  getPerformance: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}/performance`);
    return response.data;
  },

  /**
   * Get student attendance history
   * @param {string} studentId - Student ID
   * @param {Object} params - {startDate, endDate}
   * @returns {Promise} Attendance history
   */
  getAttendanceHistory: async (studentId, params = {}) => {
    const response = await apiClient.get(`/students/${studentId}/attendance`, { params });
    return response.data;
  },

  /**
   * Get student grades
   * @param {string} studentId - Student ID
   * @param {string} classId - Class ID (optional)
   * @returns {Promise} Student grades
   */
  getGrades: async (studentId, classId = null) => {
    const params = classId ? { classId } : {};
    const response = await apiClient.get(`/students/${studentId}/grades`, { params });
    return response.data;
  },

  /**
   * Get student assignments
   * @param {string} studentId - Student ID
   * @param {Object} filters - {classId, status}
   * @returns {Promise} Student assignments
   */
  getAssignments: async (studentId, filters = {}) => {
    const response = await apiClient.get(`/students/${studentId}/assignments`, {
      params: filters
    });
    return response.data;
  },

  /**
   * Get parent/guardian information
   * @param {string} studentId - Student ID
   * @returns {Promise} Parent information
   */
  getParentInfo: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}/parents`);
    return response.data;
  },

  /**
   * Update parent/guardian information
   * @param {string} studentId - Student ID
   * @param {Object} parentData - Parent information
   * @returns {Promise} Updated parent information
   */
  updateParentInfo: async (studentId, parentData) => {
    const response = await apiClient.put(`/students/${studentId}/parents`, parentData);
    return response.data;
  },

  /**
   * Get student notes
   * @param {string} studentId - Student ID
   * @returns {Promise} List of notes
   */
  getNotes: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}/notes`);
    return response.data;
  },

  /**
   * Add a note for a student
   * @param {string} studentId - Student ID
   * @param {Object} noteData - {text, type, date}
   * @returns {Promise} Created note
   */
  addNote: async (studentId, noteData) => {
    const response = await apiClient.post(`/students/${studentId}/notes`, noteData);
    return response.data;
  },

  /**
   * Update a note
   * @param {string} studentId - Student ID
   * @param {string} noteId - Note ID
   * @param {Object} noteData - Updated note data
   * @returns {Promise} Updated note
   */
  updateNote: async (studentId, noteId, noteData) => {
    const response = await apiClient.put(`/students/${studentId}/notes/${noteId}`, noteData);
    return response.data;
  },

  /**
   * Delete a note
   * @param {string} studentId - Student ID
   * @param {string} noteId - Note ID
   * @returns {Promise} Deletion confirmation
   */
  deleteNote: async (studentId, noteId) => {
    const response = await apiClient.delete(`/students/${studentId}/notes/${noteId}`);
    return response.data;
  },

  /**
   * Get student statistics
   * @param {string} studentId - Student ID
   * @returns {Promise} Student statistics
   */
  getStatistics: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}/statistics`);
    return response.data;
  },

  /**
   * Export student profile
   * @param {string} studentId - Student ID
   * @param {string} format - Export format (pdf, csv)
   * @returns {Promise} File download
   */
  export: async (studentId, format = 'pdf') => {
    const response = await apiClient.get(`/students/${studentId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Search students
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  search: async (query, filters = {}) => {
    const response = await apiClient.get('/students/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  }
};

export default studentService;
