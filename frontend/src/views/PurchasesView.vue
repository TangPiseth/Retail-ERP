<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Purchases</h1>
        <p class="page-subtitle">Manage purchase orders and inventory receiving</p>
      </div>
      <div class="page-actions">
        <router-link to="/purchases/create" class="btn btn-primary btn-sm">
          <i class="bi bi-plus-lg"></i>
          New Purchase
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <select v-model="filters.status" class="form-select" @change="fetchPurchases">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchPurchases" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchPurchases" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Purchase #</th>
              <th>Supplier</th>
              <th class="text-end">Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="purchases.length === 0">
              <td colspan="7">
                <EmptyState icon="bi bi-cart" title="No purchases yet" description="Create your first purchase order" />
              </td>
            </tr>
            <tr v-else v-for="row in purchases" :key="row.id">
              <td>
                <router-link :to="`/purchases/${row.id}`" class="fw-semibold text-decoration-none invoice-link">{{ row.purchaseNumber }}</router-link>
              </td>
              <td>{{ row.supplier?.companyName }}</td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.totalAmount) }}</td>
              <td>
                <BaseBadge :variant="row.status === 'Received' ? 'success' : row.status === 'Cancelled' ? 'danger' : 'warning'">{{ row.status }}</BaseBadge>
              </td>
              <td>
                <BaseBadge :variant="row.paymentStatus === 'Paid' ? 'success' : 'warning'">{{ row.paymentStatus }}</BaseBadge>
              </td>
              <td class="text-muted">{{ formatDate(row.purchaseDate) }}</td>
              <td class="text-end">
                <button v-if="row.status === 'Pending'" class="btn btn-sm btn-success" @click="receivePurchase(row.id)">
                  <i class="bi bi-check-lg"></i>
                  Receive
                </button>
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
      dialogId="receivePurchaseDialog"
      title="Receive purchase"
      message="This will mark the purchase as received and increase inventory stock."
      confirmText="Receive"
      confirmClass="btn-success"
      icon="bi bi-box-seam"
      iconColor="text-success"
      @confirm="confirmReceive"
    />
    <BaseToast ref="toastRef" />
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
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseToast from '../components/common/BaseToast.vue';

const purchases = ref([]);
const loading = ref(false);
const filters = ref({ status: '', startDate: '', endDate: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
const confirmDialogRef = ref(null);
const toastRef = ref(null);
const purchaseToReceive = ref(null);

const fetchPurchases = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/purchases', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, ...filters.value },
    });
    purchases.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch purchases:', err);
  } finally {
    loading.value = false;
  }
};

const receivePurchase = (id) => {
  purchaseToReceive.value = id;
  confirmDialogRef.value?.show();
};

const confirmReceive = async () => {
  if (!purchaseToReceive.value) return;
  try {
    await api.post(`/purchases/${purchaseToReceive.value}/receive`);
    toastRef.value?.add('Purchase received and inventory updated', 'success');
    fetchPurchases();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to receive purchase', 'error');
  } finally {
    purchaseToReceive.value = null;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchPurchases();
};

onMounted(fetchPurchases);
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

.invoice-link {
  color: var(--color-text);
  font-size: 0.8125rem;
}

.invoice-link:hover {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
