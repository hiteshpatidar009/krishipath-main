// Crop Categories — uses the master-data endpoint on the backend
import api from './api';

const BASE = '/mandi/admin/master-data/crop_category';

export const getAllCategories = () => api.get(BASE);

export const createCategory = (data) => api.post(BASE, data);

export const updateCategory = (id, data) => api.patch(`${BASE}/${id}`, data);

export const deleteCategory = (id) => api.delete(`${BASE}/${id}`);
