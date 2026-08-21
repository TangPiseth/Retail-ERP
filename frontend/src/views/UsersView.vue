<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage users and permissions</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" @click="openModal">
          <i class="bi bi-plus-lg"></i>
          Add User
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <LoadingSpinner />
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6">
                <EmptyState icon="bi bi-people" title="No users yet" />
              </td>
            </tr>
            <tr v-else v-for="row in users" :key="row.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    <span>{{ getInitials(row.firstName + ' ' + row.lastName) }}</span>
                  </div>
                  <div>
                    <div class="user-name">{{ row.firstName }} {{ row.lastName }}</div>
                    <div v-if="row.phone" class="user-meta">{{ row.phone }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="text-mono">{{ row.email }}</span>
              </td>
              <td>
                <BaseBadge :variant="row.role?.name === 'Admin' ? 'danger' : 'primary'">{{ row.role?.name }}</BaseBadge>
              </td>
              <td>
                <BaseBadge :variant="row.isActive ? 'success' : 'secondary'">{{ row.isActive ? 'Active' : 'Inactive' }}</BaseBadge>
              </td>
              <td class="text-muted">{{ row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never' }}</td>
              <td class="text-end">
                <div class="action-buttons">
                  <button class="action-btn" @click="editUser(row)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="action-btn" @click="toggleActive(row)" :title="row.isActive ? 'Deactivate' : 'Activate'">
                    <i :class="row.isActive ? 'bi bi-person-dash' : 'bi bi-person-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal ref="modalRef" modalId="userModal" :title="editing ? 'Edit User' : 'Add User'" size="md">
      <BaseInput v-model="form.firstName" label="First Name" required />
      <BaseInput v-model="form.lastName" label="Last Name" required />
      <BaseInput v-model="form.email" label="Email" type="email" required />
      <BaseInput v-if="!editing" v-model="form.password" label="Password" type="password" required />
      <BaseSelect v-model="form.roleId" label="Role" :options="roleOptions" placeholder="Select role" />
      <template #footer>
        <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button class="btn btn-primary" @click="saveUser">{{ editing ? 'Update' : 'Create' }}</button>
      </template>
    </BaseModal>
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { formatDate } from '../utils/format';
import BaseBadge from '../components/common/BaseBadge.vue';
import BaseModal from '../components/common/BaseModal.vue';
import BaseInput from '../components/common/BaseInput.vue';
import BaseSelect from '../components/common/BaseSelect.vue';
import EmptyState from '../components/common/EmptyState.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import BaseToast from '../components/common/BaseToast.vue';

const users = ref([]);
const roles = ref([]);
const loading = ref(false);
const modalRef = ref(null);
const toastRef = ref(null);
const editing = ref(false);
const editId = ref(null);
const form = ref({ firstName: '', lastName: '', email: '', password: '', roleId: '' });

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const roleOptions = computed(() => roles.value.map(r => ({ value: r.id, label: r.name })));

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/users');
    users.value = data.data;
  } catch (err) { console.error(err); } finally { loading.value = false; }
};

const fetchRoles = async () => {
  try {
    const { data } = await api.get('/users/roles');
    roles.value = data.data;
  } catch (err) { console.error(err); }
};

const openModal = () => {
  editing.value = false;
  editId.value = null;
  form.value = { firstName: '', lastName: '', email: '', password: '', roleId: '' };
  modalRef.value?.show();
};

const editUser = (user) => {
  editing.value = true;
  editId.value = user.id;
  form.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    roleId: user.roleId,
  };
  modalRef.value?.show();
};

const saveUser = async () => {
  try {
    if (editing.value) {
      const data = { ...form.value };
      if (!data.password) delete data.password;
      await api.put(`/users/${editId.value}`, data);
    } else {
      await api.post('/users', form.value);
    }
    modalRef.value?.hide();
    toastRef.value?.add(editing.value ? 'User updated' : 'User created', 'success');
    editing.value = false;
    form.value = { firstName: '', lastName: '', email: '', password: '', roleId: '' };
    fetchUsers();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to save user', 'error');
  }
};

const toggleActive = async (user) => {
  try {
    await api.put(`/users/${user.id}`, { isActive: !user.isActive });
    toastRef.value?.add(`User ${user.isActive ? 'deactivated' : 'activated'}`, 'success');
    fetchUsers();
  } catch (err) {
    toastRef.value?.add(err.response?.data?.message || 'Failed to update user', 'error');
  }
};

onMounted(() => { fetchUsers(); fetchRoles(); });
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
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

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.user-meta {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
  font-family: var(--font-mono);
}

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
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
</style>
