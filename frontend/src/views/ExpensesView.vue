<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Expenses</h1>
        <p class="page-subtitle">Track business expenses by category</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" @click="openModal">
          <i class="bi bi-plus-lg"></i>
          Add Expense
        </button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <StatCard title="Total Expenses" :displayValue="formatCurrency(totalExpenses)" icon="bi bi-wallet" variant="primary" />
      </div>
      <div class="col-md-3">
        <StatCard title="Transactions" :displayValue="String(expenses.length)" icon="bi bi-list-ul" variant="info" />
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="filters-row">
          <select v-model="filters.categoryId" class="form-select" @change="fetchExpenses">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <input v-model="filters.startDate" type="date" class="form-control" @change="fetchExpenses" />
          <input v-model="filters.endDate" type="date" class="form-control" @change="fetchExpenses" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th class="text-end">Amount</th>
              <th>Method</th>
              <th>Created By</th>
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
            <tr v-else-if="expenses.length === 0">
              <td colspan="7">
                <EmptyState icon="bi bi-wallet" title="No expenses yet" />
              </td>
            </tr>
            <tr v-else v-for="row in expenses" :key="row.id">
              <td>
                <BaseBadge variant="secondary">{{ row.category?.name }}</BaseBadge>
              </td>
              <td>{{ row.description }}</td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.amount) }}</td>
              <td>
                <span class="text-mono">{{ row.paymentMethod }}</span>
              </td>
              <td>{{ row.creator?.firstName }} {{ row.creator?.lastName }}</td>
              <td class="text-muted">{{ formatDate(row.expenseDate) }}</td>
              <td class="text-end">
                <button class="action-btn action-btn-danger" @click="deleteExpense(row.id)" title="Delete">
                  <i class="bi bi-trash"></i>
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

    <BaseModal ref="modalRef" modalId="expenseModal" title="Add Expense" size="md">
      <BaseSelect v-model="form.categoryId" label="Category" :options="categoryOptions" placeholder="Select category" />
      <BaseInput v-model="form.description" label="Description" />
      <BaseInput v-model.number="form.amount" label="Amount" type="number" step="0.01" />
      <BaseSelect v-model="form.paymentMethod" label="Payment Method" :options="[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'Bank Transfer', label: 'Bank Transfer' }]" />
      <BaseInput v-model="form.expenseDate" label="Date" type="date" />
      <BaseInput v-model="form.notes" label="Notes" />
      <template #footer>
        <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" @click="saveExpense">Save</button>
      </template>
    </BaseModal>

    <ConfirmDialog
      ref="confirmDialogRef"
      dialogId="deleteExpenseDialog"
      title="Delete expense"
      message="This action cannot be undone. The expense record will be permanently removed."
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
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import StatCard from '../components/common/StatCard.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseToast from '../components/common/BaseToast.vue';

const expenses = ref([]);
const categories = ref([]);
const loading = ref(false);
const filters = ref({ categoryId: '', startDate: '', endDate: '' });
const form = ref({ categoryId: '', description: '', amount: 0, paymentMethod: 'Cash', expenseDate: '', notes: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
const modalRef = ref(null);
const confirmDialogRef = ref(null);
const toastRef = ref(null);
const expenseToDelete = ref(null);

const categoryOptions = computed(() => categories.value.map(c => ({ value: c.id, label: c.name })));
const totalExpenses = computed(() => expenses.value.reduce((sum, e) => sum + Number(e.amount), 0));

const fetchExpenses = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/expenses', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, ...filters.value },
    });
    expenses.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch expenses:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/expense-categories');
    categories.value = data.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

const openModal = () => {
  form.value = { categoryId: '', description: '', amount: 0, paymentMethod: 'Cash', expenseDate: '', notes: '' };
  modalRef.value?.show();
};

const saveExpense = async () => {
  try {
    await api.post('/expenses', form.value);
    modalRef.value?.hide();
    toastRef.value?.add('Expense recorded', 'success');
    form.value = { categoryId: '', description: '', amount: 0, paymentMethod: 'Cash', expenseDate: '', notes: '' };
    fetchExpenses();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to save expense', 'error');
  }
};

const deleteExpense = (id) => {
  expenseToDelete.value = id;
  confirmDialogRef.value?.show();
};

const confirmDelete = async () => {
  if (!expenseToDelete.value) return;
  try {
    await api.delete(`/expenses/${expenseToDelete.value}`);
    toastRef.value?.add('Expense deleted', 'success');
    fetchExpenses();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to delete expense', 'error');
  } finally {
    expenseToDelete.value = null;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchExpenses();
};

onMounted(() => {
  fetchExpenses();
  fetchCategories();
});
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

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
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
}

.action-btn-danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}
</style>
