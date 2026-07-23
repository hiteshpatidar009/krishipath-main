// Export all APIs from single file
export { authAPI } from './authAPI.js';
export { productAPI } from './productAPI.js';
export { orderAPI } from './orderAPI.js';

// Legacy exports for backward compatibility
export * from './productAPI.js';
export * from './authAPI.js';
export * from './billingAPI.js';
export * from './categoryAPI.js';
export * from './customerAPI.js';
export * from './deliveryAPI.js';
export * from './locationAPI.js';
export * from './shippingAPI.js';
export * from './superAdminAPI.js';

// Export centralized API instance
export { default as api } from './api.js';
export { default as axiosInstance } from './api.js';