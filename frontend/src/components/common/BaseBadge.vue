<template>
  <span :class="['base-badge', `base-badge-${variant}`]">
    <i v-if="icon" :class="icon"></i>
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  icon: { type: String, default: '' },
});
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  border: 1px solid transparent;
}

.base-badge i {
  font-size: 0.5625rem;
}

.base-badge-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: rgba(22, 163, 74, 0.12);
}

.base-badge-success {
  background: var(--color-success-light);
  color: var(--color-success);
  border-color: rgba(22, 163, 74, 0.12);
}

.base-badge-danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: rgba(220, 38, 38, 0.12);
}

.base-badge-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border-color: rgba(217, 119, 6, 0.12);
}

.base-badge-info {
  background: var(--color-info-light);
  color: var(--color-info);
  border-color: rgba(8, 145, 178, 0.12);
}

.base-badge-secondary {
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}
</style>
