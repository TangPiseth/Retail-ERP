<template>
  <div class="card" :class="[paddingClass, className]">
    <div v-if="$slots.header || title" class="card-header d-flex align-items-center justify-content-between" v-show="!hideHeader">
      <slot name="header">
        <h6 class="card-title mb-0">{{ title }}</h6>
      </slot>
      <slot name="header-actions" />
    </div>
    <div :class="['card-body', bodyClass]" v-if="$slots.default">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  bodyClass: { type: String, default: '' },
  className: { type: String, default: '' },
  padding: { type: String, default: '' },
  hideHeader: { type: Boolean, default: false },
});

const paddingClass = '';
</script>
