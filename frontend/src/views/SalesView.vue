<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sales History</h1>
        <p class="page-subtitle">View and manage all sales transactions</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm">
          <i class="bi bi-download"></i>
          Export
        </button>
        <router-link to="/sales/pos" class="btn btn-primary btn-sm">
          <i class="bi bi-upc-scan"></i>
          Open POS
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchSales" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchSales" />
          <select v-model="filters.status" class="form-select" @change="fetchSales">
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Held">Held</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="sales.length === 0">
              <td colspan="8">
                <EmptyState icon="bi bi-receipt" title="No sales yet" description="Completed sales will appear here" />
              </td>
            </tr>
            <tr v-else v-for="row in sales" :key="row.id">
              <td>
                <router-link :to="`/sales/${row.id}`" class="fw-semibold text-decoration-none invoice-link">{{ row.saleNumber }}</router-link>
              </td>
              <td>{{ row.customer?.name || 'Walk-in' }}</td>
              <td>{{ row.cashier?.firstName }} {{ row.cashier?.lastName }}</td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.totalAmount) }}</td>
              <td>
                <span class="text-mono">{{ row.paymentMethod }}</span>
              </td>
              <td>
                <BaseBadge :variant="row.status === 'Completed' ? 'success' : row.status === 'Cancelled' ? 'danger' : 'warning'">{{ row.status }}</BaseBadge>
              </td>
              <td>
                <BaseBadge :variant="row.paymentStatus === 'Paid' ? 'success' : 'warning'">{{ row.paymentStatus }}</BaseBadge>
              </td>
              <td class="text-muted">{{ formatDate(row.saleDate) }}</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const sales = ref([]);
const loading = ref(false);
const filters = ref({ startDate: '', endDate: '', status: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });

const fetchSales = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/sales', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, ...filters.value },
    });
    sales.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch sales:', err);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchSales();
};

onMounted(fetchSales);
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
  grid-template-columns: 180px 180px 200px;
  gap: 0.75rem;
  align-items: center;
}

.card-footer-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.invoice-link {
  color: var(--color-text);
  font-size: 0.8125rem;
}

.invoice-link:hover {
  color: var(--color-primary);
}

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
