<template>
  <svg class="ui-spinner" viewBox="0 0 50 50" role="progressbar" aria-label="Loading">
    <circle class="ui-spinner__track" cx="25" cy="25" r="20" fill="none" stroke-width="5" />
    <circle
      class="ui-spinner__arc"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke-width="5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.ui-spinner {
  width: 2rem;
  height: 2rem;
  color: var(--gold-600);
  animation: ui-spin 0.9s linear infinite;
}
.ui-spinner__track {
  stroke: currentColor;
  opacity: 0.2;
}
.ui-spinner__arc {
  stroke: currentColor;
  stroke-dasharray: 32 125;
}
@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
