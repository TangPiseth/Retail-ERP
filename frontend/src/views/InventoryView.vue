<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventory</h1>
        <p class="page-subtitle">Track and manage your stock levels</p>
      </div>
      <div class="page-actions">
        <router-link to="/inventory/movements" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left-right"></i>
          Movements
        </router-link>
        <button class="btn btn-primary btn-sm" @click="openAdjustModal">
          <i class="bi bi-sliders"></i>
          Adjust Stock
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <div class="search-filter">
            <SearchInput v-model="search" placeholder="Search inventory..." @search="fetchInventory" />
          </div>
          <select v-model="stockStatus" class="form-select" @change="fetchInventory">
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th class="text-end">Current Stock</th>
              <th class="text-end">Total Received</th>
              <th class="text-end">Total Sold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="inventory.length === 0">
              <td colspan="6">
                <EmptyState icon="bi bi-archive" title="No inventory items" />
              </td>
            </tr>
            <tr v-else v-for="row in inventory" :key="row.id">
              <td>
                <div class="product-cell">
                  <div class="product-avatar">
                    <i class="bi bi-box"></i>
                  </div>
                  <div>
                    <div class="product-name">{{ row.product?.name }}</div>
                    <div class="product-meta">{{ row.product?.sku }}</div>
                  </div>
                </div>
              </td>
              <td>
                <BaseBadge variant="primary">{{ row.product?.category?.name }}</BaseBadge>
              </td>
              <td class="text-end">
                <span :class="row.isOut ? 'stock-out' : row.isLow ? 'stock-low' : 'stock-good'">
                  {{ row.currentQuantity }}
                </span>
              </td>
              <td class="text-end text-muted">{{ row.totalReceived }}</td>
              <td class="text-end text-muted">{{ row.totalSold }}</td>
              <td>
                <BaseBadge :variant="row.isOut ? 'danger' : row.isLow ? 'warning' : 'success'">
                  {{ row.isOut ? 'Out of Stock' : row.isLow ? 'Low Stock' : 'In Stock' }}
                </BaseBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="pagination.totalPages > 1"
        class="card-footer-pagination"
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-items="pagination.totalItems"
        :limit="pagination.limit"
        @page-change="handlePageChange"
      />
    </div>

    <BaseModal ref="adjustModalRef" modalId="adjustModal" title="Adjust Stock" size="md">
      <BaseSelect v-model="adjustForm.productId" label="Product" :options="productOptions" placeholder="Select product" />
      <BaseInput v-model.number="adjustForm.newQuantity" label="New Quantity" type="number" min="0" />
      <BaseInput v-model="adjustForm.reason" label="Reason" />
      <template #footer>
        <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" @click="submitAdjust">Adjust</button>
      </template>
    </BaseModal>
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import SearchInput from '../components/common/SearchInput.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import BaseToast from '../components/common/BaseToast.vue';

const inventory = ref([]);
const loading = ref(false);
const search = ref('');
const stockStatus = ref('');
const adjustModalRef = ref(null);
const toastRef = ref(null);
const adjustForm = ref({ productId: '', newQuantity: 0, reason: '' });
const productOptions = ref([]);
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });

const fetchInventory = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/inventory', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, search: search.value, stockStatus: stockStatus.value },
    });
    inventory.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch inventory:', err);
  } finally {
    loading.value = false;
  }
};

const fetchProducts = async () => {
  try {
    const { data } = await api.get('/products', { params: { limit: 200 } });
    productOptions.value = data.data.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }));
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }
};

const openAdjustModal = () => {
  adjustModalRef.value?.show();
};

const submitAdjust = async () => {
  try {
    await api.post('/inventory/adjust', adjustForm.value);
    adjustModalRef.value?.hide();
    adjustForm.value = { productId: '', newQuantity: 0, reason: '' };
    toastRef.value?.add('Stock adjusted successfully', 'success');
    fetchInventory();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to adjust stock', 'error');
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchInventory();
};

onMounted(() => {
  fetchInventory();
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

.card-header {
  padding: 0.875rem 1.25rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 0.625rem;
  align-items: center;
}

.card-footer-pagination {
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.product-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.product-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}

.product-meta {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 1px;
  font-family: var(--font-mono);
}

.stock-out {
  color: var(--color-danger);
  font-weight: 600;
}

.stock-low {
  color: var(--color-warning);
  font-weight: 600;
}

.stock-good {
  color: var(--color-text);
  font-weight: 500;
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
