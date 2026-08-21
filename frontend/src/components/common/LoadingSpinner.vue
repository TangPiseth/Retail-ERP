<template>
  <div class="loading-state">
    <div class="loading-spinner" :style="{ width: size, height: size }">
      <div class="spinner-ring"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  size: { type: String, default: '32px' },
});
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid var(--color-bg-subtle);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0.75rem 0 0 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
