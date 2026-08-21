<template>
  <nav aria-label="breadcrumb" class="mb-3">
    <ol class="breadcrumb mb-0">
      <li class="breadcrumb-item">
        <router-link to="/dashboard" class="text-decoration-none">
          <i class="bi bi-house"></i>
        </router-link>
      </li>
      <li
        v-for="(crumb, index) in crumbs"
        :key="index"
        class="breadcrumb-item"
        :class="{ active: index === crumbs.length - 1 }"
      >
        <router-link v-if="crumb.to && index !== crumbs.length - 1" :to="crumb.to" class="text-decoration-none">
          {{ crumb.label }}
        </router-link>
        <span v-else>{{ crumb.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const crumbs = computed(() => {
  return route.matched
    .filter((r) => r.meta?.breadcrumb)
    .map((r) => ({
      label: r.meta.breadcrumb,
      to: r.path,
    }));
});
</script>
