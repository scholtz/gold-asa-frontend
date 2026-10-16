<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'
import UiToast from '@/components/ui/UiToast.vue'
</script>
<template>
  <div class="layout">
    <UiToast />
    <TopHeader :hideTopMenu="false" />
    <main class="layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100vh;
}
.layout__main {
  flex: 1;
}
</style>
