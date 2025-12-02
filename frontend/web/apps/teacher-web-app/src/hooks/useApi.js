import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for API calls with loading, error, and success states
 * @param {Function} apiFunction - The API service function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - {data, loading, error, execute, reset}
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,  // Execute immediately on mount
    onSuccess = null,   // Success callback
    onError = null,     // Error callback
    initialData = null  // Initial data value
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const response = await apiFunction(...args);

      if (mountedRef.current) {
        setData(response);
        setLoading(false);

        if (onSuccess) {
          onSuccess(response);
        }

        return { success: true, data: response };
      }
    } catch (err) {
      if (mountedRef.current) {
        // Don't set error if request was cancelled
        if (err.code !== 'ERR_CANCELED') {
          const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
          setError(errorMessage);
          setLoading(false);

          if (onError) {
            onError(err);
          }
        }

        return { success: false, error: err };
      }
    }
  }, [apiFunction, onSuccess, onError]);

  // Reset hook state
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for paginated API calls
 * @param {Function} apiFunction - The API service function
 * @param {Object} options - Configuration options
 * @returns {Object} - Paginated data and controls
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    pageSize = 20,
    initialPage = 1,
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction({
        page: pageNum,
        pageSize
      });

      if (mountedRef.current) {
        const newData = response.data || response;
        const pagination = response.pagination || {};

        setData(pageNum === 1 ? newData : [...data, ...newData]);
        setPage(pageNum);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || newData.length);
        setHasMore(pageNum < (pagination.totalPages || 1));
        setLoading(false);

        if (onSuccess) {
          onSuccess(response);
        }

        return { success: true, data: newData };
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        setLoading(false);

        if (onError) {
          onError(err);
        }

        return { success: false, error: err };
      }
    }
  }, [apiFunction, page, pageSize, data, onSuccess, onError]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setTotalPages(0);
    setTotalItems(0);
    setLoading(false);
    setError(null);
    setHasMore(true);
  }, [initialPage]);

  useEffect(() => {
    fetchPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    hasMore,
    loadMore,
    refresh,
    reset
  };
};

/**
 * Hook for real-time data polling
 * @param {Function} apiFunction - The API service function
 * @param {Object} options - Configuration options
 * @returns {Object} - Data and controls
 */
export const usePollingApi = (apiFunction, options = {}) => {
  const {
    interval = 5000,  // Poll every 5 seconds
    immediate = true,
    enabled = true,
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction();

      if (mountedRef.current) {
        setData(response);
        setLoading(false);

        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        setLoading(false);

        if (onError) {
          onError(err);
        }
      }
    }
  }, [apiFunction, onSuccess, onError]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    if (immediate) {
      fetch();
    }
    intervalRef.current = setInterval(fetch, interval);
  }, [fetch, interval, immediate]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (enabled && isPolling) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, isPolling, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refresh
  };
};

/**
 * Hook for optimistic updates
 * @param {Function} apiFunction - The API service function
 * @param {Function} updateFunction - Function to optimistically update local state
 * @param {Function} rollbackFunction - Function to rollback on error
 * @returns {Object} - Execute function and state
 */
export const useOptimisticApi = (apiFunction, updateFunction, rollbackFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (optimisticData, ...apiArgs) => {
    try {
      setLoading(true);
      setError(null);

      // Apply optimistic update immediately
      updateFunction(optimisticData);

      // Make API call
      const response = await apiFunction(...apiArgs);

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      // Rollback on error
      rollbackFunction(optimisticData);

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);

      return { success: false, error: err };
    }
  }, [apiFunction, updateFunction, rollbackFunction]);

  return {
    loading,
    error,
    execute
  };
};

export default useApi;
