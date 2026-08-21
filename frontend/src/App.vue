<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.token) {
    await authStore.fetchUser();
  }
});
</script>
