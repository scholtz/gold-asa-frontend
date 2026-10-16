<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import { useToast } from './useToast'

const { toasts, remove } = useToast()
const kind = (s?: string) => (s === 'warn' ? 'warning' : s === 'danger' ? 'error' : (s ?? 'info'))
</script>

<template>
  <div class="ui-toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="ui-toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="ui-toast"
        :class="`ui-toast--${kind(t.severity)}`"
        role="status"
      >
        <UiIcon :name="kind(t.severity)" size="1.3em" />
        <div class="ui-toast__text">
          <strong v-if="t.summary">{{ t.summary }}</strong>
          <span v-if="t.detail">{{ t.detail }}</span>
        </div>
        <button type="button" class="ui-toast__close" aria-label="Close" @click="remove(t.id)">
          <UiIcon name="close" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.ui-toasts {
  position: fixed;
  z-index: 1000;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(24rem, calc(100vw - 2rem));
  pointer-events: none;
}
.ui-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 4px solid var(--info);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  font-size: 0.93rem;
}
.ui-toast__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  word-break: break-word;
}
.ui-toast__close {
  padding: 0.1rem;
  color: var(--muted);
  background: transparent;
  border: 0;
  cursor: pointer;
}
.ui-toast--success {
  border-left-color: var(--success);
}
.ui-toast--success > svg {
  color: var(--success);
}
.ui-toast--info > svg {
  color: var(--info);
}
.ui-toast--warning {
  border-left-color: var(--warn);
}
.ui-toast--warning > svg {
  color: var(--warn);
}
.ui-toast--error {
  border-left-color: var(--danger);
}
.ui-toast--error > svg {
  color: var(--danger);
}
.ui-toast-enter-active,
.ui-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
