<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId } from 'vue'
import UiIcon from './UiIcon.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: unknown
  options?: any[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  filter?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: unknown]
  change: [event: { value: unknown }]
}>()

defineSlots<{
  value(props: { value: unknown; placeholder?: string }): unknown
  option(props: { option: any; index: number }): unknown
}>()

const attrs = useAttrs()
const root = ref<HTMLElement>()
const search = ref<HTMLInputElement>()
const open = ref(false)
const query = ref('')
const active = ref(0)
const listId = useId()

const triggerAttrs = computed(() => {
  const { class: _c, style: _s, id: _i, ...rest } = attrs
  return rest
})

const labelOf = (o: any) =>
  props.optionLabel && o && typeof o === 'object' ? o[props.optionLabel] : o
const valueOf = (o: any) =>
  props.optionValue && o && typeof o === 'object' ? o[props.optionValue] : o

const items = computed(() => {
  const all = props.options ?? []
  const q = query.value.trim().toLowerCase()
  return q ? all.filter((o) => String(labelOf(o)).toLowerCase().includes(q)) : all
})
const selected = computed(() => (props.options ?? []).find((o) => valueOf(o) === props.modelValue))

const toggle = async () => {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    query.value = ''
    active.value = Math.max(
      0,
      items.value.findIndex((o) => valueOf(o) === props.modelValue)
    )
    await nextTick()
    search.value?.focus()
  }
}
const close = () => {
  open.value = false
}
const choose = (o: any) => {
  const value = valueOf(o)
  emit('update:modelValue', value)
  emit('change', { value })
  close()
  root.value?.querySelector<HTMLElement>('.ui-dropdown__trigger')?.focus()
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) return void toggle()
    active.value = Math.max(0, Math.min(items.value.length - 1, active.value + 1))
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = Math.max(0, active.value - 1)
  } else if (e.key === 'Enter' && open.value) {
    e.preventDefault()
    if (items.value[active.value] !== undefined) choose(items.value[active.value])
  } else if (e.key === 'Tab') {
    close()
  } else if (e.key === 'Escape') {
    close()
  }
}
const onDocClick = (e: MouseEvent) => {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div
    ref="root"
    class="ui-dropdown"
    :class="[$attrs.class, { 'is-open': open }]"
    :style="$attrs.style as any"
    @keydown="onKey"
  >
    <button
      type="button"
      class="ui-dropdown__trigger ui-control"
      :class="{ 'is-disabled': disabled }"
      :id="$attrs.id as string"
      :disabled="disabled"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      v-bind="triggerAttrs"
      @click="toggle"
    >
      <span class="ui-dropdown__value" :class="{ 'is-placeholder': selected === undefined }">
        <slot name="value" :value="modelValue" :placeholder="placeholder">
          {{ selected !== undefined ? labelOf(selected) : (placeholder ?? '') }}
        </slot>
      </span>
      <UiIcon name="chevron-down" />
    </button>
    <div v-if="open" class="ui-dropdown__panel">
      <input
        v-if="filter"
        ref="search"
        v-model="query"
        class="ui-dropdown__search"
        type="text"
        placeholder="Search"
        aria-label="Search options"
        @input="active = 0"
      />
      <ul :id="listId" class="ui-dropdown__list" role="listbox">
        <li
          v-for="(o, i) in items"
          :key="i"
          role="option"
          class="ui-dropdown__option"
          :class="{ 'is-active': i === active, 'is-selected': valueOf(o) === modelValue }"
          :aria-selected="valueOf(o) === modelValue"
          @mouseenter="active = i"
          @click="choose(o)"
        >
          <slot name="option" :option="o" :index="i">{{ labelOf(o) }}</slot>
        </li>
        <li v-if="!items.length" class="ui-dropdown__empty">No available options</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.ui-dropdown {
  position: relative;
  display: inline-block;
  min-width: 10rem;
}
.ui-dropdown.w-full {
  display: block;
}
.ui-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  text-align: left;
  cursor: pointer;
}
.ui-dropdown__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-dropdown__value.is-placeholder {
  color: var(--muted);
}
.ui-dropdown__panel {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  min-width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.ui-dropdown__search {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font: inherit;
  border: 0;
  border-bottom: 1px solid var(--line);
  outline: none;
}
.ui-dropdown__list {
  max-height: 16rem;
  margin: 0;
  padding: 0.3rem;
  overflow-y: auto;
  list-style: none;
}
.ui-dropdown__option {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.ui-dropdown__option.is-active {
  background: var(--gold-50);
}
.ui-dropdown__option.is-selected {
  font-weight: 600;
  color: var(--gold-700);
}
.ui-dropdown__empty {
  padding: 0.6rem 0.75rem;
  color: var(--muted);
}
</style>
