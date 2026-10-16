<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'
import UiSpinner from './UiSpinner.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    /** Icon name from UiIcon */
    icon?: string
    iconPos?: 'left' | 'right'
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'warn' | 'danger' | 'help'
    outlined?: boolean
    text?: boolean
    link?: boolean
    rounded?: boolean
    raised?: boolean
    loading?: boolean
    disabled?: boolean
    size?: 'small' | 'large'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { iconPos: 'left', severity: 'primary', type: 'button' }
)

const classes = computed(() => [
  'ui-btn',
  `ui-btn--${props.severity === 'warn' ? 'warning' : props.severity}`,
  {
    'ui-btn--outlined': props.outlined,
    'ui-btn--text': props.text,
    'ui-btn--link': props.link,
    'ui-btn--rounded': props.rounded,
    'ui-btn--raised': props.raised,
    'ui-btn--small': props.size === 'small',
    'ui-btn--large': props.size === 'large'
  }
])
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <UiSpinner v-if="loading" class="ui-btn__spinner" />
    <UiIcon v-else-if="icon && iconPos === 'left'" :name="icon" />
    <slot>
      <span v-if="label">{{ label }}</span>
    </slot>
    <UiIcon v-if="icon && iconPos === 'right' && !loading" :name="icon" />
  </button>
</template>

<style scoped>
.ui-btn {
  --btn: var(--gold-600);
  --btn-hover: var(--gold-700);
  --btn-fg: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.55rem 1.15rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--btn-fg);
  background: var(--btn);
  border: 1px solid var(--btn);
  border-radius: var(--radius);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.05s ease;
}
.ui-btn:hover:not(:disabled) {
  background: var(--btn-hover);
  border-color: var(--btn-hover);
}
.ui-btn:active:not(:disabled) {
  transform: translateY(1px);
}
.ui-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ui-btn--secondary {
  --btn: var(--ink-soft);
  --btn-hover: var(--ink);
}
.ui-btn--success {
  --btn: var(--success);
  --btn-hover: #0a7557;
}
.ui-btn--info {
  --btn: var(--info);
  --btn-hover: #174c88;
}
.ui-btn--help {
  --btn: #6b4aa6;
  --btn-hover: #563a88;
}
.ui-btn--warning {
  --btn: var(--warn);
  --btn-hover: #8a5409;
}
.ui-btn--danger {
  --btn: var(--danger);
  --btn-hover: #962921;
}

.ui-btn--outlined,
.ui-btn--text,
.ui-btn--link {
  color: var(--btn);
  background: transparent;
}
.ui-btn--outlined:hover:not(:disabled) {
  color: var(--btn-fg);
}
.ui-btn--text {
  border-color: transparent;
}
.ui-btn--text:hover:not(:disabled) {
  color: var(--btn-hover);
  background: color-mix(in srgb, var(--btn) 10%, transparent);
  border-color: transparent;
}
.ui-btn--link {
  border-color: transparent;
  padding: 0.2rem 0.3rem;
  min-height: 0;
  font-weight: 500;
}
.ui-btn--link:hover:not(:disabled) {
  color: var(--btn-hover);
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}
.ui-btn--raised {
  box-shadow: var(--shadow-md);
}
.ui-btn--rounded {
  border-radius: 999px;
}
.ui-btn--small {
  min-height: 2rem;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
}
.ui-btn--large {
  min-height: 3rem;
  padding: 0.75rem 1.6rem;
  font-size: 1.05rem;
}
.ui-btn__spinner {
  width: 1em;
  height: 1em;
}
</style>
