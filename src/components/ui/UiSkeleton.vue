<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; borderRadius?: string }>(), {
  width: '100%',
  height: '1rem',
  borderRadius: '8px'
})
</script>

<template>
  <div class="ui-skeleton" :style="{ width, height, borderRadius }" aria-hidden="true" />
</template>

<style scoped>
.ui-skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-alt) 25%,
    var(--line) 50%,
    var(--surface-alt) 75%
  );
  background-size: 200% 100%;
  animation: ui-shimmer 1.4s ease-in-out infinite;
}
@keyframes ui-shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
