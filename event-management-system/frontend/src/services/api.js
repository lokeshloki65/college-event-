import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kongu-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear auth data and redirect to login
        localStorage.removeItem('kongu-auth-token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Return the error data or create a generic error
      return Promise.reject({
        ...error,
        message: data?.message || `Request failed with status ${status}`,
        errors: data?.errors || [],
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        ...error,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;
