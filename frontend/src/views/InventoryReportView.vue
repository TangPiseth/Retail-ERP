<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Inventory Report</h1>
        <p class="page-subtitle">Stock valuation and alerts</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm" @click="exportInventoryReport" :disabled="exporting">
          <i class="bi bi-download"></i>
          {{ exporting ? 'Exporting…' : 'Export' }}
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <StatCard title="Inventory Value" :displayValue="formatCurrency(report.totalValue)" icon="bi bi-currency-dollar" variant="primary" />
      </div>
      <div class="col-md-4">
        <StatCard title="Low Stock Items" :displayValue="String(report.lowStock?.length || 0)" icon="bi bi-exclamation-triangle" variant="warning" />
      </div>
      <div class="col-md-4">
        <StatCard title="Out of Stock" :displayValue="String(report.outOfStock?.length || 0)" icon="bi bi-x-circle" variant="danger" />
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Low Stock Products</h6>
              <p class="card-subtitle">Products below minimum stock</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="!report.lowStock?.length" class="empty-state">
              <i class="bi bi-check-circle"></i>
              <p>All products are well stocked</p>
            </div>
            <div v-else class="stock-list">
              <div v-for="row in report.lowStock" :key="row.id" class="stock-item">
                <div class="stock-item-info">
                  <div class="stock-item-name">{{ row.name }}</div>
                  <div class="stock-item-meta">{{ row.category?.name }}</div>
                </div>
                <div class="stock-item-values">
                  <div class="stock-current stock-low">{{ row.inventory?.currentQuantity }}</div>
                  <div class="stock-min">Min: {{ row.minStock }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <div>
              <h6 class="card-title">Out of Stock Products</h6>
              <p class="card-subtitle">Products requiring immediate restock</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="!report.outOfStock?.length" class="empty-state">
              <i class="bi bi-check-circle"></i>
              <p>No products are out of stock</p>
            </div>
            <div v-else class="stock-list">
              <div v-for="row in report.outOfStock" :key="row.id" class="stock-item">
                <div class="stock-item-info">
                  <div class="stock-item-name">{{ row.name }}</div>
                  <div class="stock-item-meta">{{ row.category?.name }}</div>
                </div>
                <div class="stock-item-values">
                  <div class="stock-current stock-out">0</div>
                  <div class="stock-min">Min: {{ row.minStock }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { exportCsv } from '../utils/exportCsv';
import StatCard from '../components/common/StatCard.vue';

const report = ref({ totalValue: 0, totalProducts: 0, lowStock: [], outOfStock: [] });
const exporting = ref(false);

const fetchReport = async () => {
  try {
    const { data } = await api.get('/reports/inventory');
    report.value = data.data;
  } catch (err) { console.error(err); }
};

const exportInventoryReport = () => {
  const rows = [
    ...report.value.lowStock.map((p) => [
      p.name,
      p.category?.name || '',
      p.inventory?.currentQuantity || 0,
      p.minStock || 0,
      'Low Stock',
    ]),
    ...report.value.outOfStock.map((p) => [
      p.name,
      p.category?.name || '',
      0,
      p.minStock || 0,
      'Out of Stock',
    ]),
  ];
  exportCsv('inventory-report.csv', ['Product', 'Category', 'Current Quantity', 'Min Stock', 'Status'], rows);
};

onMounted(fetchReport);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 0.5rem;
}

.card-header {
  padding: 1.25rem 1.5rem;
}

.card-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0.125rem 0 0 0;
  font-weight: 400;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.empty-state i {
  font-size: 2rem;
  color: var(--color-success);
  margin-bottom: 0.5rem;
  display: block;
}

.empty-state p {
  margin: 0;
}

.stock-list {
  display: flex;
  flex-direction: column;
}

.stock-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-item-info {
  flex: 1;
  min-width: 0;
}

.stock-item-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.stock-item-meta {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}

.stock-item-values {
  text-align: right;
}

.stock-current {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stock-low {
  color: var(--color-warning);
}

.stock-out {
  color: var(--color-danger);
}

.stock-min {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}
</style>
