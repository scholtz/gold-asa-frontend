<script setup lang="ts" generic="T">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import UiIcon from './UiIcon.vue'

const props = withDefaults(
  defineProps<{
    value: T[]
    /** Maximum number of items shown at once; fewer are shown on narrow containers. */
    numVisible?: number
    /** Minimum width of one item in px; decides how many fit. */
    minItemWidth?: number
    circular?: boolean
    autoplayInterval?: number
  }>(),
  { numVisible: 3, minItemWidth: 260 }
)

defineSlots<{ item(props: { data: T; index: number }): unknown }>()

const track = ref<HTMLElement>()
const width = ref(0)
const index = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
let observer: ResizeObserver | undefined

const visible = computed(() =>
  Math.max(1, Math.min(props.numVisible, props.value.length, Math.floor(width.value / props.minItemWidth) || 1))
)
const maxIndex = computed(() => Math.max(0, props.value.length - visible.value))

const go = (target: number) => {
  if (target > maxIndex.value) index.value = props.circular ? 0 : maxIndex.value
  else if (target < 0) index.value = props.circular ? maxIndex.value : 0
  else index.value = target
}
const next = () => go(index.value + 1)
const prev = () => go(index.value - 1)

const stop = () => clearInterval(timer)
const start = () => {
  stop()
  if (props.autoplayInterval && props.value.length > visible.value) timer = setInterval(next, props.autoplayInterval)
}

onMounted(() => {
  if (track.value) {
    observer = new ResizeObserver(([entry]) => (width.value = entry.contentRect.width))
    observer.observe(track.value)
  }
  start()
})
onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
})
</script>

<template>
  <div class="ui-carousel" @mouseenter="stop" @mouseleave="start" @focusin="stop" @focusout="start">
    <button v-if="maxIndex > 0" type="button" class="ui-carousel__nav ui-carousel__nav--prev" aria-label="Previous" @click="prev">
      <UiIcon name="chevron-left" size="1.4em" />
    </button>
    <div ref="track" class="ui-carousel__viewport">
      <div
        class="ui-carousel__track"
        :style="{ transform: `translateX(calc(${index} * -100% / ${visible}))` }"
      >
        <div v-for="(item, i) in value" :key="i" class="ui-carousel__item" :style="{ flexBasis: `${100 / visible}%` }">
          <slot name="item" :data="item" :index="i" />
        </div>
      </div>
    </div>
    <button v-if="maxIndex > 0" type="button" class="ui-carousel__nav ui-carousel__nav--next" aria-label="Next" @click="next">
      <UiIcon name="chevron-right" size="1.4em" />
    </button>
  </div>
  <div v-if="maxIndex > 0" class="ui-carousel__dots" role="tablist">
    <button
      v-for="n in maxIndex + 1"
      :key="n"
      type="button"
      role="tab"
      class="ui-carousel__dot"
      :class="{ 'is-active': n - 1 === index }"
      :aria-label="`Go to slide ${n}`"
      :aria-selected="n - 1 === index"
      @click="go(n - 1)"
    />
  </div>
</template>

<style scoped>
.ui-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ui-carousel__viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.ui-carousel__track {
  display: flex;
  transition: transform 0.4s ease;
}
.ui-carousel__item {
  flex: 0 0 auto;
  min-width: 0;
  padding: 0.5rem;
}
.ui-carousel__nav {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.ui-carousel__nav:hover {
  color: var(--gold-700);
  border-color: var(--gold-500);
}
.ui-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.ui-carousel__dot {
  width: 0.6rem;
  height: 0.6rem;
  padding: 0;
  background: var(--line-strong);
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}
.ui-carousel__dot.is-active {
  background: var(--gold-600);
  transform: scale(1.25);
}
@media (prefers-reduced-motion: reduce) {
  .ui-carousel__track {
    transition: none;
  }
}
</style>
