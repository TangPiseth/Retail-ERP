<template>
  <div class="d-flex gap-2 align-items-center">
    <input
      type="date"
      class="form-control form-control-sm"
      :value="modelValue?.start"
      @change="updateStart($event.target.value)"
      placeholder="Start date"
    />
    <span class="text-muted">to</span>
    <input
      type="date"
      class="form-control form-control-sm"
      :value="modelValue?.end"
      @change="updateEnd($event.target.value)"
      placeholder="End date"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ start: '', end: '' }),
  },
});

const emit = defineEmits(['update:modelValue']);

const updateStart = (start) => {
  emit('update:modelValue', { ...props.modelValue, start });
};

const updateEnd = (end) => {
  emit('update:modelValue', { ...props.modelValue, end });
};
</script>
