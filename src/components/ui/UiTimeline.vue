<script setup lang="ts" generic="T">
defineProps<{ value: T[]; align?: 'left' | 'right' | 'alternate' }>()
defineSlots<{
  opposite(props: { item: T; index: number }): unknown
  marker(props: { item: T; index: number }): unknown
  content(props: { item: T; index: number }): unknown
}>()
</script>

<template>
  <ol class="ui-timeline" :class="`ui-timeline--${align ?? 'left'}`">
    <li v-for="(item, index) in value" :key="index" class="ui-timeline__event">
      <div class="ui-timeline__opposite">
        <slot name="opposite" :item="item" :index="index" />
      </div>
      <div class="ui-timeline__separator">
        <slot name="marker" :item="item" :index="index">
          <span class="ui-timeline__dot" />
        </slot>
        <span v-if="index < value.length - 1" class="ui-timeline__line" />
      </div>
      <div class="ui-timeline__content">
        <slot name="content" :item="item" :index="index" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.ui-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}
.ui-timeline__event {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0 1.25rem;
  min-height: 5rem;
}
.ui-timeline__opposite {
  text-align: right;
  padding-bottom: 1.5rem;
}
.ui-timeline__separator {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ui-timeline__dot {
  width: 0.9rem;
  height: 0.9rem;
  margin-top: 0.4rem;
  background: var(--gold-500);
  border: 3px solid var(--gold-100);
  border-radius: 50%;
  box-sizing: content-box;
}
.ui-timeline__line {
  flex: 1;
  width: 2px;
  margin-top: 0.3rem;
  background: var(--line-strong);
}
.ui-timeline__content {
  padding-bottom: 1.5rem;
}
.ui-timeline--alternate .ui-timeline__event:nth-child(even) .ui-timeline__opposite {
  order: 3;
  text-align: left;
}
.ui-timeline--alternate .ui-timeline__event:nth-child(even) .ui-timeline__content {
  order: 1;
  text-align: right;
}
.ui-timeline--left .ui-timeline__event {
  grid-template-columns: auto 1fr;
}
.ui-timeline--left .ui-timeline__opposite {
  display: none;
}

@media (max-width: 767px) {
  .ui-timeline--alternate .ui-timeline__event,
  .ui-timeline__event {
    grid-template-columns: auto 1fr;
  }
  .ui-timeline__opposite {
    display: none;
  }
  .ui-timeline--alternate .ui-timeline__event:nth-child(even) .ui-timeline__content {
    order: 0;
    text-align: left;
  }
}
</style>
