<template>
  <div class="mb-3" :class="wrapperClass">
    <label v-if="label" :for="id" class="form-label" :class="{ 'required': required }">
      {{ label }}
    </label>
    <select
      :id="id"
      :class="['form-select', { 'is-invalid': error }]"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  wrapperClass: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.required::after {
  content: ' *';
  color: var(--color-danger);
}
</style>
