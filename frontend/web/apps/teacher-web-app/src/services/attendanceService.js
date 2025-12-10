// src/services/attendanceService.js
import { apiClient } from './apiClient';

const attendanceService = {
  /**
   * Get attendance records
   * @param {Object} filters - Filter options (classId, date, status)
   * @returns {Promise} List of attendance records
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/attendance', { params: filters });
    return response.data;
  },

  /**
   * Get enriched attendance data for a class (includes all students + attendance status)
   * This is the PRIMARY method for the attendance page
   * @param {string} classId - Class ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} Enriched attendance data with students and statistics
   */
  getEnrichedAttendance: async (classId, date) => {
    const response = await apiClient.get(`/attendance/class/${classId}/enriched`, {
      params: { date }
    });
    return response.data;
  },

  /**
   * Get attendance for a specific class on a specific date
   * @param {string} classId - Class ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise} Attendance records
   */
  getByClassAndDate: async (classId, date) => {
    const response = await apiClient.get(`/attendance/class/${classId}`, {
      params: { date }
    });
    return response.data;
  },

  /**
   * Mark attendance for a student
   * @param {Object} attendanceData - {classId, studentId, date, status, notes, time}
   * @returns {Promise} Created/updated attendance record
   */
  markAttendance: async (attendanceData) => {
    const response = await apiClient.post('/attendance/mark', attendanceData);
    return response.data;
  },

  /**
   * Bulk mark attendance
   * @param {Object} bulkData - {classId, date, records: [{studentId, status, notes, time}]}
   * @returns {Promise} Bulk attendance result
   */
  bulkMark: async (bulkData) => {
    const response = await apiClient.post('/attendance/bulk-mark', bulkData);
    return response.data;
  },

  /**
   * Quick mark all students with the same status
   * @param {string} classId - Class ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string} status - Status to mark all students (present/absent/late/excused)
   * @param {Array} studentIds - Array of student IDs to mark
   * @returns {Promise} Bulk attendance result
   */
  markAllStudents: async (classId, date, status, studentIds) => {
    const records = studentIds.map(studentId => ({
      studentId,
      status,
      time: status === 'present' ? new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    }));

    return attendanceService.bulkMark({
      classId,
      date,
      records
    });
  },

  /**
   * Update attendance record
   * @param {string} recordId - Attendance record ID
   * @param {Object} updateData - Updated attendance data
   * @returns {Promise} Updated attendance record
   */
  update: async (recordId, updateData) => {
    const response = await apiClient.put(`/attendance/${recordId}`, updateData);
    return response.data;
  },

  /**
   * Delete attendance record
   * @param {string} recordId - Attendance record ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (recordId) => {
    const response = await apiClient.delete(`/attendance/${recordId}`);
    return response.data;
  },

  /**
   * Get attendance statistics for a class
   * @param {string} classId - Class ID
   * @param {Object} params - {startDate, endDate}
   * @returns {Promise} Attendance statistics
   */
  getClassStatistics: async (classId, params = {}) => {
    const response = await apiClient.get(`/attendance/class/${classId}/statistics`, {
      params
    });
    return response.data;
  },

  /**
   * Get attendance statistics for a student
   * @param {string} studentId - Student ID
   * @param {Object} params - {startDate, endDate}
   * @returns {Promise} Student attendance statistics
   */
  getStudentStatistics: async (studentId, params = {}) => {
    const response = await apiClient.get(`/attendance/student/${studentId}/statistics`, {
      params
    });
    return response.data;
  },

  /**
   * Get attendance report
   * @param {Object} params - {classId, startDate, endDate, format}
   * @returns {Promise} Attendance report
   */
  getReport: async (params = {}) => {
    const response = await apiClient.get('/attendance/report', {
      params,
      responseType: params.format ? 'blob' : 'json'
    });
    return response.data;
  },

  /**
   * Export attendance data
   * @param {string} classId - Class ID
   * @param {Object} params - {startDate, endDate, format}
   * @returns {Promise} File download
   */
  export: async (classId, params = {}) => {
    const response = await apiClient.get(`/attendance/class/${classId}/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default attendanceService;
