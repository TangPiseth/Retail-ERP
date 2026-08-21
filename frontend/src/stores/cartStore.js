import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    customerId: null,
    discount: 0,
    discountType: 'amount',
    notes: '',
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0),
    discountAmount() {
      if (this.discountType === 'percent') {
        return (this.subtotal * this.discount) / 100;
      }
      return this.discount;
    },
    taxAmount: (state) => state.items.reduce((sum, item) => {
      const itemTotal = item.sellingPrice * item.quantity;
      return sum + (itemTotal * (item.taxRate || 0) / 100);
    }, 0),
    total() {
      return this.subtotal - this.discountAmount + this.taxAmount;
    },
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(product) {
      const existing = this.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          sellingPrice: Number(product.sellingPrice),
          costPrice: Number(product.costPrice),
          taxRate: Number(product.taxRate) || 0,
          quantity: 1,
          stock: product.inventory?.currentQuantity || 0,
        });
      }
    },

    removeItem(productId) {
      this.items = this.items.filter((item) => item.productId !== productId);
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((i) => i.productId === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearCart() {
      this.items = [];
      this.customerId = null;
      this.discount = 0;
      this.discountType = 'amount';
      this.notes = '';
    },

    setCustomer(customerId) {
      this.customerId = customerId;
    },

    setDiscount(amount, type = 'amount') {
      this.discount = amount;
      this.discountType = type;
    },
  },
});
