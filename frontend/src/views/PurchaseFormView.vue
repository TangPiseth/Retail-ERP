<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Create Purchase</h1>
        <p class="page-subtitle">Add a new purchase order from a supplier</p>
      </div>
      <div class="page-actions">
        <router-link to="/purchases" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left"></i>
          Back
        </router-link>
      </div>
    </div>

    <div class="purchase-grid">
      <div class="purchase-main">
        <div class="card">
          <div class="card-header">
            <h6 class="card-title">Purchase items</h6>
          </div>
          <div class="card-body">
            <div class="items-table">
              <div class="items-header">
                <span>Product</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
                <span></span>
              </div>
              <div v-for="(item, index) in form.items" :key="index" class="item-row">
                <select v-model="item.productId" class="form-select">
                  <option value="">Select product</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} ({{ p.sku }})</option>
                </select>
                <input v-model.number="item.quantity" type="number" class="form-control" min="1" placeholder="1" />
                <input v-model.number="item.unitPrice" type="number" class="form-control" min="0" step="0.01" placeholder="0.00" />
                <div class="item-total">{{ formatCurrency(item.quantity * item.unitPrice || 0) }}</div>
                <button class="btn btn-sm btn-light" @click="removeItem(index)" :disabled="form.items.length <= 1" aria-label="Remove item">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <button class="btn btn-outline-primary btn-sm mt-3" @click="addItem">
              <i class="bi bi-plus-lg"></i>
              Add item
            </button>
          </div>
        </div>
      </div>

      <div class="purchase-sidebar">
        <div class="card">
          <div class="card-header">
            <h6 class="card-title">Supplier & details</h6>
          </div>
          <div class="card-body">
            <div class="form-fields">
              <div class="form-field">
                <label class="form-label">Supplier</label>
                <select v-model="form.supplierId" class="form-select">
                  <option value="">Select supplier</option>
                  <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.companyName }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Invoice number</label>
                <input v-model="form.invoiceNumber" type="text" class="form-control" placeholder="Supplier invoice #" />
              </div>
              <div class="form-field">
                <label class="form-label">Notes</label>
                <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Optional notes"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h6 class="card-title">Summary</h6>
          </div>
          <div class="card-body">
            <div class="summary-rows">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Discount</span>
                <div class="summary-input">
                  <input v-model.number="form.discountAmount" type="number" class="form-control form-control-sm" min="0" step="0.01" placeholder="0" />
                </div>
              </div>
              <div class="summary-row">
                <span class="summary-label">Tax</span>
                <div class="summary-input">
                  <input v-model.number="form.taxAmount" type="number" class="form-control form-control-sm" min="0" step="0.01" placeholder="0" />
                </div>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total</span>
                <span class="summary-value">{{ formatCurrency(total) }}</span>
              </div>
            </div>
            <button class="btn btn-primary w-100 mt-3" @click="submitPurchase" :disabled="submitting || !isValid">
              <span v-if="submitting" class="btn-spinner"></span>
              <i v-else class="bi bi-check-lg"></i>
              Create purchase
            </button>
          </div>
        </div>
      </div>
    </div>

    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import BaseToast from '../components/common/BaseToast.vue';

const router = useRouter();
const toastRef = ref(null);
const submitting = ref(false);
const suppliers = ref([]);
const products = ref([]);

const form = ref({
  supplierId: '',
  invoiceNumber: '',
  notes: '',
  discountAmount: 0,
  taxAmount: 0,
  items: [{ productId: '', quantity: 1, unitPrice: 0 }],
});

const subtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
});

const total = computed(() => {
  return subtotal.value - (form.value.discountAmount || 0) + (form.value.taxAmount || 0);
});

const isValid = computed(() => {
  if (!form.value.supplierId) return false;
  if (form.value.items.length === 0) return false;
  return form.value.items.every(item => item.productId && item.quantity > 0 && item.unitPrice > 0);
});

const addItem = () => {
  form.value.items.push({ productId: '', quantity: 1, unitPrice: 0 });
};

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
  }
};

const fetchSuppliers = async () => {
  try {
    const { data } = await api.get('/suppliers', { params: { limit: 100 } });
    suppliers.value = data.data;
  } catch (err) {
    console.error('Failed to fetch suppliers:', err);
  }
};

const fetchProducts = async () => {
  try {
    const { data } = await api.get('/products', { params: { limit: 200 } });
    products.value = data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
};

const submitPurchase = async () => {
  submitting.value = true;
  try {
    await api.post('/purchases', {
      supplierId: parseInt(form.value.supplierId),
      invoiceNumber: form.value.invoiceNumber || null,
      notes: form.value.notes || null,
      discountAmount: form.value.discountAmount || 0,
      taxAmount: form.value.taxAmount || 0,
      items: form.value.items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    });
    toastRef.value?.add('Purchase created successfully', 'success');
    router.push('/purchases');
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to create purchase', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchSuppliers();
  fetchProducts();
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.125rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 0.375rem;
}

.purchase-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0.75rem;
  align-items: start;
}

.purchase-main {
  min-width: 0;
}

.purchase-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.items-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.items-header {
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 40px;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 40px;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
}

.item-total {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.summary-label {
  color: var(--color-text-secondary);
}

.summary-value {
  font-weight: 500;
  color: var(--color-text);
}

.summary-row.total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.25rem;
}

.summary-row.total .summary-label {
  font-weight: 600;
  color: var(--color-text);
}

.summary-row.total .summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.summary-input {
  width: 100px;
}

.summary-input .form-control {
  text-align: right;
  height: 30px;
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
  .purchase-grid {
    grid-template-columns: 1fr;
  }
  .items-header,
  .item-row {
    grid-template-columns: 1.5fr 80px 100px 80px 36px;
  }
}
</style>
