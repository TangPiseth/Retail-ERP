<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Product Detail</h1>
        <p class="page-subtitle">View product information and inventory</p>
      </div>
      <div class="page-actions">
        <router-link to="/products" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left"></i>
          Back
        </router-link>
        <router-link v-if="product" :to="`/products/${product.id}/edit`" class="btn btn-primary btn-sm">
          <i class="bi bi-pencil"></i>
          Edit
        </router-link>
        <button v-if="product" class="btn btn-outline-danger btn-sm" @click="confirmDeleteDialog?.show()">
          <i class="bi bi-trash"></i>
          Delete
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <template v-else-if="product">
      <div class="detail-grid">
        <div class="detail-main">
          <div class="card">
            <div class="card-header">
              <div class="detail-title-row">
                <div class="product-avatar-lg">
                  <i class="bi bi-box"></i>
                </div>
                <div>
                  <h6 class="card-title">{{ product.name }}</h6>
                  <div class="product-sku">{{ product.sku }}</div>
                </div>
                <div class="detail-badges">
                  <BaseBadge v-if="product.category" variant="primary" icon="bi bi-tag">
                    {{ product.category.name }}
                  </BaseBadge>
                  <BaseBadge v-if="product.brand" variant="info" icon="bi bi-bookmark">
                    {{ product.brand.name }}
                  </BaseBadge>
                  <BaseBadge :variant="product.isActive ? 'success' : 'secondary'">
                    {{ product.isActive ? 'Active' : 'Inactive' }}
                  </BaseBadge>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">SKU</span>
                  <span class="info-value mono">{{ product.sku }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Barcode</span>
                  <span class="info-value mono">{{ product.barcode || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Category</span>
                  <span class="info-value">{{ product.category?.name || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Brand</span>
                  <span class="info-value">{{ product.brand?.name || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Unit</span>
                  <span class="info-value">{{ product.unit ? `${product.unit.name} (${product.unit.shortName})` : '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Supplier</span>
                  <span class="info-value">{{ product.supplier?.companyName || '—' }}</span>
                </div>
              </div>
              <div v-if="product.description" class="description-block">
                <span class="info-label">Description</span>
                <p class="description-text">{{ product.description }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Inventory</h6>
            </div>
            <div class="card-body">
              <div class="inventory-stats">
                <div class="stat-card-mini">
                  <div class="stat-icon" :class="stockStatusClass">
                    <i :class="stockStatusIcon"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ product.inventory?.currentQuantity || 0 }}</span>
                    <span class="stat-label">Current Stock</span>
                  </div>
                </div>
                <div class="stat-card-mini">
                  <div class="stat-icon stat-icon-info">
                    <i class="bi bi-arrow-down-circle"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ product.inventory?.totalReceived || 0 }}</span>
                    <span class="stat-label">Total Received</span>
                  </div>
                </div>
                <div class="stat-card-mini">
                  <div class="stat-icon stat-icon-primary">
                    <i class="bi bi-arrow-up-circle"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ product.inventory?.totalSold || 0 }}</span>
                    <span class="stat-label">Total Sold</span>
                  </div>
                </div>
                <div class="stat-card-mini">
                  <div class="stat-icon stat-icon-warning">
                    <i class="bi bi-sliders"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ product.inventory?.totalAdjusted || 0 }}</span>
                    <span class="stat-label">Total Adjusted</span>
                  </div>
                </div>
              </div>
              <div class="stock-thresholds">
                <div class="threshold-item">
                  <span class="info-label">Min stock level</span>
                  <span class="info-value">{{ product.minStock || 0 }}</span>
                </div>
                <div class="threshold-item">
                  <span class="info-label">Max stock level</span>
                  <span class="info-value">{{ product.maxStock || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-sidebar">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Pricing</h6>
            </div>
            <div class="card-body">
              <div class="pricing-rows">
                <div class="pricing-row">
                  <span class="pricing-label">Cost price</span>
                  <span class="pricing-value">{{ formatCurrency(product.costPrice) }}</span>
                </div>
                <div class="pricing-row">
                  <span class="pricing-label">Selling price</span>
                  <span class="pricing-value pricing-value-highlight">{{ formatCurrency(product.sellingPrice) }}</span>
                </div>
                <div class="pricing-row">
                  <span class="pricing-label">Tax rate</span>
                  <span class="pricing-value">{{ formatPercent(product.taxRate) }}</span>
                </div>
                <div class="pricing-row pricing-row-total">
                  <span class="pricing-label">Profit margin</span>
                  <span class="pricing-value" :class="profitMargin >= 0 ? 'text-success' : 'text-danger'">
                    {{ formatCurrency(profitMargin) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Timestamps</h6>
            </div>
            <div class="card-body">
              <div class="pricing-rows">
                <div class="pricing-row">
                  <span class="pricing-label">Created</span>
                  <span class="pricing-value">{{ formatDateTime(product.createdAt) }}</span>
                </div>
                <div class="pricing-row">
                  <span class="pricing-label">Updated</span>
                  <span class="pricing-value">{{ formatDateTime(product.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-5">
      <EmptyState icon="bi bi-box" title="Product not found" description="The product you're looking for doesn't exist or has been deleted.">
        <template #action>
          <router-link to="/products" class="btn btn-primary btn-sm">
            <i class="bi bi-arrow-left"></i> Back to Products
          </router-link>
        </template>
      </EmptyState>
    </div>

    <ConfirmDialog
      ref="confirmDeleteDialog"
      dialogId="deleteProductDetailDialog"
      title="Delete product"
      message="This action cannot be undone. The product and all its data will be permanently removed."
      confirmText="Delete"
      confirmClass="btn-danger"
      icon="bi bi-trash"
      iconColor="text-danger"
      @confirm="handleDelete"
    />
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { formatCurrency, formatPercent, formatDateTime } from '../utils/format';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseToast from '../components/common/BaseToast.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import EmptyState from '../components/common/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const toastRef = ref(null);
const confirmDeleteDialog = ref(null);
const product = ref(null);
const loading = ref(false);

const profitMargin = computed(() => {
  if (!product.value) return 0;
  return parseFloat(product.value.sellingPrice) - parseFloat(product.value.costPrice);
});

const stockStatusClass = computed(() => {
  if (!product.value) return 'stat-icon-success';
  const qty = product.value.inventory?.currentQuantity || 0;
  if (qty === 0) return 'stat-icon-danger';
  if (qty <= (product.value.minStock || 10)) return 'stat-icon-warning';
  return 'stat-icon-success';
});

const stockStatusIcon = computed(() => {
  if (!product.value) return 'bi bi-check-circle';
  const qty = product.value.inventory?.currentQuantity || 0;
  if (qty === 0) return 'bi bi-x-circle';
  if (qty <= (product.value.minStock || 10)) return 'bi bi-exclamation-triangle';
  return 'bi bi-check-circle';
});

const fetchProduct = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/products/${route.params.id}`);
    product.value = data.data;
  } catch (err) {
    toastRef.value?.add('Failed to load product', 'error');
    console.error('Failed to fetch product:', err);
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  try {
    await api.delete(`/products/${product.value.id}`);
    toastRef.value?.add('Product deleted successfully', 'success');
    router.push('/products');
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to delete product', 'error');
  }
};

onMounted(() => {
  fetchProduct();
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

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0.75rem;
  align-items: start;
}

.detail-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  padding: 0.875rem 1.25rem;
}

.card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.product-avatar-lg {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.product-sku {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  margin-top: 1px;
}

.detail-badges {
  display: flex;
  gap: 0.375rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.info-label {
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
}

.info-value {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}

.info-value.mono {
  font-family: var(--font-mono);
}

.description-block {
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border);
}

.description-text {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0.375rem 0 0 0;
  line-height: 1.5;
}

.inventory-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card-mini {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-icon-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.stat-icon-danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.stat-icon-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon-info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.stat-icon-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.stock-thresholds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border);
}

.threshold-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.pricing-rows {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.pricing-label {
  color: var(--color-text-secondary);
}

.pricing-value {
  font-weight: 500;
  color: var(--color-text);
}

.pricing-value-highlight {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.pricing-row-total {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.125rem;
}

.pricing-row-total .pricing-label {
  font-weight: 600;
  color: var(--color-text);
}

@media (max-width: 991.98px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .inventory-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 575.98px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .inventory-stats {
    grid-template-columns: 1fr;
  }
  .detail-badges {
    margin-left: 0;
  }
}
</style>
