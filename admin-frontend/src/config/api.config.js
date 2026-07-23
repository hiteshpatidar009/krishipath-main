import { ENV } from './env.js';

// Centralized API configuration
export const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
};

export const APP_CONFIG = {
  environment: ENV.APP_ENV,
  enableLogging: ENV.ENABLE_LOGGING,
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/customer/register',
  
  // Products
  PRODUCTS: '/product',
  PRODUCT_BY_ID: (id) => `/product/${id}`,
  LOW_STOCK: (limit) => `/product/low-stock/${limit}`,
  
  // Categories
  CATEGORIES: '/category/all',
  PUBLIC_CATEGORIES: '/category/public/all',
  
  // Orders/Bills
  BILLS: '/bill',
  BILL_BY_ID: (id) => `/bill/${id}`,
  UPDATE_ORDER_STATUS: (id) => `/bill/update-status/${id}`,
  
  // Customers
  CUSTOMERS: '/customer/list',
  CUSTOMER_BY_ID: (id) => `/customer/details/${id}`,
  
  // Coupons
  COUPONS: '/coupons',
  
  // Combos
  COMBOS: '/combo',
  
  // Delivery
  DELIVERY: '/delivery',
  
  // Dashboard
  DASHBOARD: '/dashboard'
};