<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales Report</h1>
        <p class="page-subtitle">Analyze sales performance over time</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm">
          <i class="bi bi-download"></i>
          Export CSV
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <StatCard title="Total Sales" :displayValue="formatCurrency(summary.totalSales)" icon="bi bi-currency-dollar" variant="primary" />
      </div>
      <div class="col-md-3">
        <StatCard title="Transactions" :displayValue="String(summary.transactionCount)" icon="bi bi-receipt" variant="success" />
      </div>
      <div class="col-md-3">
        <StatCard title="Average" :displayValue="formatCurrency(summary.averageTransaction)" icon="bi bi-graph-up" variant="info" />
      </div>
      <div class="col-md-3">
        <StatCard title="Discounts" :displayValue="formatCurrency(summary.totalDiscount)" icon="bi bi-tag" variant="warning" />
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchReport" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchReport" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Cashier</th>
              <th class="text-end">Amount</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="sales.length === 0">
              <td colspan="6">
                <EmptyState icon="bi bi-graph-up" title="No sales data" description="Sales data will appear here" />
              </td>
            </tr>
            <tr v-else v-for="row in sales" :key="row.id">
              <td class="fw-semibold">{{ row.saleNumber }}</td>
              <td>{{ row.customer?.name || 'Walk-in' }}</td>
              <td>{{ row.cashier?.firstName }} {{ row.cashier?.lastName }}</td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.totalAmount) }}</td>
              <td>
                <span class="text-mono">{{ row.paymentMethod }}</span>
              </td>
              <td class="text-muted">{{ formatDate(row.saleDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import StatCard from '../components/common/StatCard.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const sales = ref([]);
const loading = ref(false);
const summary = ref({ totalSales: 0, transactionCount: 0, averageTransaction: 0, totalDiscount: 0 });
const filters = ref({ startDate: '', endDate: '' });

const fetchReport = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/reports/sales', { params: filters.value });
    sales.value = data.data.sales;
    summary.value = data.data.summary;
  } catch (err) { console.error(err); } finally { loading.value = false; }
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
  padding: 1rem 1.5rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 180px 180px;
  gap: 0.75rem;
  align-items: center;
  max-width: 400px;
}

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
