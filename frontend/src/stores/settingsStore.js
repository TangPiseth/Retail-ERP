import { defineStore } from 'pinia';
import api from '../services/api';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      storeName: 'My Store',
      storeLogo: '',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 0,
      lowStockThreshold: 10,
      allowNegativeInventory: false,
      invoicePrefix: 'INV',
      loyaltyRate: 1,
    },
    loading: false,
  }),

  getters: {
    currency: (state) => state.settings.currency,
    currencySymbol: (state) => state.settings.currencySymbol,
    storeName: (state) => state.settings.storeName,
  },

  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const { data } = await api.get('/settings');
        if (data.data) {
          this.settings = { ...this.settings, ...data.data };
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        this.loading = false;
      }
    },

    async updateSettings(updates) {
      try {
        const { data } = await api.put('/settings', updates);
        this.settings = { ...this.settings, ...data.data };
        return data;
      } catch (err) {
        console.error('Failed to update settings:', err);
        throw err;
      }
    },
  },
});
