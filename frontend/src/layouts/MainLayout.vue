<template>
  <div class="app-layout">
    <Sidebar :collapsed="sidebarCollapsed" :show-mobile="showMobileSidebar" @toggle="sidebarCollapsed = !sidebarCollapsed" @close-mobile="showMobileSidebar = false" />

    <div :class="['main-wrapper', { 'sidebar-collapsed': sidebarCollapsed }]">
      <TopNavbar @toggle-sidebar="showMobileSidebar = !showMobileSidebar" />

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <div
      v-if="showMobileSidebar"
      class="sidebar-overlay d-lg-none"
      @click="showMobileSidebar = false"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '../components/layout/Sidebar.vue';
import TopNavbar from '../components/layout/TopNavbar.vue';

const sidebarCollapsed = ref(false);
const showMobileSidebar = ref(false);
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.main-wrapper {
  margin-left: var(--sidebar-width);
  transition: margin-left var(--duration-slow) var(--ease-out);
  min-height: 100vh;
  background: var(--color-bg);
}

.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

.main-content {
  padding: 1.25rem 1.5rem;
  padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  min-height: calc(100vh - var(--navbar-height));
}

.page-enter-active {
  animation: fade-up var(--duration-slow) var(--ease-out) both;
}

.page-leave-active {
  animation: fade-in var(--duration-fast) var(--ease-out) reverse both;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 14, 18, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1035;
  animation: fade-in var(--duration-normal) var(--ease-out) both;
}

@media (max-width: 991.98px) {
  .main-wrapper {
    margin-left: 0;
  }
  .main-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
  .main-content {
    padding: 1rem;
  }
}
</style>
