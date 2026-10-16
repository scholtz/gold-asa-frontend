<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: boolean; inputId?: string; binary?: boolean; disabled?: boolean }>()
const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs
  return rest
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <span class="ui-checkbox" v-bind="{ class: $attrs.class, style: $attrs.style as any }">
    <input
      :id="inputId"
      type="checkbox"
      v-bind="inputAttrs"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="ui-checkbox__box" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  </span>
</template>

<style scoped>
.ui-checkbox {
  position: relative;
  display: inline-flex;
  width: 1.3rem;
  height: 1.3rem;
  flex-shrink: 0;
}
.ui-checkbox input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.ui-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: transparent;
  background: var(--surface);
  border: 1.5px solid var(--line-strong);
  border-radius: 5px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.ui-checkbox__box svg {
  width: 80%;
  height: 80%;
}
input:checked + .ui-checkbox__box {
  color: #fff;
  background: var(--gold-600);
  border-color: var(--gold-600);
}
input:focus-visible + .ui-checkbox__box {
  box-shadow: var(--focus-ring);
}
input:disabled + .ui-checkbox__box {
  opacity: 0.5;
}
</style>
