<template>
  <article class="ui-card">
    <div v-if="$slots.header" class="ui-card__header"><slot name="header" /></div>
    <div class="ui-card__body">
      <h3 v-if="$slots.title" class="ui-card__title"><slot name="title" /></h3>
      <p v-if="$slots.subtitle" class="ui-card__subtitle"><slot name="subtitle" /></p>
      <div v-if="$slots.content" class="ui-card__content"><slot name="content" /></div>
      <slot />
    </div>
    <div v-if="$slots.footer" class="ui-card__footer"><slot name="footer" /></div>
  </article>
</template>

<style scoped>
.ui-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.ui-card__body {
  flex: 1;
  padding: 1.25rem 1.4rem;
}
.ui-card__title {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}
.ui-card__subtitle {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--gold-700);
}
.ui-card__content :last-child {
  margin-bottom: 0;
}
.ui-card__footer {
  padding: 0.9rem 1.4rem;
  border-top: 1px solid var(--line);
  background: var(--surface-alt);
}
</style>
