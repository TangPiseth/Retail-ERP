<template>
  <div class="modal fade" :id="modalId" tabindex="-1" :aria-labelledby="modalId + 'Label'" ref="modalRef">
    <div :class="['modal-dialog', sizeClass, { 'modal-fullscreen': fullscreen }]" :scrollable="scrollable">
      <div class="modal-content animate-scale-in">
        <div class="modal-header" v-if="!hideHeader">
          <h5 class="modal-title" :id="modalId + 'Label'">
            <slot name="title">{{ title }}</slot>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" v-if="!hideClose"></button>
        </div>
        <div class="modal-body" :class="bodyClass">
          <slot />
        </div>
        <div class="modal-footer" v-if="$slots.footer && !hideFooter">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  modalId: { type: String, required: true },
  title: { type: String, default: '' },
  size: { type: String, default: '' },
  fullscreen: { type: Boolean, default: false },
  scrollable: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  hideFooter: { type: Boolean, default: false },
  hideClose: { type: Boolean, default: false },
  bodyClass: { type: String, default: '' },
});

const modalRef = ref(null);
let modalInstance = null;

const sizeClass = computed(() => {
  const sizes = { sm: 'modal-sm', lg: 'modal-lg', xl: 'modal-xl' };
  return sizes[props.size] || '';
});

onMounted(async () => {
  const bootstrap = await import('bootstrap');
  if (modalRef.value) {
    modalInstance = new bootstrap.Modal(modalRef.value);
  }
});

const show = () => modalInstance?.show();
const hide = () => modalInstance?.hide();

defineExpose({ show, hide });
</script>
