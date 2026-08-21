<template>
  <div class="modal fade" :id="dialogId" tabindex="-1" ref="modalRef">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center p-4">
          <div class="mb-3">
            <i :class="[icon, iconColor]" style="font-size: 2.5rem;"></i>
          </div>
          <h6 class="mb-2">{{ title }}</h6>
          <p class="text-muted mb-3" style="font-size: 0.8125rem;">{{ message }}</p>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button :class="['btn btn-sm', confirmClass]" @click="handleConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  dialogId: { type: String, required: true },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  confirmClass: { type: String, default: 'btn-danger' },
  icon: { type: String, default: 'bi bi-exclamation-triangle' },
  iconColor: { type: String, default: 'text-warning' },
});

const emit = defineEmits(['confirm']);
const modalRef = ref(null);
let modalInstance = null;

onMounted(async () => {
  const bootstrap = await import('bootstrap');
  if (modalRef.value) {
    modalInstance = new bootstrap.Modal(modalRef.value);
  }
});

const show = () => modalInstance?.show();
const hide = () => modalInstance?.hide();

const handleConfirm = () => {
  emit('confirm');
  hide();
};

defineExpose({ show, hide });
</script>
