<template>
  <li class="nav-item">
    <router-link
      v-if="to"
      :to="to"
      class="sidebar-link"
      active-class="active"
    >
      <span class="sidebar-icon"><i :class="icon"></i></span>
      <span class="sidebar-text">{{ label }}</span>
      <span v-if="badge" class="sidebar-badge">{{ badge }}</span>
    </router-link>
  </li>
</template>

<script setup>
defineProps({
  to: { type: String, default: '' },
  icon: { type: String, required: true },
  label: { type: String, required: true },
  badge: { type: [String, Number], default: '' },
});
</script>
