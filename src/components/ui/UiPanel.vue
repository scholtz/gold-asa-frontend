<script setup lang="ts">
defineProps<{ header?: string }>()
</script>

<template>
  <section class="ui-panel">
    <header v-if="header || $slots.header" class="ui-panel__header">
      <slot name="header">
        <h2 class="ui-panel__title">{{ header }}</h2>
      </slot>
    </header>
    <div class="ui-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ui-panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.ui-panel__header {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface-alt);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.ui-panel__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
}
.ui-panel__body {
  padding: 1.5rem;
}
</style>
