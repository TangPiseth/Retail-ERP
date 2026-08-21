<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? 'Edit Product' : 'Create Product' }}</h1>
        <p class="page-subtitle">{{ isEdit ? 'Update product information' : 'Add a new product to your catalog' }}</p>
      </div>
      <div class="page-actions">
        <router-link to="/products" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left"></i>
          Back
        </router-link>
      </div>
    </div>

    <div v-if="loadingProduct" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <template v-else>
      <div class="product-grid">
        <div class="product-main">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Product information</h6>
            </div>
            <div class="card-body">
              <div class="form-fields">
                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label">Product name <span class="text-danger">*</span></label>
                    <input v-model="form.name" type="text" class="form-control" placeholder="Enter product name" />
                  </div>
                </div>

                <div class="form-row form-row-2">
                  <div class="form-field">
                    <label class="form-label">SKU <span class="text-danger">*</span></label>
                    <input v-model="form.sku" type="text" class="form-control" placeholder="e.g. PRD-001" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Barcode</label>
                    <input v-model="form.barcode" type="text" class="form-control" placeholder="Enter barcode" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label class="form-label">Description</label>
                    <textarea v-model="form.description" class="form-control" rows="3" placeholder="Product description (optional)"></textarea>
                  </div>
                </div>

                <div class="form-row form-row-2">
                  <div class="form-field">
                    <label class="form-label">Category <span class="text-danger">*</span></label>
                    <select v-model="form.categoryId" class="form-select">
                      <option value="">Select category</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Brand</label>
                    <select v-model="form.brandId" class="form-select">
                      <option value="">Select brand</option>
                      <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                    </select>
                  </div>
                </div>

                <div class="form-row form-row-2">
                  <div class="form-field">
                    <label class="form-label">Unit <span class="text-danger">*</span></label>
                    <select v-model="form.unitId" class="form-select">
                      <option value="">Select unit</option>
                      <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.shortName }})</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Supplier</label>
                    <select v-model="form.supplierId" class="form-select">
                      <option value="">Select supplier</option>
                      <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.companyName }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Pricing</h6>
            </div>
            <div class="card-body">
              <div class="form-fields">
                <div class="form-row form-row-3">
                  <div class="form-field">
                    <label class="form-label">Cost price <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input v-model.number="form.costPrice" type="number" class="form-control" min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Selling price <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input v-model.number="form.sellingPrice" type="number" class="form-control" min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Tax rate (%)</label>
                    <div class="input-group">
                      <input v-model.number="form.taxRate" type="number" class="form-control" min="0" max="100" step="0.01" placeholder="0" />
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="product-sidebar">
          <div class="card">
            <div class="card-header">
              <h6 class="card-title">Inventory</h6>
            </div>
            <div class="card-body">
              <div class="form-fields">
                <div class="form-field">
                  <label class="form-label">Minimum stock</label>
                  <input v-model.number="form.minStock" type="number" class="form-control" min="0" placeholder="0" />
                  <small class="form-hint">Alert when stock falls below this level</small>
                </div>
                <div class="form-field">
                  <label class="form-label">Maximum stock</label>
                  <input v-model.number="form.maxStock" type="number" class="form-control" min="0" placeholder="0" />
                  <small class="form-hint">Maximum stock capacity</small>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <button class="btn btn-primary w-100" @click="submitForm" :disabled="submitting || !isValid">
                <span v-if="submitting" class="btn-spinner"></span>
                <i v-else :class="isEdit ? 'bi bi-check-lg' : 'bi bi-plus-lg'"></i>
                {{ isEdit ? 'Update product' : 'Create product' }}
              </button>
              <router-link to="/products" class="btn btn-light w-100 mt-2">
                Cancel
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import BaseToast from '../components/common/BaseToast.vue';

const route = useRoute();
const router = useRouter();
const toastRef = ref(null);
const submitting = ref(false);
const loadingProduct = ref(false);

const categories = ref([]);
const brands = ref([]);
const units = ref([]);
const suppliers = ref([]);

const isEdit = computed(() => !!route.params.id);

const form = ref({
  name: '',
  sku: '',
  barcode: '',
  description: '',
  categoryId: '',
  brandId: '',
  unitId: '',
  supplierId: '',
  costPrice: 0,
  sellingPrice: 0,
  taxRate: 0,
  minStock: 0,
  maxStock: 0,
});

const isValid = computed(() => {
  return (
    form.value.name.trim() &&
    form.value.sku.trim() &&
    form.value.categoryId &&
    form.value.unitId &&
    form.value.costPrice > 0 &&
    form.value.sellingPrice > 0
  );
});

const fetchDropdowns = async () => {
  try {
    const [catRes, brandRes, unitRes, supplierRes] = await Promise.all([
      api.get('/categories', { params: { limit: 100 } }),
      api.get('/brands', { params: { limit: 100 } }),
      api.get('/units', { params: { limit: 100 } }),
      api.get('/suppliers', { params: { limit: 100 } }),
    ]);
    categories.value = catRes.data.data;
    brands.value = brandRes.data.data;
    units.value = unitRes.data.data;
    suppliers.value = supplierRes.data.data;
  } catch (err) {
    console.error('Failed to fetch dropdown data:', err);
  }
};

const fetchProduct = async () => {
  if (!route.params.id) return;
  loadingProduct.value = true;
  try {
    const { data } = await api.get(`/products/${route.params.id}`);
    const product = data.data;
    form.value = {
      name: product.name || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      unitId: product.unitId || '',
      supplierId: product.supplierId || '',
      costPrice: product.costPrice ? parseFloat(product.costPrice) : 0,
      sellingPrice: product.sellingPrice ? parseFloat(product.sellingPrice) : 0,
      taxRate: product.taxRate ? parseFloat(product.taxRate) : 0,
      minStock: product.minStock || 0,
      maxStock: product.maxStock || 0,
    };
  } catch (err) {
    toastRef.value?.add('Failed to load product', 'error');
    console.error('Failed to fetch product:', err);
  } finally {
    loadingProduct.value = false;
  }
};

const submitForm = async () => {
  submitting.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      sku: form.value.sku.trim(),
      barcode: form.value.barcode?.trim() || null,
      description: form.value.description?.trim() || null,
      categoryId: parseInt(form.value.categoryId),
      brandId: form.value.brandId ? parseInt(form.value.brandId) : null,
      unitId: parseInt(form.value.unitId),
      supplierId: form.value.supplierId ? parseInt(form.value.supplierId) : null,
      costPrice: parseFloat(form.value.costPrice),
      sellingPrice: parseFloat(form.value.sellingPrice),
      taxRate: parseFloat(form.value.taxRate) || 0,
      minStock: parseInt(form.value.minStock) || 0,
      maxStock: parseInt(form.value.maxStock) || 0,
    };

    if (isEdit.value) {
      await api.put(`/products/${route.params.id}`, payload);
      toastRef.value?.add('Product updated successfully', 'success');
    } else {
      await api.post('/products', payload);
      toastRef.value?.add('Product created successfully', 'success');
    }
    router.push('/products');
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to save product', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchDropdowns();
  if (isEdit.value) {
    await fetchProduct();
  }
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

.product-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 0.75rem;
  align-items: start;
}

.product-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-sidebar {
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

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-hint {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  margin-top: 0.125rem;
}

.input-group-text {
  font-size: 0.8125rem;
  background: var(--color-bg-subtle);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
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
  .product-grid {
    grid-template-columns: 1fr;
  }
  .form-row-3 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
