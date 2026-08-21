<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1090;">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast show', 'border-0', 'mb-2']"
        role="alert"
      >
        <div class="toast-body d-flex align-items-center">
          <i :class="[iconMap[toast.type], 'me-2', colorMap[toast.type]]" style="font-size: 1.1rem;"></i>
          <span class="flex-grow-1">{{ toast.message }}</span>
          <button type="button" class="btn-close btn-close-sm ms-2" @click="remove(toast.id)"></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

const iconMap = {
  success: 'bi bi-check-circle-fill',
  error: 'bi bi-x-circle-fill',
  warning: 'bi bi-exclamation-triangle-fill',
  info: 'bi bi-info-circle-fill',
};

const colorMap = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

const add = (message, type = 'info', duration = 4000) => {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }
};

const remove = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

defineExpose({ add });
</script>

<style scoped>
.toast-enter-active {
  animation: toast-in var(--duration-slow) var(--ease-out) both;
}

.toast-leave-active {
  animation: toast-out var(--duration-normal) var(--ease-out) both;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
