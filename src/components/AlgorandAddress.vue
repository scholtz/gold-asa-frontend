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
    style="cursor: pointer"
    @click="copyToClipboard"
    v-if="props.address && props.address.length > 10"
    :title="`Address: ${props.address}. Click to copy to clipboard.`"
    >{{ props.address.substring(0, 4) }}..{{
      props.address.substring(props.address.length - 4)
    }}</span
  >
</template>
