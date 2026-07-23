import axiosInstance from './axiosInstance.js';
import { ENDPOINTS } from '../config/api.config.js';

export const productAPI = {
  // Get all products
  getAll: () => 
    axiosInstance.get(ENDPOINTS.PRODUCTS + '/all'),

  // Get product by ID
  getById: (id) => 
    axiosInstance.get(ENDPOINTS.PRODUCT_BY_ID(id)),

  // Add new product
  create: (productData) => 
    axiosInstance.post(ENDPOINTS.PRODUCTS + '/add', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Update product
  update: (id, productData) => {
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
    
    return axiosInstance.put(ENDPOINTS.PRODUCTS + `/update/${id}`, productData, { headers });
  },

  // Delete product
  delete: (id) => 
    axiosInstance.delete(ENDPOINTS.PRODUCTS + `/delete/${id}`),

  // Get low stock products
  getLowStock: (limit = 10) => 
    axiosInstance.get(ENDPOINTS.LOW_STOCK(limit)),

  // Update product status
  updateStatus: (id, status) => 
    axiosInstance.put(ENDPOINTS.PRODUCTS + `/update/${id}`, { status })
};

// Combo API (temporary location)
export const comboAPI = {
  create: (data) => axiosInstance.post('/combo/create', data),
  getAll: () => axiosInstance.get('/combo/all'),
  delete: (id) => axiosInstance.delete(`/combo/delete/${id}`),
  update: (id, data) => axiosInstance.put(`/combo/update/${id}`, data),
  updateStatus: (id, status) => axiosInstance.put(`/combo/status/${id}`, { status })
};

// Category API (temporary location)
export const categoryAPI = {
  getAll: () => axiosInstance.get('/category/all'),
  getPublic: () => axiosInstance.get('/category/public/all')
};

// Admin API (temporary location)
export const adminAPI = {
  login: (data) => axiosInstance.post('/admin/login', data),
  getAll: () => axiosInstance.get('/admin/all'),
  create: (data) => axiosInstance.post('/admin/create', data)
};

// Legacy exports for backward compatibility
export const addProduct = productAPI.create;
export const getProducts = productAPI.getAll;
export const getAllProducts = productAPI.getAll;
export const getProductById = productAPI.getById;
export const deleteProduct = productAPI.delete;
export const deleteProductById = productAPI.delete;
export const updateProduct = productAPI.update;
export const toggleProductStatus = productAPI.updateStatus;
export const updateProductStatus = productAPI.updateStatus;
export const getLowStock = productAPI.getLowStock;

// Combo legacy exports
export const addCombo = comboAPI.create;
export const getCombos = comboAPI.getAll;
export const deleteCombo = comboAPI.delete;
export const updateCombo = comboAPI.update;
export const toggleComboStatus = comboAPI.updateStatus;

// Category legacy exports
export const getCategories = categoryAPI.getAll;
export const getAllCategories = categoryAPI.getAll;

// Admin legacy exports
export const loginAdmin = adminAPI.login;
export const getAllAdmins = adminAPI.getAll;
export const createAdmin = adminAPI.create;
