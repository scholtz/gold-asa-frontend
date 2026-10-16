<script setup lang="ts">
import { computed } from 'vue'

/** Inline SVG icon set (24x24, stroke based). Replaces the former icon font. */
const paths: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5V14h4v5.5h4.5V10',
  coins:
    'M9 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM15.6 9.4a5.5 5.5 0 1 1-6.2 6.2M9 6.5v6',
  cart: 'M3 4h2.2l1.6 10.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.1L20 8H6M9.5 20a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8ZM17 20a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z',
  shield: 'M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3ZM8.8 12.2l2.2 2.2 4.2-4.4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c.6-3.6 3.6-5.5 7.5-5.5s6.9 1.9 7.5 5.5',
  logout: 'M9.5 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3.5M15 8l4 4-4 4M19 12H9.5',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8',
  mail: 'M4 6.5h16v11H4v-11ZM4.5 7l7.5 6 7.5-6',
  list: 'M8.5 6.5H20M8.5 12H20M8.5 17.5H20M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01',
  play: 'M8 5.5v13l11-6.5-11-6.5Z',
  pause: 'M8 5.5v13M16 5.5v13',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  collapse: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  chat: 'M4 5.5h16v10H10l-4.5 4v-4H4v-10Z',
  circle: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  'chevron-down': 'm6 9.5 6 6 6-6',
  'chevron-up': 'm6 14.5 6-6 6 6',
  'chevron-left': 'm14.5 6-6 6 6 6',
  'chevron-right': 'm9.5 6 6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  warning: 'M12 4 3 19.5h18L12 4ZM12 10v4.5M12 17h.01',
  error: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  success: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12.2l2.5 2.5 4.5-5',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  sort: 'M8 5v14M8 19l-3-3M8 19l3-3M16 19V5M16 5l-3 3M16 5l3 3',
  discord:
    'M8.5 8.5c2.2-.8 4.8-.8 7 0M7 17c-1.2-2.8-1.7-6-.9-9 1-.6 2.1-1 3.2-1.3l.5 1M17 17c1.2-2.8 1.7-6 .9-9-1-.6-2.1-1-3.2-1.3l-.5 1M7.5 17c2.8 1.6 6.2 1.6 9 0M9.5 13h.01M14.5 13h.01',
  telegram: 'M20.5 4 3.5 10.5l5.5 2 2 6 3-3.5 4.5 3.5L20.5 4ZM9 12.5l8-5.5',
  x: 'M5 4.5h3.2l10.8 15h-3.2L5 4.5ZM18.5 4.5l-5.8 6.4M5.5 19.5l5.8-6.4'
}

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
  }>(),
  { size: '1.15em' }
)

const d = computed(() => paths[props.name] ?? paths.circle)
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    class="ui-icon"
    :width="dim"
    :height="dim"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>

<style scoped>
.ui-icon {
  flex-shrink: 0;
  vertical-align: -0.2em;
}
</style>
