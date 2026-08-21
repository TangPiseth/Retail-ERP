<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Stock Movements</h1>
        <p class="page-subtitle">Complete history of all inventory changes</p>
      </div>
      <div class="page-actions">
        <router-link to="/inventory" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left"></i>
          Back to Inventory
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <select v-model="filters.movementType" class="form-select" @change="fetchMovements">
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="adjustment">Adjustment</option>
            <option value="return">Return</option>
          </select>
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchMovements" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchMovements" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-end">Previous</th>
              <th class="text-end">Change</th>
              <th class="text-end">New Stock</th>
              <th>Type</th>
              <th>Reason</th>
              <th>User</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="movements.length === 0">
              <td colspan="8">
                <EmptyState icon="bi bi-arrow-left-right" title="No movements yet" />
              </td>
            </tr>
            <tr v-else v-for="row in movements" :key="row.id">
              <td class="fw-semibold">{{ row.product?.name }}</td>
              <td class="text-end text-muted">{{ row.previousStock }}</td>
              <td class="text-end">
                <span :class="row.change >= 0 ? 'change-positive' : 'change-negative'">
                  {{ row.change >= 0 ? '+' : '' }}{{ row.change }}
                </span>
              </td>
              <td class="text-end fw-semibold">{{ row.newStock }}</td>
              <td>
                <BaseBadge :variant="typeVariant(row.movementType)">{{ row.movementType }}</BaseBadge>
              </td>
              <td class="text-muted">{{ row.reason || '—' }}</td>
              <td>{{ row.user?.firstName }} {{ row.user?.lastName }}</td>
              <td class="text-muted">{{ formatDate(row.createdAt) }}</td>
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
import { formatDate } from '../utils/format';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';

const movements = ref([]);
const loading = ref(false);
const filters = ref({ movementType: '', startDate: '', endDate: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });

const typeVariant = (type) => {
  const map = { purchase: 'success', sale: 'primary', adjustment: 'warning', return: 'info' };
  return map[type] || 'secondary';
};

const fetchMovements = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/inventory/movements', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, ...filters.value },
    });
    movements.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch movements:', err);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchMovements();
};

onMounted(fetchMovements);
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
  grid-template-columns: 200px 180px 180px;
  gap: 0.75rem;
  align-items: center;
}

.card-footer-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.change-positive {
  color: var(--color-success);
  font-weight: 600;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.change-negative {
  color: var(--color-danger);
  font-weight: 600;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
