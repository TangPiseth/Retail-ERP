<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Products</h1>
        <p class="page-subtitle">Manage your product catalog and inventory</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm" @click="exportProducts" :disabled="exporting">
          <i class="bi bi-download"></i>
          {{ exporting ? 'Exporting…' : 'Export' }}
        </button>
        <router-link to="/products/create" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg"></i>
          Add Product
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <div class="filter-search">
            <SearchInput v-model="search" placeholder="Search by name, SKU, or barcode..." @search="fetchProducts" />
          </div>
          <select v-model="filters.categoryId" class="form-select" @change="fetchProducts">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <select v-model="filters.brandId" class="form-select" @change="fetchProducts">
            <option value="">All Brands</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
          </select>
          <select v-model="filters.stockStatus" class="form-select" @change="fetchProducts">
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
              <th class="text-end">Cost</th>
              <th class="text-end">Price</th>
              <th class="text-end">Stock</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7">
                <div class="skeleton-table">
                  <div v-for="i in 5" :key="i" class="skeleton-row">
                    <div class="skeleton-cell skeleton-product">
                      <div class="skeleton-avatar"></div>
                      <div class="skeleton-text-group">
                        <div class="skeleton-line skeleton-line-md"></div>
                        <div class="skeleton-line skeleton-line-sm"></div>
                      </div>
                    </div>
                    <div class="skeleton-cell skeleton-badge">
                      <div class="skeleton-line skeleton-line-xs"></div>
                    </div>
                    <div class="skeleton-cell skeleton-number">
                      <div class="skeleton-line skeleton-line-sm"></div>
                    </div>
                    <div class="skeleton-cell skeleton-number">
                      <div class="skeleton-line skeleton-line-sm"></div>
                    </div>
                    <div class="skeleton-cell skeleton-number">
                      <div class="skeleton-line skeleton-line-sm"></div>
                    </div>
                    <div class="skeleton-cell skeleton-badge">
                      <div class="skeleton-line skeleton-line-xs"></div>
                    </div>
                    <div class="skeleton-cell skeleton-actions">
                      <div class="skeleton-btn"></div>
                      <div class="skeleton-btn"></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="7">
                <EmptyState icon="bi bi-box" title="No products found" description="Create your first product to get started">
                  <template #action>
                    <router-link to="/products/create" class="btn btn-primary btn-sm">
                      <i class="bi bi-plus-lg"></i> Add Product
                    </router-link>
                  </template>
                </EmptyState>
              </td>
            </tr>
            <tr v-else v-for="row in products" :key="row.id">
              <td>
                <div class="product-cell">
                  <div class="product-avatar">
                    <i class="bi bi-box"></i>
                  </div>
                  <div>
                    <router-link :to="`/products/${row.id}`" class="fw-semibold text-decoration-none product-name">{{ row.name }}</router-link>
                    <div class="product-meta">{{ row.sku }}</div>
                  </div>
                </div>
              </td>
              <td>
                <BaseBadge variant="primary">{{ row.category?.name }}</BaseBadge>
              </td>
              <td class="text-end">{{ formatCurrency(row.costPrice) }}</td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.sellingPrice) }}</td>
              <td class="text-end">
                <span :class="stockClass(row)">
                  <i :class="stockIcon(row)" class="me-1"></i>{{ row.inventory?.currentQuantity || 0 }}
                </span>
              </td>
              <td>
                <BaseBadge :variant="row.isActive ? 'success' : 'secondary'">
                  {{ row.isActive ? 'Active' : 'Inactive' }}
                </BaseBadge>
              </td>
              <td class="text-end">
                <div class="action-buttons">
                  <router-link :to="`/products/${row.id}/edit`" class="action-btn" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button class="action-btn action-btn-danger" @click="deleteProduct(row.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
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

    <ConfirmDialog
      ref="confirmDialogRef"
      dialogId="deleteProductDialog"
      title="Delete product"
      message="This action cannot be undone. The product and all its data will be permanently removed."
      confirmText="Delete"
      confirmClass="btn-danger"
      icon="bi bi-trash"
      iconColor="text-danger"
      @confirm="confirmDelete"
    />
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { exportCsv } from '../utils/exportCsv';
import SearchInput from '../components/common/SearchInput.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseToast from '../components/common/BaseToast.vue';

const route = useRoute();
const products = ref([]);
const categories = ref([]);
const brands = ref([]);
const loading = ref(false);
const search = ref('');
const filters = ref({ categoryId: '', brandId: '', stockStatus: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
const confirmDialogRef = ref(null);
const toastRef = ref(null);
const productToDelete = ref(null);
const exporting = ref(false);

const stockClass = (row) => {
  const qty = row.inventory?.currentQuantity || 0;
  if (qty === 0) return 'stock-out';
  if (qty <= (row.minStock || 10)) return 'stock-low';
  return 'stock-good';
};

const stockIcon = (row) => {
  const qty = row.inventory?.currentQuantity || 0;
  if (qty === 0) return 'bi bi-x-circle-fill';
  if (qty <= (row.minStock || 10)) return 'bi bi-exclamation-triangle-fill';
  return 'bi bi-check-circle-fill';
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: search.value,
      ...filters.value,
    };
    const { data } = await api.get('/products', { params });
    products.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch products:', err);
  } finally {
    loading.value = false;
  }
};

const fetchFilters = async () => {
  try {
    const [catRes, brandRes] = await Promise.all([
      api.get('/categories', { params: { limit: 100 } }),
      api.get('/brands', { params: { limit: 100 } }),
    ]);
    categories.value = catRes.data.data;
    brands.value = brandRes.data.data;
  } catch (err) {
    console.error('Failed to fetch filters:', err);
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchProducts();
};

const deleteProduct = (id) => {
  productToDelete.value = id;
  confirmDialogRef.value?.show();
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;
  try {
    await api.delete(`/products/${productToDelete.value}`);
    toastRef.value?.add('Product deleted successfully', 'success');
    fetchProducts();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to delete product', 'error');
  } finally {
    productToDelete.value = null;
  }
};

const exportProducts = async () => {
  exporting.value = true;
  try {
    const { data } = await api.get('/products', {
      params: {
        search: search.value,
        categoryId: filters.value.categoryId,
        brandId: filters.value.brandId,
        stockStatus: filters.value.stockStatus,
        limit: 100000,
      },
    });
    const rows = (data.data || []).map((p) => [
      p.sku,
      p.name,
      p.category?.name || '',
      p.brand?.name || '',
      p.unit?.shortName || p.unit?.name || '',
      p.costPrice,
      p.sellingPrice,
      p.inventory?.currentQuantity || 0,
      p.isActive ? 'Active' : 'Inactive',
    ]);
    exportCsv('products.csv', ['SKU', 'Name', 'Category', 'Brand', 'Unit', 'Cost Price', 'Selling Price', 'Stock', 'Status'], rows);
  } catch (err) {
    console.error('Failed to export products:', err);
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  if (route.query.search) {
    search.value = route.query.search;
  }
  fetchProducts();
  fetchFilters();
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
  grid-template-columns: 1fr 170px 170px 170px;
  gap: 0.625rem;
  align-items: center;
}

.filter-search {
  width: 100%;
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
  color: var(--color-text);
  font-size: 0.8125rem;
}

.product-name:hover {
  color: var(--color-primary);
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
  font-size: 0.8125rem;
}

.stock-low {
  color: var(--color-warning);
  font-weight: 600;
  font-size: 0.8125rem;
}

.stock-good {
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.8125rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.8125rem;
  text-decoration: none;
  position: relative;
}

.action-btn::before {
  content: '';
  position: absolute;
  inset: -6px;
}

.action-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn-danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.skeleton-table {
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
}

.skeleton-cell {
  display: flex;
  align-items: center;
}

.skeleton-product {
  gap: 0.625rem;
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skeleton-line {
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line-xs {
  width: 48px;
  height: 16px;
}

.skeleton-line-sm {
  width: 64px;
  height: 14px;
}

.skeleton-line-md {
  width: 120px;
  height: 14px;
}

.skeleton-number {
  justify-content: flex-end;
}

.skeleton-badge {
  justify-content: flex-start;
}

.skeleton-actions {
  justify-content: flex-end;
  gap: 0.25rem;
}

.skeleton-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
