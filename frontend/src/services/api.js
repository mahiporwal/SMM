/**
 * API CLIENT SERVICE
 * Supports both local and public deployments
 */

import axios from 'axios';

// Automatically detect API URL
const getApiUrl = () => {
  // If environment variable is set, use it (production)
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Development: use localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  // Production: use same domain as frontend
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    return `${protocol}//api.${host}`;
  }
  
  // Fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderAPI = {
  createOrder: (data) => apiClient.post('/orders/create', data),
  getOrders: (limit, page) => apiClient.get(`/orders?limit=${limit}&page=${page}`),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  autoSuggest: (data) => apiClient.post('/orders/auto-suggest', data),
  calculatePrice: (data) => apiClient.post('/orders/calculate-price', data),
  getSafetyScore: (id) => apiClient.get(`/orders/${id}/safety-score`),
  cancelOrder: (id, reason) => apiClient.post(`/orders/${id}/cancel`, { reason }),
  getStats: () => apiClient.get('/orders/stats/summary'),
};

export const walletAPI = {
  getWallet: () => apiClient.get('/wallet'),
  deposit: (data) => apiClient.post('/wallet/deposit', data),
  getTransactions: (limit, page) => apiClient.get(`/wallet/transactions?limit=${limit}&page=${page}`),
  getSummary: () => apiClient.get('/wallet/summary'),
};

export default apiClient;
