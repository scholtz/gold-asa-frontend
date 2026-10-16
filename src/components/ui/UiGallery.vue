<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import UiIcon from './UiIcon.vue'

const props = defineProps<{ value: T[]; activeIndex?: number; showThumbnails?: boolean }>()
const emit = defineEmits<{ 'update:activeIndex': [index: number] }>()

defineSlots<{
  item(props: { item: T; index: number }): unknown
  thumbnail(props: { item: T; index: number }): unknown
  footer(): unknown
}>()

const current = ref(props.activeIndex ?? 0)
watch(
  () => props.activeIndex,
  (v) => {
    if (v !== undefined) current.value = v
  }
)
const count = computed(() => props.value.length)
watch(count, (n) => {
  if (current.value >= n) current.value = Math.max(0, n - 1)
})
const go = (index: number) => {
  if (!count.value) return
  current.value = (index + count.value) % count.value
  emit('update:activeIndex', current.value)
}
</script>

<template>
  <div class="ui-gallery">
    <div class="ui-gallery__stage">
      <button
        v-if="count > 1"
        type="button"
        class="ui-gallery__nav ui-gallery__nav--prev"
        aria-label="Previous image"
        @click="go(current - 1)"
      >
        <UiIcon name="chevron-left" size="1.4em" />
      </button>
      <slot name="item" :item="value[current]" :index="current" />
      <button
        v-if="count > 1"
        type="button"
        class="ui-gallery__nav ui-gallery__nav--next"
        aria-label="Next image"
        @click="go(current + 1)"
      >
        <UiIcon name="chevron-right" size="1.4em" />
      </button>
    </div>
    <div v-if="showThumbnails !== false && count > 1" class="ui-gallery__thumbs">
      <button
        v-for="(item, i) in value"
        :key="i"
        type="button"
        class="ui-gallery__thumb"
        :class="{ 'is-active': i === current }"
        :aria-label="`Show image ${i + 1}`"
        @click="go(i)"
      >
        <slot name="thumbnail" :item="item" :index="i" />
      </button>
    </div>
    <slot name="footer" />
  </div>
</template>

<style scoped>
.ui-gallery {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.ui-gallery__stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--surface-alt);
}
.ui-gallery__nav {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--line);
  border-radius: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 1;
}
.ui-gallery__nav--prev {
  left: 0.75rem;
}
.ui-gallery__nav--next {
  right: 0.75rem;
}
.ui-gallery__thumbs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  overflow-x: auto;
  border-top: 1px solid var(--line);
}
.ui-gallery__thumb {
  flex: 0 0 auto;
  width: 4.5rem;
  padding: 0.2rem;
  background: var(--surface);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.ui-gallery__thumb.is-active {
  border-color: var(--gold-500);
}
.ui-gallery__thumb :deep(img) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
