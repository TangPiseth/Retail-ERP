<template>
  <div class="pos-container">
    <div class="pos-grid">
      <div class="pos-products">
        <div class="card h-100">
          <div class="card-header">
            <div class="pos-search">
              <i class="bi bi-search pos-search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="pos-search-input"
                placeholder="Search products by name, SKU, or scan barcode..."
                @input="debouncedSearch"
                @keyup.enter="searchByBarcode"
              />
            </div>
            <select v-model="selectedCategory" class="form-select" @change="fetchProducts">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="pos-product-grid">
            <div v-for="product in products" :key="product.id" class="pos-product-card" :class="{ 'out-of-stock': (product.inventory?.currentQuantity || 0) === 0 }" @click="addToCart(product)">
              <div class="pos-product-icon">
                <i class="bi bi-box"></i>
              </div>
              <div class="pos-product-info">
                <div class="pos-product-name">{{ product.name }}</div>
                <div class="pos-product-sku">{{ product.sku }}</div>
              </div>
              <div class="pos-product-price">{{ formatCurrency(product.sellingPrice) }}</div>
              <div class="pos-product-stock">
                <span class="stock-dot" :class="(product.inventory?.currentQuantity || 0) === 0 ? 'danger' : (product.inventory?.currentQuantity || 0) <= (product.minStock || 10) ? 'warning' : 'success'"></span>
                {{ product.inventory?.currentQuantity || 0 }}
              </div>
            </div>
            <div v-if="products.length === 0 && !loadingProducts" class="pos-empty">
              <EmptyState icon="bi bi-search" title="No products found" />
            </div>
          </div>
        </div>
      </div>

      <div class="pos-cart">
        <div class="card h-100">
          <div class="card-header">
            <div class="cart-header-info">
              <span class="cart-title">Current Order</span>
              <span class="cart-count">{{ cart.itemCount }} items</span>
            </div>
            <button class="btn btn-sm btn-light" @click="cart.clearCart()" :disabled="cart.isEmpty" aria-label="Clear cart">
              <i class="bi bi-trash"></i>
            </button>
          </div>

          <div class="cart-items">
            <div v-if="cart.isEmpty" class="cart-empty">
              <div class="cart-empty-icon">
                <i class="bi bi-cart"></i>
              </div>
              <p class="cart-empty-text">Cart is empty</p>
              <p class="cart-empty-subtext">Click products to add them</p>
            </div>
            <div v-for="item in cart.items" :key="item.productId" class="cart-item">
              <div class="cart-item-info">
                <div class="cart-item-name">{{ item.name }}</div>
                <div class="cart-item-price">{{ formatCurrency(item.sellingPrice) }} each</div>
              </div>
              <div class="cart-item-qty">
                <button class="qty-btn" @click="cart.updateQuantity(item.productId, item.quantity - 1)" aria-label="Decrease quantity">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="cart.updateQuantity(item.productId, item.quantity + 1)" aria-label="Increase quantity">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <div class="cart-item-total">{{ formatCurrency(item.sellingPrice * item.quantity) }}</div>
              <button class="cart-item-remove" @click="cart.removeItem(item.productId)" aria-label="Remove item">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <div class="cart-footer">
            <div class="cart-summary">
              <div class="cart-summary-row">
                <span class="cart-summary-label">Subtotal</span>
                <span class="cart-summary-value">{{ formatCurrency(cart.subtotal) }}</span>
              </div>
              <div class="cart-summary-row">
                <span class="cart-summary-label">Discount</span>
                <span class="cart-summary-value discount">-{{ formatCurrency(cart.discountAmount) }}</span>
              </div>
              <div class="cart-summary-row">
                <span class="cart-summary-label">Tax</span>
                <span class="cart-summary-value">{{ formatCurrency(cart.taxAmount) }}</span>
              </div>
              <div class="cart-summary-row total">
                <span class="cart-summary-label">Total</span>
                <span class="cart-summary-value">{{ formatCurrency(cart.total) }}</span>
              </div>
            </div>

            <div class="payment-method">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-btn"
                :class="{ active: paymentMethod === method.value }"
                @click="paymentMethod = method.value"
              >
                <i :class="method.icon"></i>
                <span>{{ method.label }}</span>
              </button>
            </div>

            <button class="btn btn-primary complete-btn" @click="completeSale" :disabled="cart.isEmpty || processing">
              <span v-if="processing" class="btn-spinner"></span>
              <i v-else class="bi bi-check-lg"></i>
              Complete Sale
            </button>

            <button class="btn btn-light hold-btn" @click="holdSale" :disabled="cart.isEmpty">
              <i class="bi bi-bookmark"></i>
              Hold Sale
            </button>
          </div>
        </div>
      </div>
    </div>
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { useCartStore } from '../stores/cartStore';
import EmptyState from '../components/common/EmptyState.vue';
import BaseToast from '../components/common/BaseToast.vue';

const cart = useCartStore();
const products = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const paymentMethod = ref('Cash');
const loadingProducts = ref(false);
const processing = ref(false);
const toastRef = ref(null);

const paymentMethods = [
  { value: 'Cash', label: 'Cash', icon: 'bi bi-cash' },
  { value: 'Card', label: 'Card', icon: 'bi bi-credit-card' },
  { value: 'Other', label: 'Other', icon: 'bi bi-wallet' },
];

let searchTimer = null;
const debouncedSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchProducts, 300);
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const { data } = await api.get('/products', {
      params: { search: searchQuery.value, categoryId: selectedCategory.value || undefined, limit: 50 },
    });
    products.value = data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
  } finally {
    loadingProducts.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories', { params: { limit: 100 } });
    categories.value = data.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

const searchByBarcode = async () => {
  if (!searchQuery.value) return;
  try {
    const { data } = await api.get(`/products/barcode/${searchQuery.value}`);
    if (data.data) {
      addToCart(data.data);
      searchQuery.value = '';
    }
  } catch (err) {
    // Not a barcode, do normal search
  }
};

const addToCart = (product) => {
  if ((product.inventory?.currentQuantity || 0) === 0) return;
  cart.addItem(product);
};

const completeSale = async () => {
  processing.value = true;
  try {
    const saleData = {
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        costPrice: item.costPrice,
        taxRate: item.taxRate,
        tax: (item.sellingPrice * item.quantity * item.taxRate / 100),
      })),
      customerId: cart.customerId,
      paymentMethod: paymentMethod.value,
      discountAmount: cart.discountAmount,
    };
    await api.post('/sales', saleData);
    cart.clearCart();
    toastRef.value?.add('Sale completed successfully', 'success');
    fetchProducts();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to complete sale', 'error');
  } finally {
    processing.value = false;
  }
};

const holdSale = async () => {
  try {
    await api.post('/sales/hold', {
      items: cart.items,
      customerId: cart.customerId,
    });
    cart.clearCart();
    toastRef.value?.add('Sale held', 'info');
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to hold sale', 'error');
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<style scoped>
.pos-container {
  height: calc(100vh - var(--navbar-height) - 3rem);
}

.pos-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 0.75rem;
  height: 100%;
}

.pos-products {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pos-cart {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pos-products .card,
.pos-cart .card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.pos-cart .card {
  height: auto;
  max-height: 100%;
}

.card-header {
  padding: 0.875rem 1rem;
  display: flex;
  gap: 0.625rem;
  align-items: center;
  flex-shrink: 0;
}

.card-header .form-select {
  flex-shrink: 0;
  width: auto;
  min-width: 150px;
}

.pos-search {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.pos-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  pointer-events: none;
}

.pos-search-input {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: var(--transition-fast);
}

.pos-search-input:focus {
  background: var(--color-bg-elevated);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
}

.pos-product-grid {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  align-content: start;
}

.pos-product-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  position: relative;
}

.pos-product-card:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.pos-product-card.out-of-stock {
  opacity: 0.4;
  cursor: not-allowed;
}

.pos-product-card.out-of-stock:hover {
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
}

.pos-product-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.pos-product-info {
  flex: 1;
  min-width: 0;
}

.pos-product-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pos-product-sku {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 1px;
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pos-product-price {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.pos-product-stock {
  font-size: 0.625rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stock-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.stock-dot.success { background: var(--color-success); }
.stock-dot.warning { background: var(--color-warning); }
.stock-dot.danger { background: var(--color-danger); }

.pos-empty {
  grid-column: 1 / -1;
}

.cart-header-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
}

.cart-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.cart-count {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.cart-items {
  overflow-y: auto;
  padding: 0.375rem 0;
  max-height: 50vh;
}

.cart-empty {
  text-align: center;
  padding: 2.5rem 0.875rem;
}

.cart-empty-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 0.875rem;
  border-radius: var(--radius-full);
  background: var(--color-bg-subtle);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.cart-empty-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.cart-empty-subtext {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0.625rem;
  align-items: center;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cart-item-info {
  min-width: 0;
}

.cart-item-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-price {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 1px;
}

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  padding: 2px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: var(--transition-fast);
  position: relative;
}

.qty-btn::before {
  content: '';
  position: absolute;
  inset: -8px;
}

.qty-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.qty-value {
  font-size: 0.8125rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  color: var(--color-text);
}

.cart-item-total {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 56px;
  text-align: right;
}

.cart-item-remove {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  position: relative;
}

.cart-item-remove::before {
  content: '';
  position: absolute;
  inset: -8px;
}

.cart-item-remove:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.cart-footer {
  border-top: 1px solid var(--color-border);
  padding: 0.875rem 1rem;
  background: var(--color-bg-elevated);
  flex-shrink: 0;
}

.cart-summary {
  margin-bottom: 0.875rem;
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1875rem 0;
  font-size: 0.8125rem;
}

.cart-summary-row.total {
  padding: 0.5rem 0;
  margin-top: 0.375rem;
  border-top: 1px solid var(--color-border);
}

.cart-summary-label {
  color: var(--color-text-secondary);
}

.cart-summary-row.total .cart-summary-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.cart-summary-value {
  font-weight: 500;
  color: var(--color-text);
}

.cart-summary-value.discount {
  color: var(--color-danger);
}

.cart-summary-row.total .cart-summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.payment-method {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.375rem;
  margin-bottom: 0.625rem;
}

.payment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.5rem 0.375rem;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.payment-btn i {
  font-size: 0.9375rem;
}

.payment-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.payment-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.complete-btn {
  height: 44px;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.hold-btn {
  width: 100%;
  font-size: 0.8125rem;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 991.98px) {
  .pos-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
  .pos-container {
    height: auto;
  }
  .pos-cart {
    margin-top: 0.75rem;
    order: -1;
  }
  .pos-cart .card {
    max-height: 50vh;
  }
}
</style>
