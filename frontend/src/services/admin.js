/**
 * ADMIN API SERVICE
 */

import apiClient from './api';

export const adminAPI = {
  // User management
  getAllUsers: () => apiClient.get('/admin/users'),
  updateUserRole: (data) => apiClient.put('/admin/users/role', data),
  addUserCredits: (data) => apiClient.post('/admin/users/credits', data),

  // Order management
  getAllOrders: () => apiClient.get('/admin/orders'),

  // System stats
  getSystemStats: () => apiClient.get('/admin/stats'),

  // Settings
  getSystemSettings: () => apiClient.get('/admin/settings'),
  updateSystemSettings: (data) => apiClient.put('/admin/settings', data),
};