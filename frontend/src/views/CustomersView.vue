<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Customers</h1>
        <p class="page-subtitle">Manage your customer database</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline-primary btn-sm" @click="exportCustomers" :disabled="exporting">
          <i class="bi bi-download"></i>
          {{ exporting ? 'Exporting…' : 'Export' }}
        </button>
        <button class="btn btn-primary btn-sm" @click="openAddModal">
          <i class="bi bi-plus-lg"></i>
          Add Customer
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="search-filter">
          <SearchInput v-model="search" placeholder="Search by name, phone, or email..." @search="fetchCustomers" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Loyalty Points</th>
              <th class="text-end">Total Spent</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="customers.length === 0">
              <td colspan="6">
                <EmptyState icon="bi bi-people" title="No customers yet" description="Add your first customer to get started" />
              </td>
            </tr>
            <tr v-else v-for="row in customers" :key="row.id">
              <td>
                <div class="customer-cell">
                  <div class="customer-avatar">
                    <span>{{ getInitials(row.name) }}</span>
                  </div>
                  <div>
                    <div class="customer-name">{{ row.name }}</div>
                    <div class="customer-meta">{{ row._count?.sales || 0 }} orders</div>
                  </div>
                </div>
              </td>
              <td>
                <span v-if="row.phone" class="text-mono">{{ row.phone }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span v-if="row.email" class="text-mono">{{ row.email }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <BaseBadge variant="info">{{ row.loyaltyPoints }} pts</BaseBadge>
              </td>
              <td class="text-end fw-semibold">{{ formatCurrency(row.totalSpent) }}</td>
              <td class="text-end">
                <div class="action-buttons">
                  <button class="action-btn" @click="editCustomer(row)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn action-btn-danger" @click="deleteCustomer(row.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
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

    <BaseModal ref="modalRef" modalId="customerModal" :title="editing ? 'Edit Customer' : 'Add Customer'" size="md">
      <form @submit.prevent="saveCustomer">
        <BaseInput v-model="form.name" label="Name" required :error="errors.name" />
        <BaseInput v-model="form.phone" label="Phone" />
        <BaseInput v-model="form.email" label="Email" type="email" />
        <BaseInput v-model="form.address" label="Address" />
      </form>
      <template #footer>
        <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" @click="saveCustomer" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
          {{ editing ? 'Update' : 'Create' }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      ref="confirmDialogRef"
      dialogId="deleteCustomerDialog"
      title="Delete customer"
      message="This action cannot be undone. The customer will be permanently removed."
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
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { exportCsv } from '../utils/exportCsv';
import SearchInput from '../components/common/SearchInput.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseInput from '../components/common/BaseInput.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseToast from '../components/common/BaseToast.vue';

const customers = ref([]);
const loading = ref(false);
const search = ref('');
const editing = ref(false);
const editId = ref(null);
const saving = ref(false);
const errors = ref({});
const modalRef = ref(null);
const confirmDialogRef = ref(null);
const toastRef = ref(null);
const customerToDelete = ref(null);
const form = ref({ name: '', phone: '', email: '', address: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });
const exporting = ref(false);

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const fetchCustomers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/customers', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, search: search.value },
    });
    customers.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch customers:', err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  editing.value = false;
  editId.value = null;
  form.value = { name: '', phone: '', email: '', address: '' };
  errors.value = {};
  modalRef.value?.show();
};

const editCustomer = (customer) => {
  editing.value = true;
  editId.value = customer.id;
  form.value = { name: customer.name, phone: customer.phone || '', email: customer.email || '', address: customer.address || '' };
  modalRef.value?.show();
};

const saveCustomer = async () => {
  saving.value = true;
  errors.value = {};
  try {
    if (editing.value) {
      await api.put(`/customers/${editId.value}`, form.value);
    } else {
      await api.post('/customers', form.value);
    }
    modalRef.value?.hide();
    toastRef.value?.add(editing.value ? 'Customer updated' : 'Customer created', 'success');
    editing.value = false;
    form.value = { name: '', phone: '', email: '', address: '' };
    fetchCustomers();
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = Object.fromEntries(err.response.data.errors.map(e => [e.path, e.msg]));
    }
    toastRef.value?.add(err.response?.data?.message || 'Failed to save customer', 'error');
  } finally {
    saving.value = false;
  }
};

const deleteCustomer = (id) => {
  customerToDelete.value = id;
  confirmDialogRef.value?.show();
};

const confirmDelete = async () => {
  if (!customerToDelete.value) return;
  try {
    await api.delete(`/customers/${customerToDelete.value}`);
    toastRef.value?.add('Customer deleted', 'success');
    fetchCustomers();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to delete customer', 'error');
  } finally {
    customerToDelete.value = null;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchCustomers();
};

const exportCustomers = async () => {
  exporting.value = true;
  try {
    const { data } = await api.get('/customers', {
      params: { search: search.value, limit: 100000 },
    });
    const rows = (data.data || []).map((c) => [
      c.name,
      c.phone || '',
      c.email || '',
      c.address || '',
      c.loyaltyPoints || 0,
      c.totalSpent || 0,
    ]);
    exportCsv('customers.csv', ['Name', 'Phone', 'Email', 'Address', 'Loyalty Points', 'Total Spent'], rows);
  } catch (err) {
    console.error('Failed to export customers:', err);
  } finally {
    exporting.value = false;
  }
};

onMounted(fetchCustomers);
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

.search-filter {
  max-width: 400px;
}

.card-footer-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.customer-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.customer-meta {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
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

.action-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn-danger:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
