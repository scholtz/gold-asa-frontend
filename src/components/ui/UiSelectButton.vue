<script setup lang="ts" generic="T">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: unknown
    options: T[]
    optionLabel?: string
    optionValue?: string
    disabled?: boolean
  }>(),
  {}
)
const emit = defineEmits<{ 'update:modelValue': [value: unknown]; change: [value: unknown] }>()
const attrs = useAttrs()

const label = (o: any) => (props.optionLabel && o && typeof o === 'object' ? o[props.optionLabel] : o)
const value = (o: any) => (props.optionValue && o && typeof o === 'object' ? o[props.optionValue] : o)

const select = (o: T) => {
  if (props.disabled) return
  const v = value(o)
  emit('update:modelValue', v)
  emit('change', v)
}
</script>

<template>
  <div class="ui-segmented" role="radiogroup" v-bind="attrs">
    <button
      v-for="(o, i) in options"
      :key="i"
      type="button"
      role="radio"
      class="ui-segmented__item"
      :class="{ 'is-active': value(o) === modelValue }"
      :aria-checked="value(o) === modelValue"
      :disabled="disabled"
      @click="select(o)"
    >
      {{ label(o) }}
    </button>
  </div>
</template>

<style scoped>
.ui-segmented {
  display: inline-flex;
  flex-wrap: wrap;
  padding: 0.25rem;
  gap: 0.25rem;
  background: var(--surface-alt);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.ui-segmented__item {
  padding: 0.4rem 1rem;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: calc(var(--radius) - 3px);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}
.ui-segmented__item:hover:not(:disabled) {
  color: var(--ink);
}
.ui-segmented__item.is-active {
  color: var(--ink);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}
.ui-segmented__item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
