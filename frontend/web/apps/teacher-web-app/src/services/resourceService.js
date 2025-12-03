// src/services/resourceService.js
import { apiClient } from './apiClient';

const resourceService = {
  /**
   * Get all resources
   * @param {Object} filters - Filter options (folderId, type, tags)
   * @returns {Promise} List of resources
   */
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/resources', { params: filters });
    return response.data;
  },

  /**
   * Get a single resource by ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise} Resource details
   */
  getById: async (resourceId) => {
    const response = await apiClient.get(`/resources/${resourceId}`);
    return response.data;
  },

  /**
   * Upload a new resource
   * @param {File} file - File to upload
   * @param {Object} metadata - {name, folderId, tags, shareWith}
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Uploaded resource
   */
  upload: async (file, metadata = {}, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    // Append metadata
    Object.keys(metadata).forEach(key => {
      if (Array.isArray(metadata[key])) {
        formData.append(key, JSON.stringify(metadata[key]));
      } else {
        formData.append(key, metadata[key]);
      }
    });

    const response = await apiClient.post('/resources', formData, {
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
   * Update resource metadata
   * @param {string} resourceId - Resource ID
   * @param {Object} metadata - Updated metadata
   * @returns {Promise} Updated resource
   */
  update: async (resourceId, metadata) => {
    const response = await apiClient.put(`/resources/${resourceId}`, metadata);
    return response.data;
  },

  /**
   * Delete a resource
   * @param {string} resourceId - Resource ID
   * @returns {Promise} Deletion confirmation
   */
  delete: async (resourceId) => {
    const response = await apiClient.delete(`/resources/${resourceId}`);
    return response.data;
  },

  /**
   * Download a resource
   * @param {string} resourceId - Resource ID
   * @returns {Promise} File download
   */
  download: async (resourceId) => {
    const response = await apiClient.get(`/resources/${resourceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Star/unstar a resource
   * @param {string} resourceId - Resource ID
   * @param {boolean} isStarred - Starred status
   * @returns {Promise} Updated resource
   */
  toggleStar: async (resourceId, isStarred) => {
    const response = await apiClient.patch(`/resources/${resourceId}/star`, { isStarred });
    return response.data;
  },

  /**
   * Share resource with classes
   * @param {string} resourceId - Resource ID
   * @param {Array} classIds - Array of class IDs
   * @returns {Promise} Updated resource
   */
  share: async (resourceId, classIds) => {
    const response = await apiClient.post(`/resources/${resourceId}/share`, { classIds });
    return response.data;
  },

  /**
   * Get all folders
   * @returns {Promise} List of folders
   */
  getFolders: async () => {
    const response = await apiClient.get('/resources/folders');
    return response.data;
  },

  /**
   * Create a new folder
   * @param {Object} folderData - {name, description, color}
   * @returns {Promise} Created folder
   */
  createFolder: async (folderData) => {
    const response = await apiClient.post('/resources/folders', folderData);
    return response.data;
  },

  /**
   * Update folder
   * @param {string} folderId - Folder ID
   * @param {Object} folderData - Updated folder data
   * @returns {Promise} Updated folder
   */
  updateFolder: async (folderId, folderData) => {
    const response = await apiClient.put(`/resources/folders/${folderId}`, folderData);
    return response.data;
  },

  /**
   * Delete a folder
   * @param {string} folderId - Folder ID
   * @param {boolean} deleteContents - Delete folder contents too
   * @returns {Promise} Deletion confirmation
   */
  deleteFolder: async (folderId, deleteContents = false) => {
    const response = await apiClient.delete(`/resources/folders/${folderId}`, {
      params: { deleteContents }
    });
    return response.data;
  },

  /**
   * Move resource to folder
   * @param {string} resourceId - Resource ID
   * @param {string} folderId - Target folder ID
   * @returns {Promise} Updated resource
   */
  moveToFolder: async (resourceId, folderId) => {
    const response = await apiClient.patch(`/resources/${resourceId}/move`, { folderId });
    return response.data;
  },

  /**
   * Get resource statistics
   * @returns {Promise} Resource statistics (total size, count, etc.)
   */
  getStatistics: async () => {
    const response = await apiClient.get('/resources/statistics');
    return response.data;
  },

  /**
   * Search resources
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  search: async (query, filters = {}) => {
    const response = await apiClient.get('/resources/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  /**
   * Get recently accessed resources
   * @param {number} limit - Number of resources to return
   * @returns {Promise} Recently accessed resources
   */
  getRecent: async (limit = 10) => {
    const response = await apiClient.get('/resources/recent', { params: { limit } });
    return response.data;
  },

  /**
   * Track resource view
   * @param {string} resourceId - Resource ID
   * @returns {Promise} Updated view count
   */
  trackView: async (resourceId) => {
    const response = await apiClient.post(`/resources/${resourceId}/view`);
    return response.data;
  },

  /**
   * Bulk delete resources
   * @param {Array} resourceIds - Array of resource IDs
   * @returns {Promise} Bulk deletion result
   */
  bulkDelete: async (resourceIds) => {
    const response = await apiClient.post('/resources/bulk-delete', { resourceIds });
    return response.data;
  },

  /**
   * Bulk move resources
   * @param {Array} resourceIds - Array of resource IDs
   * @param {string} folderId - Target folder ID
   * @returns {Promise} Bulk move result
   */
  bulkMove: async (resourceIds, folderId) => {
    const response = await apiClient.post('/resources/bulk-move', {
      resourceIds,
      folderId
    });
    return response.data;
  }
};

export default resourceService;
