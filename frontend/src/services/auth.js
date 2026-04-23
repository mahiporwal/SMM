/**
 * AUTH SERVICE
 */

import apiClient from './api';

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
};
