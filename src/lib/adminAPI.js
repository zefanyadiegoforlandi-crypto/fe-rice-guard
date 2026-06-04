import api from '@/lib/api';

export const adminAPI = {
  // Stats
  getStats: () =>
    api.get('/admin/stats'),

  // Users
  getAllUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  getUserDetail: (userId) =>
    api.get(`/admin/users/${userId}`),

  updateUser: (userId, data) =>
    api.put(`/admin/users/${userId}`, data),

  updateUserPassword: (userId, data) =>
    api.put(`/admin/users/${userId}/password`, data),

  deleteUser: (userId) =>
    api.delete(`/admin/users/${userId}`),

  // Guest Scans
  getGuestScans: (params = {}) =>
    api.get('/admin/guest-scans', { params }),

  // Detections
  deleteDetection: (detectionId) =>
    api.delete(`/admin/detections/${detectionId}`),
};
