<template>
  <div class="login-page">
    <button class="theme-toggle-btn" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <i :class="isDark ? 'bi bi-sun' : 'bi bi-moon'"></i>
    </button>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-logo">
            <span>R</span>
          </div>
          <h1 class="login-title">RetailERP</h1>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <div v-if="error" class="alert-error">
          <i class="bi bi-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-field">
            <label class="form-label">Email address</label>
            <div class="input-wrapper">
              <i class="bi bi-envelope input-icon"></i>
              <input
                v-model="email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div class="form-field">
            <div class="label-row">
              <label class="form-label">Password</label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            <div class="input-wrapper">
              <i class="bi bi-lock input-icon"></i>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                required
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <div class="demo-section">
          <p class="demo-label">Demo accounts</p>
          <div class="demo-grid">
            <button type="button" class="demo-account" @click="fillDemo('admin@example.com', 'admin123')">
              <span class="demo-role">Admin</span>
              <span class="demo-email">admin@example.com</span>
            </button>
            <button type="button" class="demo-account" @click="fillDemo('manager@example.com', 'manager123')">
              <span class="demo-role">Manager</span>
              <span class="demo-email">manager@example.com</span>
            </button>
            <button type="button" class="demo-account" @click="fillDemo('cashier@example.com', 'cashier123')">
              <span class="demo-role">Cashier</span>
              <span class="demo-email">cashier@example.com</span>
            </button>
            <button type="button" class="demo-account" @click="fillDemo('inventory@example.com', 'inventory123')">
              <span class="demo-role">Inventory</span>
              <span class="demo-email">inventory@example.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('admin@example.com');
const password = ref('admin123');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-bs-theme', isDark.value ? 'dark' : 'light');
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }
});

const fillDemo = (demoEmail, demoPassword) => {
  email.value = demoEmail;
  password.value = demoPassword;
};

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  padding: 1.5rem;
  position: relative;
}

.theme-toggle-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
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
  font-size: 0.9375rem;
  z-index: 10;
}

.theme-toggle-btn:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.brand-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo span {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.login-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(220, 38, 38, 0.15);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.forgot-link {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  pointer-events: none;
}

.form-input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 38px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  font-size: 0.9375rem;
  color: var(--color-text);
  transition: var(--transition-fast);
  outline: none;
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--color-text);
}

.btn-submit {
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-section {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.demo-label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-tertiary);
  margin: 0 0 0.625rem 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
}

.demo-account {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0.625rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: left;
}

.demo-account:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text);
}

.demo-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
}

.demo-email {
  font-size: 0.625rem;
  color: var(--color-text-secondary);
  margin-top: 1px;
}
</style>
