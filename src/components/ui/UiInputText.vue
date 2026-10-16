<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    class="ui-input"
    v-bind="$attrs"
    :value="modelValue ?? ''"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style>
/* shared by all text-like form controls */
.ui-input,
.ui-control {
  width: 100%;
  min-height: 2.6rem;
  padding: 0.55rem 0.85rem;
  font: inherit;
  font-size: 0.97rem;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.ui-input::placeholder {
  color: var(--muted);
  opacity: 0.8;
}
.ui-input:hover:not(:disabled),
.ui-control:hover:not(.is-disabled) {
  border-color: var(--gold-500);
}
.ui-input:focus,
.ui-control:focus-within {
  outline: none;
  border-color: var(--gold-500);
  box-shadow: var(--focus-ring);
}
.ui-input:disabled,
.ui-control.is-disabled {
  background: var(--surface-alt);
  color: var(--muted);
  cursor: not-allowed;
}
.ui-input[aria-invalid='true'] {
  border-color: var(--danger);
}
</style>
