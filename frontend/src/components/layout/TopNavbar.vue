<template>
  <nav class="top-navbar">
    <div class="navbar-left">
      <button class="icon-btn d-lg-none" aria-label="Open navigation menu" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list"></i>
      </button>
      <div class="search-box">
        <i class="bi bi-search search-icon"></i>
        <input
          v-model="globalSearch"
          type="text"
          class="search-input"
          placeholder="Search products, customers, orders..."
          @keyup.enter="handleGlobalSearch"
        />
        <span class="search-shortcut">Ctrl K</span>
      </div>
    </div>

    <div class="navbar-right">
      <button class="icon-btn" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon'"></i>
      </button>

      <button class="icon-btn d-lg-none" aria-label="Search" @click="showMobileSearch = true">
        <i class="bi bi-search"></i>
      </button>

      <div class="notification-wrapper">
        <button class="icon-btn" @click="showNotifications = !showNotifications" aria-label="View notifications">
          <i class="bi bi-bell"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>

        <transition name="fade">
          <div v-if="showNotifications" class="notification-dropdown">
            <div class="notification-header">
              <span class="notification-title">Notifications</span>
              <button class="link-btn">Mark all read</button>
            </div>
            <div class="notification-list">
              <div v-if="notifications.length === 0" class="notification-empty">
                No new notifications
              </div>
              <div v-for="n in notifications" :key="n.id" class="notification-item" :class="{ unread: !n.isRead }">
                <div class="notification-icon" :class="`bg-${n.type || 'info'}`">
                  <i :class="getNotifIcon(n.type)"></i>
                </div>
                <div class="notification-content">
                  <p class="notification-text">{{ n.message }}</p>
                  <span class="notification-time">{{ n.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="divider"></div>

      <div class="dropdown">
        <button ref="dropdownRef" class="user-menu" data-bs-toggle="dropdown" type="button">
          <div class="avatar">
            <span>{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <i class="bi bi-chevron-down user-arrow"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li class="dropdown-header">
            <div class="user-card">
              <div class="avatar avatar-lg">
                <span>{{ userInitials }}</span>
              </div>
              <div>
                <div class="user-card-name">{{ userName }}</div>
                <div class="user-card-email">{{ userEmail }}</div>
              </div>
            </div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li><router-link to="/settings" class="dropdown-item"><i class="bi bi-gear"></i>Settings</router-link></li>
          <li><button class="dropdown-item" @click="logout"><i class="bi bi-box-arrow-right"></i>Sign out</button></li>
        </ul>
      </div>
    </div>

    <div v-if="showMobileSearch" class="mobile-search-overlay">
      <div class="mobile-search-bar">
        <i class="bi bi-search mobile-search-icon"></i>
        <input
          ref="mobileSearchInput"
          type="text"
          class="mobile-search-input"
          placeholder="Search products, customers, orders..."
          @keyup.escape="showMobileSearch = false"
        />
        <button class="mobile-search-close" @click="showMobileSearch = false" aria-label="Close search">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

defineEmits(['toggle-sidebar']);

const router = useRouter();
const authStore = useAuthStore();
const isDark = ref(false);
const showNotifications = ref(false);
const showMobileSearch = ref(false);
const mobileSearchInput = ref(null);
const globalSearch = ref('');
const notifications = ref([]);
const unreadCount = ref(0);
const dropdownRef = ref(null);

const userName = computed(() => authStore.userName || 'User');
const userRole = computed(() => authStore.userRole || '');
const userEmail = computed(() => authStore.user?.email || '');
const userInitials = computed(() => authStore.userInitials || 'U');

watch(showMobileSearch, async (val) => {
  if (val) {
    await nextTick();
    mobileSearchInput.value?.focus();
  }
});

onMounted(async () => {
  const bootstrap = await import('bootstrap');
  if (dropdownRef.value) {
    new bootstrap.Dropdown(dropdownRef.value);
  }
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-bs-theme', isDark.value ? 'dark' : 'light');
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

const handleGlobalSearch = () => {
  if (globalSearch.value.trim()) {
    router.push({ path: '/products', query: { search: globalSearch.value.trim() } });
    globalSearch.value = '';
  }
};

const getNotifIcon = (type) => {
  const icons = {
    warning: 'bi bi-exclamation-triangle',
    error: 'bi bi-x-circle',
    success: 'bi bi-check-circle',
    info: 'bi bi-info-circle',
  };
  return icons[type] || icons.info;
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  isDark.value = true;
  document.documentElement.setAttribute('data-bs-theme', 'dark');
}
</script>

<style scoped>
.top-navbar {
  height: var(--navbar-height);
  height: calc(var(--navbar-height) + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  background-color: var(--color-bg-navbar);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 1030;
  padding-left: calc(1.25rem + env(safe-area-inset-left, 0px));
  padding-right: calc(1.25rem + env(safe-area-inset-right, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  max-width: 420px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  position: relative;
  font-size: 0.9375rem;
}

.icon-btn:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  background: var(--color-danger);
  color: #fff;
  font-size: 0.5625rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-bg-navbar);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 360px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--color-text-tertiary);
  font-size: 0.8125rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 64px 0 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:focus {
  background: var(--color-bg-elevated);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
}

.search-shortcut {
  position: absolute;
  right: 6px;
  padding: 0.0625rem 0.375rem;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.5625rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  pointer-events: none;
}

.notification-wrapper {
  position: relative;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 340px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1050;
  overflow: hidden;
}

.notification-header {
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-title {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.notification-list {
  max-height: 340px;
  overflow-y: auto;
}

.notification-empty {
  padding: 1.5rem 0.875rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.notification-item {
  display: flex;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition-fast);
  cursor: pointer;
}

.notification-item:hover {
  background: var(--color-bg-subtle);
}

.notification-item.unread {
  background: var(--color-primary-light);
}

.notification-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.8125rem;
}

.notification-icon.bg-info { background: var(--color-info-light); color: var(--color-info); }
.notification-icon.bg-success { background: var(--color-success-light); color: var(--color-success); }
.notification-icon.bg-warning { background: var(--color-warning-light); color: var(--color-warning); }
.notification-icon.bg-danger { background: var(--color-danger-light); color: var(--color-danger); }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 0.375rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.user-menu:hover {
  background: var(--color-bg-subtle);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.6875rem;
  flex-shrink: 0;
}

.avatar-lg {
  width: 36px;
  height: 36px;
  font-size: 0.8125rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: left;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}

.user-role {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  margin-top: 1px;
}

.user-arrow {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  transition: var(--transition-fast);
}

.user-menu[aria-expanded="true"] .user-arrow {
  transform: rotate(180deg);
}

.dropdown-header {
  padding: 0.625rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.user-card-name {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
}

.user-card-email {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}

.mobile-search-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-elevated);
  z-index: 1060;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
}

.mobile-search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 0.75rem;
}

.mobile-search-icon {
  color: var(--color-text-tertiary);
  font-size: 1rem;
  flex-shrink: 0;
}

.mobile-search-input {
  flex: 1;
  height: 44px;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--color-text);
  outline: none;
}

.mobile-search-input::placeholder {
  color: var(--color-text-tertiary);
}

.mobile-search-close {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.mobile-search-close:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

@media (max-width: 767.98px) {
  .search-box {
    display: none;
  }
  .user-info {
    display: none;
  }
}
</style>
