<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }"
            @click="col.sortable && $emit('sort', col.key)"
          >
            <div class="d-flex align-items-center gap-1">
              {{ col.label }}
              <span v-if="col.sortable && sortKey === col.key" class="text-primary">
                <i :class="sortDir === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'" style="font-size: 0.7rem;"></i>
              </span>
            </div>
          </th>
          <th v-if="$slots.actions" class="text-end" style="width: 120px;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + 1" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Loading...
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td :colspan="columns.length + 1" class="text-center py-4 text-muted">
            <slot name="empty">No data found</slot>
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="row.id || index">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="text-end">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
});

defineEmits(['sort']);
</script>
