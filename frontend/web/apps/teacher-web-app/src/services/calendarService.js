// src/services/calendarService.js
import { apiClient } from './apiClient';

const calendarService = {
  /**
   * Get all events
   * @param {Object} filters - Filter options (startDate, endDate, type)
   * @returns {Promise} List of events
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/calendar/events', { params: filters });
    return response.data;
  },

  /**
   * Get events for a specific date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} List of events in range
   */
  getByDateRange: async (startDate, endDate) => {
    const response = await apiClient.get('/calendar/events/range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get a single event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise} Event details
   */
  getById: async (eventId) => {
    const response = await apiClient.get(`/calendar/events/${eventId}`);
    return response.data;
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event information
   * @returns {Promise} Created event
   */
  create: async (eventData) => {
    const response = await apiClient.post('/calendar/events', eventData);
    return response.data;
  },

  /**
   * Update an existing event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event information
   * @returns {Promise} Updated event
   */
  update: async (eventId, eventData) => {
    const response = await apiClient.put(`/calendar/events/${eventId}`, eventData);
    return response.data;
  },

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @param {boolean} deleteRecurring - Delete all recurring instances
   * @returns {Promise} Deletion confirmation
   */
  delete: async (eventId, deleteRecurring = false) => {
    const response = await apiClient.delete(`/calendar/events/${eventId}`, {
      params: { deleteRecurring }
    });
    return response.data;
  },

  /**
   * Get recurring event instances
   * @param {string} eventId - Recurring event ID
   * @param {Object} params - {startDate, endDate}
   * @returns {Promise} List of event instances
   */
  getRecurringInstances: async (eventId, params = {}) => {
    const response = await apiClient.get(`/calendar/events/${eventId}/instances`, {
      params
    });
    return response.data;
  },

  /**
   * Update recurring event instance
   * @param {string} eventId - Event ID
   * @param {string} instanceDate - Instance date
   * @param {Object} eventData - Updated event data
   * @returns {Promise} Updated instance
   */
  updateRecurringInstance: async (eventId, instanceDate, eventData) => {
    const response = await apiClient.put(
      `/calendar/events/${eventId}/instances/${instanceDate}`,
      eventData
    );
    return response.data;
  },

  /**
   * Get event attendees
   * @param {string} eventId - Event ID
   * @returns {Promise} List of attendees
   */
  getAttendees: async (eventId) => {
    const response = await apiClient.get(`/calendar/events/${eventId}/attendees`);
    return response.data;
  },

  /**
   * Add attendees to event
   * @param {string} eventId - Event ID
   * @param {Array} attendeeIds - Array of attendee IDs (students/teachers)
   * @returns {Promise} Updated attendees list
   */
  addAttendees: async (eventId, attendeeIds) => {
    const response = await apiClient.post(`/calendar/events/${eventId}/attendees`, {
      attendeeIds
    });
    return response.data;
  },

  /**
   * Remove attendee from event
   * @param {string} eventId - Event ID
   * @param {string} attendeeId - Attendee ID
   * @returns {Promise} Updated attendees list
   */
  removeAttendee: async (eventId, attendeeId) => {
    const response = await apiClient.delete(
      `/calendar/events/${eventId}/attendees/${attendeeId}`
    );
    return response.data;
  },

  /**
   * Set event reminder
   * @param {string} eventId - Event ID
   * @param {Object} reminderData - {time, method}
   * @returns {Promise} Updated event with reminder
   */
  setReminder: async (eventId, reminderData) => {
    const response = await apiClient.post(`/calendar/events/${eventId}/reminder`, reminderData);
    return response.data;
  },

  /**
   * Get upcoming events
   * @param {number} days - Number of days ahead to look
   * @returns {Promise} Upcoming events
   */
  getUpcoming: async (days = 7) => {
    const response = await apiClient.get('/calendar/events/upcoming', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get events for today
   * @returns {Promise} Today's events
   */
  getToday: async () => {
    const response = await apiClient.get('/calendar/events/today');
    return response.data;
  },

  /**
   * Search events
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  search: async (query, filters = {}) => {
    const response = await apiClient.get('/calendar/events/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * Get calendar statistics
   * @param {Object} params - {startDate, endDate}
   * @returns {Promise} Calendar statistics
   */
  getStatistics: async (params = {}) => {
    const response = await apiClient.get('/calendar/statistics', { params });
    return response.data;
  },

  /**
   * Export calendar
   * @param {Object} params - {startDate, endDate, format}
   * @returns {Promise} File download (iCal, PDF, etc.)
   */
  export: async (params = {}) => {
    const response = await apiClient.get('/calendar/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Import calendar
   * @param {File} file - iCal or CSV file
   * @returns {Promise} Import result
   */
  import: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/calendar/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Get event types
   * @returns {Promise} List of event types
   */
  getEventTypes: async () => {
    const response = await apiClient.get('/calendar/event-types');
    return response.data;
  },

  /**
   * Create custom event type
   * @param {Object} typeData - {name, color, icon}
   * @returns {Promise} Created event type
   */
  createEventType: async (typeData) => {
    const response = await apiClient.post('/calendar/event-types', typeData);
    return response.data;
  },

  /**
   * Get conflicts for a time slot
   * @param {Object} params - {date, startTime, endTime, excludeEventId}
   * @returns {Promise} List of conflicting events
   */
  getConflicts: async (params) => {
    const response = await apiClient.get('/calendar/conflicts', { params });
    return response.data;
  },

  /**
   * Bulk create events
   * @param {Array} events - Array of event objects
   * @returns {Promise} Bulk creation result
   */
  bulkCreate: async (events) => {
    const response = await apiClient.post('/calendar/events/bulk', { events });
    return response.data;
  },

  /**
   * Bulk delete events
   * @param {Array} eventIds - Array of event IDs
   * @returns {Promise} Bulk deletion result
   */
  bulkDelete: async (eventIds) => {
    const response = await apiClient.post('/calendar/events/bulk-delete', { eventIds });
    return response.data;
  }
};

export default calendarService;
