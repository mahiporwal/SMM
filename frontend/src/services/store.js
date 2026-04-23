/**
 * STORE - User State Management
 */

import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  wallet: null,

  // Set user
  setUser: (user) => set({ user }),

  // Set token
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token, isAuthenticated: !!token });
  },

  // Set wallet
  setWallet: (wallet) => set({ wallet }),

  // Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false, wallet: null });
  },
}));

export default useStore;
