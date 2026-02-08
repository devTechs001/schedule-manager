import { useState, useCallback, useRef } from 'react';

const useExternalAPIs = (options = {}) => {
  const {
    baseURL = '',
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
  } = options;

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({});
  const cacheRef = useRef({});

  // Make API request with retry logic
  const request = useCallback(async (key, url, options = {}) => {
    const {
      method = 'GET',
      body,
      headers = {},
      cache = false,
      cacheDuration = 300000, // 5 minutes
      retryCount = retries,
    } = options;

    // Check cache
    if (cache && cacheRef.current[key]) {
      const cached = cacheRef.current[key];
      if (Date.now() - cached.timestamp < cacheDuration) {
        return { success: true, data: cached.data, cached: true };
      }
    }

    setLoading(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    let lastError;
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${baseURL}${url}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();

        // Update cache
        if (cache) {
          cacheRef.current[key] = {
            data: responseData,
            timestamp: Date.now(),
          };
        }

        setData(prev => ({ ...prev, [key]: responseData }));
        setLoading(prev => ({ ...prev, [key]: false }));

        return { success: true, data: responseData };
      } catch (error) {
        lastError = error;
        if (attempt < retryCount - 1) {
          await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
        }
      }
    }

    setErrors(prev => ({ ...prev, [key]: lastError.message }));
    setLoading(prev => ({ ...prev, [key]: false }));
    return { success: false, error: lastError.message };
  }, [baseURL, timeout, retries, retryDelay]);

  // Convenience methods
  const get = useCallback((key, url, options = {}) => 
    request(key, url, { ...options, method: 'GET' }), [request]);

  const post = useCallback((key, url, body, options = {}) => 
    request(key, url, { ...options, method: 'POST', body }), [request]);

  const put = useCallback((key, url, body, options = {}) => 
    request(key, url, { ...options, method: 'PUT', body }), [request]);

  const patch = useCallback((key, url, body, options = {}) => 
    request(key, url, { ...options, method: 'PATCH', body }), [request]);

  const del = useCallback((key, url, options = {}) => 
    request(key, url, { ...options, method: 'DELETE' }), [request]);

  // Clear cache
  const clearCache = useCallback((key) => {
    if (key) {
      delete cacheRef.current[key];
    } else {
      cacheRef.current = {};
    }
  }, []);

  // Check if loading
  const isLoading = useCallback((key) => loading[key] || false, [loading]);

  // Get error
  const getError = useCallback((key) => errors[key] || null, [errors]);

  // Get data
  const getData = useCallback((key) => data[key] || null, [data]);

  // Batch multiple requests
  const batch = useCallback(async (requests) => {
    const results = await Promise.all(
      requests.map(({ key, url, options }) => request(key, url, options))
    );
    return results;
  }, [request]);

  // Poll an endpoint
  const poll = useCallback((key, url, interval, options = {}) => {
    const pollFn = async () => {
      await request(key, url, options);
    };

    pollFn();
    const intervalId = setInterval(pollFn, interval);

    return () => clearInterval(intervalId);
  }, [request]);

  return {
    loading,
    errors,
    data,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    clearCache,
    isLoading,
    getError,
    getData,
    batch,
    poll,
  };
};

export default useExternalAPIs;

