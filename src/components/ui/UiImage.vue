<script setup lang="ts">
defineProps<{ src: string; alt?: string }>()
</script>

<template>
  <img class="ui-image" :src="src" :alt="alt ?? ''" loading="lazy" />
</template>

<style scoped>
.ui-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius);
}
</style>
