<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Suppliers</h1>
        <p class="page-subtitle">Manage your supplier network</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" @click="openAddModal">
          <i class="bi bi-plus-lg"></i>
          Add Supplier
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="search-filter">
          <SearchInput v-model="search" placeholder="Search by company, phone, or email..." @search="fetchSuppliers" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th class="text-end">Products</th>
              <th class="text-end">Purchases</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="suppliers.length === 0">
              <td colspan="7">
                <EmptyState icon="bi bi-truck" title="No suppliers yet" description="Add your first supplier to get started" />
              </td>
            </tr>
            <tr v-else v-for="row in suppliers" :key="row.id">
              <td>
                <div class="supplier-cell">
                  <div class="supplier-avatar">
                    <i class="bi bi-building"></i>
                  </div>
                  <div>
                    <div class="supplier-name">{{ row.companyName }}</div>
                    <div v-if="row.taxNumber" class="supplier-meta">Tax: {{ row.taxNumber }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span v-if="row.contactPerson">{{ row.contactPerson }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span v-if="row.phone" class="text-mono">{{ row.phone }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span v-if="row.email" class="text-mono">{{ row.email }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="text-end">
                <BaseBadge variant="primary">{{ row._count?.products || 0 }}</BaseBadge>
              </td>
              <td class="text-end">
                <BaseBadge variant="success">{{ row._count?.purchases || 0 }}</BaseBadge>
              </td>
              <td class="text-end">
                <div class="action-buttons">
                  <button class="action-btn" @click="editSupplier(row)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn action-btn-danger" @click="deleteSupplier(row.id)" title="Delete">
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

    <BaseModal ref="modalRef" modalId="supplierModal" :title="editing ? 'Edit Supplier' : 'Add Supplier'" size="md">
      <form @submit.prevent="saveSupplier">
        <BaseInput v-model="form.companyName" label="Company Name" required />
        <BaseInput v-model="form.contactPerson" label="Contact Person" />
        <BaseInput v-model="form.phone" label="Phone" />
        <BaseInput v-model="form.email" label="Email" type="email" />
        <BaseInput v-model="form.address" label="Address" />
        <BaseInput v-model="form.taxNumber" label="Tax/VAT Number" />
      </form>
      <template #footer>
        <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" @click="saveSupplier" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
          {{ editing ? 'Update' : 'Create' }}
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      ref="confirmDialogRef"
      dialogId="deleteSupplierDialog"
      title="Delete supplier"
      message="This action cannot be undone. The supplier will be permanently removed."
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
import SearchInput from '../components/common/SearchInput.vue';
import BasePagination from '../components/common/BasePagination.vue';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseInput from '../components/common/BaseInput.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import BaseToast from '../components/common/BaseToast.vue';

const suppliers = ref([]);
const loading = ref(false);
const search = ref('');
const editing = ref(false);
const editId = ref(null);
const saving = ref(false);
const modalRef = ref(null);
const confirmDialogRef = ref(null);
const toastRef = ref(null);
const supplierToDelete = ref(null);
const form = ref({ companyName: '', contactPerson: '', phone: '', email: '', address: '', taxNumber: '' });
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 20 });

const fetchSuppliers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/suppliers', {
      params: { page: pagination.value.currentPage, limit: pagination.value.limit, search: search.value },
    });
    suppliers.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    console.error('Failed to fetch suppliers:', err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  editing.value = false;
  editId.value = null;
  form.value = { companyName: '', contactPerson: '', phone: '', email: '', address: '', taxNumber: '' };
  modalRef.value?.show();
};

const editSupplier = (supplier) => {
  editing.value = true;
  editId.value = supplier.id;
  form.value = {
    companyName: supplier.companyName,
    contactPerson: supplier.contactPerson || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    address: supplier.address || '',
    taxNumber: supplier.taxNumber || '',
  };
  modalRef.value?.show();
};

const saveSupplier = async () => {
  saving.value = true;
  try {
    if (editing.value) {
      await api.put(`/suppliers/${editId.value}`, form.value);
    } else {
      await api.post('/suppliers', form.value);
    }
    modalRef.value?.hide();
    toastRef.value?.add(editing.value ? 'Supplier updated' : 'Supplier created', 'success');
    editing.value = false;
    form.value = { companyName: '', contactPerson: '', phone: '', email: '', address: '', taxNumber: '' };
    fetchSuppliers();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to save supplier', 'error');
  } finally {
    saving.value = false;
  }
};

const deleteSupplier = (id) => {
  supplierToDelete.value = id;
  confirmDialogRef.value?.show();
};

const confirmDelete = async () => {
  if (!supplierToDelete.value) return;
  try {
    await api.delete(`/suppliers/${supplierToDelete.value}`);
    toastRef.value?.add('Supplier deleted', 'success');
    fetchSuppliers();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to delete supplier', 'error');
  } finally {
    supplierToDelete.value = null;
  }
};

const handlePageChange = (page) => {
  pagination.value.currentPage = page;
  fetchSuppliers();
};

onMounted(fetchSuppliers);
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

.supplier-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.supplier-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-warning-light);
  color: var(--color-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  flex-shrink: 0;
}

.supplier-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.supplier-meta {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
  font-family: var(--font-mono);
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
