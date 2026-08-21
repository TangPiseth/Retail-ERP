<template>
  <button
    :class="['btn', variantClass, sizeClass, { 'w-100': block }, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
    <i v-if="icon && !loading" :class="[icon, 'me-1']"></i>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: '' },
  icon: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
});

defineEmits(['click']);

const variantClass = computed(() => `btn-${props.variant}`);
const sizeClass = computed(() => props.size ? `btn-${props.size}` : '');
</script>

<style scoped>
.btn-loading {
  pointer-events: none;
  opacity: 0.8;
}
</style>
