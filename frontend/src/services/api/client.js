import axios from 'axios';
import config from '../../config/app';

const client = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach the bearer token
client.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * Let the browser set Content-Type for FormData (avatar uploads).
     * A hardcoded 'application/json' here makes axios skip the multipart
     * boundary, and multer then rejects the request with "Boundary not found".
     * Deleting the header is what lets axios/XHR generate it correctly.
     */
    if (typeof FormData !== 'undefined' && requestConfig.data instanceof FormData) {
      delete requestConfig.headers['Content-Type'];
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Events so the UI can react to auth expiry without a hard redirect loop
const emitAuthExpired = () => {
  window.dispatchEvent(new CustomEvent('auth:expired'));
};

// Response interceptor — unwrap `{ success, data }` envelopes and normalise errors
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Backend returns { success: boolean, data: actualData, ... }
    if (body && typeof body === 'object' && 'data' in body) {
      return body.data;
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      emitAuthExpired();
    }

    // Normalise the rejection to a plain Error so `err.message` always works
    const payload = error.response?.data;
    let message =
      (typeof payload === 'string' && payload) ||
      payload?.message ||
      payload?.error ||
      error.message ||
      'Request failed';

    if (Array.isArray(payload?.errors) && payload.errors.length) {
      message = payload.errors
        .map((item) => (typeof item === 'string' ? item : item.msg || item.message))
        .filter(Boolean)
        .join(', ') || message;
    }

    const normalised = new Error(message);
    normalised.status = status;
    normalised.payload = payload;
    return Promise.reject(normalised);
  }
);

export default client;
