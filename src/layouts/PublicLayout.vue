<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'
</script>
<template>
  <div class="flex flex-column justify-content-center min-h-full p-0 m-0">
    <Toast />
    <TopHeader :hideTopMenu="false" />
    <div class="flex-grow-1 flex flex-column">
      <slot />
    </div>
  </div>
</template>
