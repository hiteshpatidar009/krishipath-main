// Admin Management API — connects to /api/v1/iam/users
import api from './api';

const BASE = '/iam/users';

/** Get all admin users */
export const getAdmins = (params = {}) => api.get(BASE, { params });

/** Get all pending invitations */
export const getInvitations = () => api.get(`${BASE}/invitations`);

/** Accept an invitation */
export const acceptInvitation = (token, password) => api.post(`${BASE}/invitations/accept`, { token, password });

/** Create a new admin user (Invite) */
export const createAdmin = (data) => api.post(BASE, data);

/** Update admin user (status, name, etc.) */
export const updateAdmin = (id, data) => {
  // If toggling status to active/suspended, use the specific endpoints
  if (data.status === 'active') return api.post(`${BASE}/${id}/activate`);
  if (data.status === 'suspended') return api.post(`${BASE}/${id}/suspend`);
  
  return api.patch(`${BASE}/${id}`, data);
};

/** Deactivate an admin user */
export const deactivateAdmin = (id) => api.post(`${BASE}/${id}/suspend`);

/** Get all registered farmers (Admin view) - Mock or update later */
export const getFarmers = (params = {}) => api.get(`/admin/farmers`, { params });

/** Get roles for assignment */
export const getRoles = () => api.get('/auth/roles');
