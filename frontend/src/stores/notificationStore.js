import { defineStore } from 'pinia';
import api from '../services/api';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
  }),

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const { data } = await api.get('/notifications');
        this.notifications = data.data || [];
        this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id) {
      try {
        await api.put(`/notifications/${id}/read`);
        const notif = this.notifications.find((n) => n.id === id);
        if (notif) notif.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },

    async markAllAsRead() {
      try {
        await api.put('/notifications/read-all');
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
      } catch (err) {
        console.error('Failed to mark all as read:', err);
      }
    },
  },
});
