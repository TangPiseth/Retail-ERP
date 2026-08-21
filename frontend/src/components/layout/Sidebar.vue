<template>
  <aside :class="['sidebar', { collapsed, show: showMobile }]">
    <div class="sidebar-brand">
      <router-link to="/dashboard" class="brand-link">
        <div class="brand-logo">
          <span class="brand-logo-text">R</span>
        </div>
        <div class="brand-text">
          <span class="brand-name">RetailERP</span>
          <span class="brand-tag">Management</span>
        </div>
      </router-link>
      <button class="collapse-btn" @click="$emit('toggle')">
        <i :class="collapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
      </button>
    </div>

    <div class="sidebar-scroll" @click="$event.target.closest('.sidebar-link') && $emit('close-mobile')">
      <div v-for="section in visibleSections" :key="section.title" class="sidebar-section">
        <span class="sidebar-section-title">{{ section.title }}</span>
        <ul class="nav flex-column">
          <SidebarItem
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
          />
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import SidebarItem from './SidebarItem.vue';
import { useAuthStore } from '../../stores/authStore';

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  showMobile: { type: Boolean, default: false },
});

defineEmits(['toggle', 'close-mobile']);

const authStore = useAuthStore();

const allSections = [
  {
    title: 'Main',
    roles: ['Admin', 'Manager', 'Cashier', 'Inventory Staff'],
    items: [
      { to: '/dashboard', icon: 'bi bi-grid', label: 'Dashboard', roles: ['Admin', 'Manager', 'Cashier', 'Inventory Staff'] },
      { to: '/products', icon: 'bi bi-box', label: 'Products', roles: ['Admin', 'Manager', 'Inventory Staff'] },
      { to: '/inventory', icon: 'bi bi-archive', label: 'Inventory', roles: ['Admin', 'Manager', 'Inventory Staff'] },
      { to: '/sales/pos', icon: 'bi bi-upc-scan', label: 'Point of Sale', roles: ['Admin', 'Manager', 'Cashier'] },
      { to: '/sales', icon: 'bi bi-receipt', label: 'Sales', roles: ['Admin', 'Manager', 'Cashier'] },
      { to: '/purchases', icon: 'bi bi-cart', label: 'Purchases', roles: ['Admin', 'Manager'] },
    ],
  },
  {
    title: 'Contacts',
    roles: ['Admin', 'Manager', 'Cashier', 'Inventory Staff'],
    items: [
      { to: '/customers', icon: 'bi bi-people', label: 'Customers', roles: ['Admin', 'Manager', 'Cashier'] },
      { to: '/suppliers', icon: 'bi bi-truck', label: 'Suppliers', roles: ['Admin', 'Manager', 'Inventory Staff'] },
    ],
  },
  {
    title: 'Finance',
    roles: ['Admin', 'Manager'],
    items: [
      { to: '/expenses', icon: 'bi bi-wallet', label: 'Expenses', roles: ['Admin', 'Manager'] },
      { to: '/reports/sales', icon: 'bi bi-bar-chart', label: 'Sales Report', roles: ['Admin', 'Manager'] },
      { to: '/reports/profit', icon: 'bi bi-graph-up', label: 'Profit Report', roles: ['Admin', 'Manager'] },
      { to: '/reports/inventory', icon: 'bi bi-clipboard-data', label: 'Inventory Report', roles: ['Admin', 'Manager'] },
    ],
  },
  {
    title: 'System',
    roles: ['Admin'],
    items: [
      { to: '/users', icon: 'bi bi-person-gear', label: 'Users', roles: ['Admin'] },
      { to: '/settings', icon: 'bi bi-gear', label: 'Settings', roles: ['Admin'] },
    ],
  },
];

const userRole = computed(() => authStore.userRole || '');

const visibleSections = computed(() => {
  return allSections
    .filter(section => section.roles.includes(userRole.value))
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(userRole.value)),
    }))
    .filter(section => section.items.length > 0);
});
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  height: 100dvh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  z-index: 1040;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease-out;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-brand {
  height: var(--navbar-height);
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.brand-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.brand-tag {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
  margin-top: 1px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.collapse-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.6875rem;
}

.collapse-btn:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 3px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 2px;
}

.sidebar-section {
  padding: 0.25rem 0.75rem;
}

.sidebar-section-title {
  display: block;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-tertiary);
  padding: 0.5rem 0.625rem 0.25rem;
  margin-bottom: 0.125rem;
}

:deep(.sidebar-link) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  margin: 1px 0;
  border-radius: var(--radius-md);
  color: var(--color-text-sidebar);
  font-size: 0.875rem;
  font-weight: 450;
  text-decoration: none;
  transition: var(--transition-fast);
  position: relative;
  min-height: 40px;
}

:deep(.sidebar-link:hover) {
  background-color: var(--color-bg-sidebar-hover);
  color: var(--color-text);
}

:deep(.sidebar-link.active) {
  background-color: var(--color-bg-sidebar-active);
  color: var(--color-text-sidebar-active);
  font-weight: 500;
}

:deep(.sidebar-link.active .sidebar-icon) {
  color: var(--color-primary);
}

:deep(.sidebar-icon) {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.9375rem;
  color: var(--color-text-tertiary);
  transition: var(--transition-fast);
}

:deep(.sidebar-link:hover .sidebar-icon) {
  color: var(--color-text-secondary);
}

:deep(.sidebar-text) {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.sidebar-badge) {
  background: var(--color-primary);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-full);
  min-width: 16px;
  text-align: center;
}

.collapsed :deep(.sidebar-section-title),
.collapsed :deep(.sidebar-text),
.collapsed :deep(.sidebar-badge),
.collapsed .brand-text {
  display: none;
}

.collapsed :deep(.sidebar-link) {
  justify-content: center;
  padding: 0.5rem;
  min-height: 40px;
}

.collapsed .sidebar-brand {
  padding: 0;
  justify-content: center;
}

.collapsed .collapse-btn {
  display: none;
}

@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.show {
    transform: translateX(0);
  }
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  .collapse-btn {
    display: none;
  }
}
</style>
