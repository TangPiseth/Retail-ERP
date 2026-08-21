<template>
  <div class="mb-3" :class="wrapperClass">
    <label v-if="label" :for="id" class="form-label" :class="{ 'required': required }">
      {{ label }}
    </label>
    <div :class="{ 'input-group': $slots.prepend || $slots.append }">
      <slot name="prepend" />
      <input
        :id="id"
        :type="type"
        :class="['form-control', { 'is-invalid': error }]"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :step="step"
        :min="min"
        :max="max"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <slot name="append" />
    </div>
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
    <small v-if="help" class="form-text text-muted">{{ help }}</small>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  step: { type: String, default: undefined },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  wrapperClass: { type: String, default: '' },
});

defineEmits(['update:modelValue', 'blur', 'focus']);
</script>

<style scoped>
.required::after {
  content: ' *';
  color: var(--color-danger);
}
</style>
