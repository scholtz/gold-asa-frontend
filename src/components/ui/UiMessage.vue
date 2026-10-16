<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'

const props = withDefaults(
  defineProps<{
    severity?: 'info' | 'success' | 'warn' | 'warning' | 'error' | 'danger'
    closable?: boolean
  }>(),
  { severity: 'info' }
)
const emit = defineEmits<{ close: [] }>()

const kind = computed(() =>
  props.severity === 'warn' ? 'warning' : props.severity === 'danger' ? 'error' : props.severity
)
</script>

<template>
  <div class="ui-message" :class="`ui-message--${kind}`" role="alert">
    <UiIcon :name="kind" size="1.25em" />
    <div class="ui-message__text"><slot /></div>
    <button
      v-if="closable"
      class="ui-message__close"
      type="button"
      aria-label="Close"
      @click="emit('close')"
    >
      <UiIcon name="close" />
    </button>
  </div>
</template>

<style scoped>
.ui-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-size: 0.95rem;
}
.ui-message__text {
  flex: 1;
  min-width: 0;
}
.ui-message__close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0.1rem;
  opacity: 0.7;
}
.ui-message__close:hover {
  opacity: 1;
}
.ui-message--info {
  color: var(--info);
  background: var(--info-bg);
  border-color: color-mix(in srgb, var(--info) 25%, transparent);
}
.ui-message--success {
  color: var(--success);
  background: var(--success-bg);
  border-color: color-mix(in srgb, var(--success) 25%, transparent);
}
.ui-message--warning {
  color: var(--warn);
  background: var(--warn-bg);
  border-color: color-mix(in srgb, var(--warn) 25%, transparent);
}
.ui-message--error {
  color: var(--danger);
  background: var(--danger-bg);
  border-color: color-mix(in srgb, var(--danger) 25%, transparent);
}
</style>
