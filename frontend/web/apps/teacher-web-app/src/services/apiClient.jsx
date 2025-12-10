import axios from 'axios';
import {TEACHER_APP_CONFIG} from '../../config.jsx';

// Configuration
const API_CONFIG = {
  baseURL: TEACHER_APP_CONFIG.API.BASE_URL,
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000 // 1 second
};

// Create axios instance with enhanced security
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  },
  withCredentials: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
});

// Request ID for tracking
let requestCounter = 0;
const generateRequestId = () => `req_${Date.now()}_${++requestCounter}`;

// Request queue for managing concurrent requests
const pendingRequests = new Map();
const requestControllers = new Map();

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.metadata = {
      requestId: generateRequestId(),
      startTime: Date.now()
    };

    // Create AbortController for request cancellation
    const controller = new AbortController();
    config.signal = controller.signal;
    requestControllers.set(config.metadata.requestId, controller);

    // Add request tracking (redact sensitive data)
    const logData = { ...config.data };
    if (logData.password) logData.password = '***REDACTED***';
    if (logData.newPassword) logData.newPassword = '***REDACTED***';
    if (logData.currentPassword) logData.currentPassword = '***REDACTED***';

    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      requestId: config.metadata.requestId,
      data: logData
    });

    // Handle duplicate requests (optional deduplication)
    const requestKey = `${config.method}_${config.url}_${JSON.stringify(config.data)}`;
    
    if (pendingRequests.has(requestKey)) {
      const existingRequest = pendingRequests.get(requestKey);
      console.debug(`[API] Duplicate request detected, using existing: ${requestKey}`);
      return Promise.reject({
        isDuplicate: true,
        existingRequest
      });
    }

    // Store pending request
    pendingRequests.set(requestKey, config);

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const { config } = response;
    const duration = Date.now() - config.metadata.startTime;
    
    // Clean up pending request and controller
    const requestKey = `${config.method}_${config.url}_${JSON.stringify(config.data)}`;
    pendingRequests.delete(requestKey);
    requestControllers.delete(config.metadata.requestId);

    console.debug(`[API Response] ${config.method?.toUpperCase()} ${config.url}`, {
      requestId: config.metadata.requestId,
      status: response.status,
      duration: `${duration}ms`
    });

    // Add response metadata
    response.metadata = {
      ...config.metadata,
      duration,
      timestamp: new Date().toISOString()
    };

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle duplicate request cancellation
    if (error.isDuplicate) {
      try {
        return await error.existingRequest;
      } catch (duplicateError) {
        return Promise.reject(duplicateError);
      }
    }

    // Clean up pending request and controller
    if (originalRequest) {
      const requestKey = `${originalRequest.method}_${originalRequest.url}_${JSON.stringify(originalRequest.data)}`;
      pendingRequests.delete(requestKey);
      requestControllers.delete(originalRequest.metadata?.requestId);
    }

    // Enhanced error logging (redact sensitive info)
    if (originalRequest) {
      const duration = Date.now() - (originalRequest.metadata?.startTime || Date.now());
      console.error(`[API Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
        requestId: originalRequest.metadata?.requestId,
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.message
      });
    }

    // Retry logic for specific errors
    if (originalRequest && shouldRetryRequest(error) && 
    (!originalRequest._retryCount || originalRequest._retryCount < API_CONFIG.retries)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      const delay = API_CONFIG.retryDelay * Math.pow(2, originalRequest._retryCount - 1); // Exponential backoff
      
      console.debug(`[API Retry] Attempt ${originalRequest._retryCount}/${API_CONFIG.retries} after ${delay}ms`, {
        requestId: originalRequest.metadata?.requestId,
        error: error.message
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    return Promise.reject(enhanceError(error));
  }
);

// Helper functions
function shouldRetryRequest(error) {
  // Don't retry if request was aborted
  if (error.code === 'ERR_CANCELED') return false;
  
  // Retry on network errors, timeouts, and specific 5xx errors
  if (!error.response) return true; // Network error
  
  const { status } = error.response;
  
  // Don't retry client errors (4xx) except for specific cases
  if (status >= 400 && status < 500) {
    // Retry on 408 (timeout), 429 (rate limit)
    return status === 408 || status === 429;
  }
  
  // Retry on server errors (5xx)
  return status >= 500;
}

function enhanceError(error) {
  const enhancedError = {
    ...error,
    timestamp: new Date().toISOString(),
    requestId: error.config?.metadata?.requestId
  };

  if (error.response) {
    // Server responded with error status
    enhancedError.type = 'response_error';
    enhancedError.statusCode = error.response.status;
    enhancedError.statusText = error.response.statusText;
    enhancedError.data = error.response.data;
  } else if (error.request) {
    // Request was made but no response received
    enhancedError.type = 'network_error';
    enhancedError.message = 'Network error - please check your connection';
  } else if (error.code === 'ERR_CANCELED') {
    // Request was cancelled
    enhancedError.type = 'cancelled_error';
    enhancedError.message = 'Request was cancelled';
  } else {
    // Something else happened
    enhancedError.type = 'request_setup_error';
  }

  return enhancedError;
}

// Enhanced utility functions for API operations
export const apiUtils = {
  // Cancel specific request by ID
  cancelRequest: (requestId) => {
    const controller = requestControllers.get(requestId);
    if (controller) {
      controller.abort();
      requestControllers.delete(requestId);
    }
  },

  // Cancel all pending requests
  cancelAllRequests: () => {
    requestControllers.forEach(controller => controller.abort());
    requestControllers.clear();
    pendingRequests.clear();
  },

  // Get API health status
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return {
        status: 'healthy',
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Upload file with progress tracking and security
  uploadFile: (file, onProgress, onError) => {
    const formData = new FormData();
    formData.append('file', file);

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }

    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    }).catch(error => {
      if (onError) onError(error);
      throw error;
    });
  },

  // Download file with security headers
  downloadFile: async (url, filename) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
        headers: {
          'Content-Disposition': 'attachment'
        }
      });

      // Create secure download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke object URL to free memory
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  // Batch requests with individual error handling
  batch: async (requests) => {
    try {
      const promises = requests.map(request => 
        apiClient({
          method: request.method || 'GET',
          url: request.url,
          data: request.data,
          params: request.params
        })
      );

      const responses = await Promise.allSettled(promises);
      
      return responses.map((result, index) => ({
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? enhanceError(result.reason) : null,
        request: requests[index],
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Batch request failed:', error);
      throw enhanceError(error);
    }
  },

  // Security utilities
  sanitizeParams: (params) => {
    if (!params || typeof params !== 'object') return params;
    
    const sanitized = { ...params };
    
    // Remove potentially dangerous parameters
    delete sanitized.__proto__;
    delete sanitized.constructor;
    delete sanitized.prototype;
    
    // Sanitize string values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      }
    });
    
    return sanitized;
  }
};

// Request/Response transformers with security
export const transformers = {
  // Transform camelCase to snake_case for API requests with XSS protection
  camelToSnake: (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return typeof obj === 'string' ? apiUtils.sanitizeParams({ value: obj }).value : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(transformers.camelToSnake);
    }
    
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = transformers.camelToSnake(obj[key]);
      return acc;
    }, {});
  },

  // Transform snake_case to camelCase for API responses
  snakeToCamel: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(transformers.snakeToCamel);
    }
    
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
      acc[camelKey] = transformers.snakeToCamel(obj[key]);
      return acc;
    }, {});
  }
};

// Add security middleware
apiClient.interceptors.request.use(
  (config) => {
    // Sanitize request data
    if (config.data) {
      config.data = transformers.camelToSnake(config.data);
    }
    
    // Sanitize request params
    if (config.params) {
      config.params = apiUtils.sanitizeParams(config.params);
    }
    
    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Transform response data to camelCase
    if (response.data) {
      response.data = transformers.snakeToCamel(response.data);
    }
    return response;
  }
);

export default apiClient;