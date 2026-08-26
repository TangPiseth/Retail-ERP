<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Profit Report</h1>
        <p class="page-subtitle">Detailed profit & loss analysis</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm" @click="exportProfitReport" :disabled="exporting">
          <i class="bi bi-download"></i>
          {{ exporting ? 'Exporting…' : 'Export' }}
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <StatCard title="Revenue" :displayValue="formatCurrency(report.revenue)" icon="bi bi-currency-dollar" variant="primary" />
      </div>
      <div class="col-md-2">
        <StatCard title="COGS" :displayValue="formatCurrency(report.cogs)" icon="bi bi-box" variant="secondary" />
      </div>
      <div class="col-md-2">
        <StatCard title="Gross Profit" :displayValue="formatCurrency(report.grossProfit)" icon="bi bi-graph-up" variant="success" />
      </div>
      <div class="col-md-2">
        <StatCard title="Expenses" :displayValue="formatCurrency(report.expenses)" icon="bi bi-wallet" variant="warning" />
      </div>
      <div class="col-md-2">
        <StatCard title="Discounts" :displayValue="formatCurrency(report.discounts)" icon="bi bi-tag" variant="info" />
      </div>
      <div class="col-md-2">
        <StatCard title="Net Profit" :displayValue="formatCurrency(report.netProfit)" icon="bi bi-trophy" :variant="report.netProfit >= 0 ? 'success' : 'danger'" />
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchReport" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchReport" />
        </div>
      </div>
      <div class="card-body">
        <p class="text-muted mb-0" style="font-size: 0.8125rem;">
          Net profit is calculated as: Revenue − COGS − Expenses. COGS is calculated from actual product cost recorded in each sale.
        </p>
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

const report = ref({ revenue: 0, cogs: 0, grossProfit: 0, discounts: 0, expenses: 0, netProfit: 0 });
const exporting = ref(false);
const filters = ref({ startDate: '', endDate: '' });

const fetchReport = async () => {
  try {
    const { data } = await api.get('/reports/profit', { params: filters.value });
    report.value = data.data;
  } catch (err) { console.error(err); }
};

const exportProfitReport = () => {
  const rows = [
    ['Revenue', report.value.revenue],
    ['COGS', report.value.cogs],
    ['Gross Profit', report.value.grossProfit],
    ['Discounts', report.value.discounts],
    ['Expenses', report.value.expenses],
    ['Net Profit', report.value.netProfit],
  ];
  exportCsv('profit-report.csv', ['Metric', 'Amount'], rows);
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
</style>
