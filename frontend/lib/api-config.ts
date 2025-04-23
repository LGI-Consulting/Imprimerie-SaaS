import axios from 'axios';

// API base URL from environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await api.post('/auth/token/refresh');
        if (response.data.success && response.data.token) {
          localStorage.setItem('token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
); 