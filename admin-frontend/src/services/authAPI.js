import axiosInstance from './axiosInstance.js';
import { ENDPOINTS } from '../config/api.config.js';

export const authAPI = {
  // Admin login
  loginAdmin: (credentials) => 
    axiosInstance.post(ENDPOINTS.LOGIN, credentials),

  // Customer registration
  registerCustomer: (userData) => 
    axiosInstance.post(ENDPOINTS.REGISTER, userData),

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  // Get current user from token
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Password reset endpoints
  requestPasswordReset: (email) => 
    axiosInstance.post('/auth/password-reset/request', { email }),
    
  validatePasswordResetToken: (token) => 
    axiosInstance.post('/auth/password-reset/validate', { token }),
    
  completePasswordReset: (token, password) => 
    axiosInstance.post('/auth/password-reset/complete', { token, password })
};

// Legacy exports for backward compatibility
export const loginAdmin = authAPI.loginAdmin;