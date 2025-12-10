// src/services/messageService.js
import { apiClient } from './apiClient';

const messageService = {
  /**
   * Get all messages
   * @param {Object} filters - Filter options (folder, type, unread)
   * @returns {Promise} List of messages
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/messages', { params: filters });
    return response.data;
  },

  /**
   * Get a single message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise} Message details
   */
  getById: async (messageId) => {
    const response = await apiClient.get(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Send a new message
   * @param {Object} messageData - {to, subject, message, priority, attachments}
   * @returns {Promise} Sent message
   */
  send: async (messageData) => {
    const response = await apiClient.post('/messages', messageData);
    return response.data;
  },

  /**
   * Reply to a message
   * @param {string} messageId - Original message ID
   * @param {Object} replyData - {message, attachments}
   * @returns {Promise} Sent reply
   */
  reply: async (messageId, replyData) => {
    const response = await apiClient.post(`/messages/${messageId}/reply`, replyData);
    return response.data;
  },

  /**
   * Forward a message
   * @param {string} messageId - Original message ID
   * @param {Object} forwardData - {to, message}
   * @returns {Promise} Forwarded message
   */
  forward: async (messageId, forwardData) => {
    const response = await apiClient.post(`/messages/${messageId}/forward`, forwardData);
    return response.data;
  },

  /**
   * Mark message as read/unread
   * @param {string} messageId - Message ID
   * @param {boolean} isRead - Read status
   * @returns {Promise} Updated message
   */
  markAsRead: async (messageId, isRead = true) => {
    const response = await apiClient.patch(`/messages/${messageId}/read`, { isRead });
    return response.data;
  },

  /**
   * Star/unstar a message
   * @param {string} messageId - Message ID
   * @param {boolean} isStarred - Starred status
   * @returns {Promise} Updated message
   */
  toggleStar: async (messageId, isStarred) => {
    const response = await apiClient.patch(`/messages/${messageId}/star`, { isStarred });
    return response.data;
  },

  /**
   * Move message to folder
   * @param {string} messageId - Message ID
   * @param {string} folder - Folder name (inbox, sent, archive, trash)
   * @returns {Promise} Updated message
   */
  moveToFolder: async (messageId, folder) => {
    const response = await apiClient.patch(`/messages/${messageId}/folder`, { folder });
    return response.data;
  },

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @param {boolean} permanent - Permanently delete (bypass trash)
   * @returns {Promise} Deletion confirmation
   */
  delete: async (messageId, permanent = false) => {
    const response = await apiClient.delete(`/messages/${messageId}`, {
      params: { permanent }
    });
    return response.data;
  },

  /**
   * Bulk operations on messages
   * @param {Array} messageIds - Array of message IDs
   * @param {string} action - Action (markRead, star, archive, delete)
   * @returns {Promise} Bulk operation result
   */
  bulkAction: async (messageIds, action) => {
    const response = await apiClient.post('/messages/bulk', {
      messageIds,
      action
    });
    return response.data;
  },

  /**
   * Upload attachment
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload result with file ID
   */
  uploadAttachment: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/messages/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  /**
   * Download attachment
   * @param {string} messageId - Message ID
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise} File download
   */
  downloadAttachment: async (messageId, attachmentId) => {
    const response = await apiClient.get(
      `/messages/${messageId}/attachments/${attachmentId}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get message templates
   * @returns {Promise} List of templates
   */
  getTemplates: async () => {
    const response = await apiClient.get('/messages/templates');
    return response.data;
  },

  /**
   * Create a message template
   * @param {Object} templateData - {name, subject, body}
   * @returns {Promise} Created template
   */
  createTemplate: async (templateData) => {
    const response = await apiClient.post('/messages/templates', templateData);
    return response.data;
  },

  /**
   * Get contact groups
   * @returns {Promise} List of contact groups
   */
  getContactGroups: async () => {
    const response = await apiClient.get('/messages/contact-groups');
    return response.data;
  },

  /**
   * Search messages
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  search: async (query, filters = {}) => {
    const response = await apiClient.get('/messages/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * Get unread count
   * @returns {Promise} Unread message count
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
  }
};

export default messageService;
