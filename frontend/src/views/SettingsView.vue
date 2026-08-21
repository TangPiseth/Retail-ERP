<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your store and system preferences</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" @click="saveSettings" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-check-lg"></i>
          Save Changes
        </button>
      </div>
    </div>

    <div class="settings-layout">
      <div class="settings-sidebar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="settings-nav-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="settings-content">
        <div class="card">
          <div class="card-header">
            <div>
              <h6 class="card-title">{{ currentTabLabel }}</h6>
              <p class="card-subtitle">{{ currentTabDescription }}</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="activeTab === 'store'" class="form-grid">
              <BaseInput v-model="settings.storeName" label="Store Name" />
              <BaseInput v-model="settings.storeAddress" label="Address" />
              <BaseInput v-model="settings.storePhone" label="Phone" />
              <BaseInput v-model="settings.storeEmail" label="Email" type="email" />
              <BaseInput v-model="settings.currency" label="Currency" />
              <BaseInput v-model="settings.currencySymbol" label="Currency Symbol" />
            </div>
            <div v-if="activeTab === 'pos'" class="form-grid">
              <BaseInput v-model.number="settings.taxRate" label="Default Tax Rate (%)" type="number" />
              <BaseInput v-model="settings.invoicePrefix" label="Invoice Prefix" />
            </div>
            <div v-if="activeTab === 'inventory'" class="form-grid">
              <BaseInput v-model.number="settings.lowStockThreshold" label="Low Stock Threshold" type="number" />
              <div class="form-check form-switch mt-3">
                <input v-model="settings.allowNegativeInventory" class="form-check-input" type="checkbox" id="negInv" />
                <label class="form-check-label" for="negInv">Allow Negative Inventory</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import BaseInput from '../components/common/BaseInput.vue';

const activeTab = ref('store');
const saving = ref(false);
const settings = ref({
  storeName: '', storeAddress: '', storePhone: '', storeEmail: '',
  currency: 'USD', currencySymbol: '$', taxRate: 0, invoicePrefix: 'INV',
  lowStockThreshold: 10, allowNegativeInventory: false,
});

const tabs = [
  { key: 'store', label: 'Store', icon: 'bi bi-shop', description: 'Basic store information' },
  { key: 'pos', label: 'POS', icon: 'bi bi-upc-scan', description: 'Point of sale configuration' },
  { key: 'inventory', label: 'Inventory', icon: 'bi bi-archive', description: 'Stock management rules' },
];

const currentTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label || '');
const currentTabDescription = computed(() => tabs.find(t => t.key === activeTab.value)?.description || '');

const fetchSettings = async () => {
  try {
    const { data } = await api.get('/settings');
    if (data.data) settings.value = { ...settings.value, ...data.data };
  } catch (err) { console.error(err); }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.put('/settings', settings.value);
  } catch (err) { console.error(err); } finally { saving.value = false; }
};

onMounted(fetchSettings);
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

.settings-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.25rem;
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 450;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.settings-nav-item:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.settings-nav-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: rgba(22, 163, 74, 0.15);
  font-weight: 500;
}

.settings-nav-item i {
  font-size: 0.9375rem;
  width: 16px;
}

.card-subtitle {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary);
  margin: 0.0625rem 0 0 0;
  font-weight: 400;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
}

@media (max-width: 768px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
