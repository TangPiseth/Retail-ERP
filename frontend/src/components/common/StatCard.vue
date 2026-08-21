<template>
  <div class="stat-card">
    <div class="stat-card-header">
      <div class="stat-card-icon" :class="`stat-card-icon-${variant}`">
        <i :class="icon"></i>
      </div>
      <div v-if="change !== null" class="stat-card-change" :class="change >= 0 ? 'positive' : 'negative'">
        <i :class="change >= 0 ? 'bi bi-arrow-up-right' : 'bi bi-arrow-down-right'"></i>
        <span>{{ Math.abs(change) }}%</span>
      </div>
    </div>
    <div class="stat-card-body">
      <p class="stat-card-label">{{ title }}</p>
      <h4 class="stat-card-value">{{ displayValue }}</h4>
      <p v-if="subtitle" class="stat-card-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  displayValue: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, required: true },
  variant: { type: String, default: 'primary' },
  change: { type: Number, default: null },
});
</script>

<style scoped>
.stat-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: var(--transition-fast);
  height: 100%;
}

.stat-card:hover {
  border-color: var(--color-border-strong);
}

.stat-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.stat-card-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.stat-card-icon-primary { background: var(--color-primary-light); color: var(--color-primary); }
.stat-card-icon-success { background: var(--color-success-light); color: var(--color-success); }
.stat-card-icon-warning { background: var(--color-warning-light); color: var(--color-warning); }
.stat-card-icon-danger { background: var(--color-danger-light); color: var(--color-danger); }
.stat-card-icon-info { background: var(--color-info-light); color: var(--color-info); }
.stat-card-icon-secondary { background: var(--color-bg-subtle); color: var(--color-text-secondary); }

.stat-card-change {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
}

.stat-card-change.positive {
  background: var(--color-success-light);
  color: var(--color-success);
}

.stat-card-change.negative {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.stat-card-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0.25rem 0;
}

.stat-card-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.stat-card-subtitle {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
}
</style>
