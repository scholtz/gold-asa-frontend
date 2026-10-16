<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UiIcon from './UiIcon.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: number | null
    min?: number
    max?: number
    step?: number
    minFractionDigits?: number
    maxFractionDigits?: number
    prefix?: string
    suffix?: string
    showButtons?: boolean
    placeholder?: string
    disabled?: boolean
  }>(),
  { step: 1 }
)
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const focused = ref(false)
const text = ref('')

const format = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return value.toLocaleString('en-US', {
    useGrouping: false,
    minimumFractionDigits: props.minFractionDigits ?? 0,
    maximumFractionDigits: props.maxFractionDigits ?? Math.max(props.minFractionDigits ?? 0, 20)
  })
}

watch(
  () => props.modelValue,
  (value) => {
    if (!focused.value) text.value = format(value)
  },
  { immediate: true }
)

const clamp = (value: number): number => {
  if (props.min !== undefined && value < props.min) return props.min
  if (props.max !== undefined && value > props.max) return props.max
  return value
}

const parse = (raw: string): number | null => {
  const cleaned = raw.replace(props.prefix ?? '', '').replace(props.suffix ?? '', '').replace(/\s/g, '').replace(',', '.')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

const commit = () => {
  const value = parse(text.value)
  const next = value === null ? null : clamp(value)
  text.value = format(next)
  if (next !== props.modelValue) emit('update:modelValue', next)
}

const onInput = (e: Event) => {
  text.value = (e.target as HTMLInputElement).value
  const value = parse(text.value)
  if (value !== null) emit('update:modelValue', value)
}

const stepBy = (direction: 1 | -1) => {
  const base = props.modelValue ?? 0
  const decimals = (String(props.step).split('.')[1] ?? '').length
  const next = clamp(Number((base + direction * props.step).toFixed(decimals)))
  text.value = format(next)
  emit('update:modelValue', next)
}

const shown = computed(() =>
  focused.value || text.value === '' ? text.value : `${props.prefix ?? ''}${text.value}${props.suffix ?? ''}`
)
</script>

<template>
  <div class="ui-number ui-control" :class="{ 'is-disabled': disabled, [String($attrs.class ?? '')]: true }">
    <input
      class="ui-number__input"
      inputmode="decimal"
      v-bind="{ ...$attrs, class: undefined }"
      :value="shown"
      :placeholder="placeholder"
      :disabled="disabled"
      @focus="focused = true; text = format(modelValue)"
      @blur="focused = false; commit()"
      @input="onInput"
      @keydown.up.prevent="stepBy(1)"
      @keydown.down.prevent="stepBy(-1)"
    />
    <span v-if="showButtons" class="ui-number__buttons">
      <button type="button" tabindex="-1" aria-label="Increase" :disabled="disabled" @click="stepBy(1)">
        <UiIcon name="chevron-up" size="0.9em" />
      </button>
      <button type="button" tabindex="-1" aria-label="Decrease" :disabled="disabled" @click="stepBy(-1)">
        <UiIcon name="chevron-down" size="0.9em" />
      </button>
    </span>
  </div>
</template>

<style scoped>
.ui-number {
  display: flex;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}
.ui-number__input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.85rem;
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  outline: none;
}
.ui-number__buttons {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--line);
}
.ui-number__buttons button {
  flex: 1;
  width: 2rem;
  padding: 0;
  color: var(--muted);
  background: var(--surface-alt);
  border: 0;
  cursor: pointer;
}
.ui-number__buttons button + button {
  border-top: 1px solid var(--line);
}
.ui-number__buttons button:hover:not(:disabled) {
  color: var(--gold-700);
  background: var(--gold-50);
}
</style>
