<template>
  <div class="position-relative">
    <div class="input-group">
      <span class="input-group-text bg-transparent border-end-0">
        <i class="bi bi-search text-muted"></i>
      </span>
      <input
        type="text"
        class="form-control border-start-0"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @keyup.enter="$emit('search', modelValue)"
      />
      <button
        v-if="modelValue"
        class="btn btn-outline-secondary border-start-0"
        type="button"
        @click="clear"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search...' },
  debounce: { type: Number, default: 300 },
});

const emit = defineEmits(['update:modelValue', 'search']);
let timer = null;

const handleInput = (e) => {
  const value = e.target.value;
  emit('update:modelValue', value);
  clearTimeout(timer);
  timer = setTimeout(() => {
    emit('search', value);
  }, props.debounce);
};

const clear = () => {
  emit('update:modelValue', '');
  emit('search', '');
};
</script>
