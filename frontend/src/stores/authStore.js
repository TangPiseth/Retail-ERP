import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role?.name || '',
    userName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    userInitials: (state) => {
      if (!state.user) return '';
      return `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase();
    },
    hasRole: (state) => (role) => state.user?.role?.name === role,
    hasAnyRole: (state) => (roles) => roles.includes(state.user?.role?.name),
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/login', { email, password });
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const { data } = await api.get('/auth/me');
        this.user = data.data;
      } catch (err) {
        this.logout();
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
