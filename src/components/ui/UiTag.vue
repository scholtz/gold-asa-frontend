<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value?: string | number
    severity?: 'success' | 'info' | 'warning' | 'warn' | 'danger' | 'secondary' | 'contrast'
    rounded?: boolean
  }>(),
  { severity: 'secondary' }
)
</script>

<template>
  <span
    class="ui-tag"
    :class="[
      `ui-tag--${props.severity === 'warn' ? 'warning' : props.severity}`,
      { 'ui-tag--rounded': rounded }
    ]"
  >
    <slot>{{ value }}</slot>
  </span>
</template>

<style scoped>
.ui-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.02em;
  border-radius: var(--radius-sm);
  color: var(--ink-soft);
  background: var(--surface-alt);
  border: 1px solid var(--line);
  white-space: nowrap;
}
.ui-tag--rounded {
  border-radius: 999px;
}
.ui-tag--success {
  color: var(--success);
  background: var(--success-bg);
  border-color: transparent;
}
.ui-tag--info {
  color: var(--info);
  background: var(--info-bg);
  border-color: transparent;
}
.ui-tag--warning {
  color: var(--warn);
  background: var(--warn-bg);
  border-color: transparent;
}
.ui-tag--danger {
  color: var(--danger);
  background: var(--danger-bg);
  border-color: transparent;
}
.ui-tag--contrast {
  color: var(--on-dark);
  background: var(--dark-2);
  border-color: transparent;
}
</style>
