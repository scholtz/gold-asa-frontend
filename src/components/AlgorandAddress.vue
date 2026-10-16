<script setup lang="ts">
const props = defineProps<{
  address: string
}>()
const copyToClipboard = () => {
  navigator.clipboard.writeText(props.address)
}
</script>
<template>
  <span
    v-if="props.address && props.address.length > 10"
    class="algorand-address"
    role="button"
    tabindex="0"
    @click="copyToClipboard"
    @keydown.enter.prevent="copyToClipboard"
    @keydown.space.prevent="copyToClipboard"
    :title="`Address: ${props.address}. Click to copy to clipboard.`"
    >{{ props.address.substring(0, 4) }}..{{
      props.address.substring(props.address.length - 4)
    }}</span
  >
</template>
<style scoped>
.algorand-address {
  cursor: pointer;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.1em 0.45em;
  color: var(--ink-soft);
  background: var(--surface-alt);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
.algorand-address:hover {
  color: var(--gold-700);
  border-color: var(--gold-500);
}
</style>
