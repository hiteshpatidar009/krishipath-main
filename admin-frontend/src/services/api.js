import axios from 'axios';
import { ENV } from '../config/env.js';

// Single centralized Axios instance
const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token') || localStorage.getItem('bms_token');
    if (!token) {
      try {
        const authData = JSON.parse(localStorage.getItem('krishipath-auth'));
        if (authData && authData.state && authData.state.token) {
          token = authData.state.token;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const methodsWithIdempotency = ['post', 'put', 'patch', 'delete'];
    if (methodsWithIdempotency.includes(config.method?.toLowerCase()) && !config.headers['idempotency-key'] && !config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = crypto.randomUUID();
    }
    
    if (ENV.ENABLE_LOGGING) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't reload if the request was the login request itself
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/farmer/login');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('bms_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;