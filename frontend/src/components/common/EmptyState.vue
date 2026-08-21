<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <i :class="icon"></i>
    </div>
    <h6 class="empty-state-title">{{ title }}</h6>
    <p v-if="description" class="empty-state-description">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'bi bi-inbox' },
  title: { type: String, default: 'No data found' },
  description: { type: String, default: '' },
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
  color: var(--color-text-tertiary);
}

.empty-state-icon i {
  font-size: 2rem;
}

.empty-state-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.375rem 0;
}

.empty-state-description {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0 0 1rem 0;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}
</style>
