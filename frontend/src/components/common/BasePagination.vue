<template>
  <nav v-if="totalPages > 1" class="d-flex align-items-center justify-content-between">
    <div class="text-muted" style="font-size: 0.8125rem;">
      Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
    </div>
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="$emit('page-change', currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>
      <li
        v-for="page in visiblePages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage, disabled: page === '...' }"
      >
        <button class="page-link" @click="page !== '...' && $emit('page-change', page)">
          {{ page }}
        </button>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="$emit('page-change', currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  limit: { type: Number, default: 20 },
});

defineEmits(['page-change']);

const startItem = computed(() => (props.currentPage - 1) * props.limit + 1);
const endItem = computed(() => Math.min(props.currentPage * props.limit, props.totalItems));

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
});
</script>
