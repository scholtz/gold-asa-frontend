<script setup lang="ts">
const props = defineProps<{
  src: string
  alt: string
  class?: string
  style?: any
}>()

function getPicture() {
  return props.src.replace('ipfs://', 'https://bff.asa.gold/ipfs/')
}
</script>
<template>
  <img :src="getPicture()" :alt="props.alt" :class="props.class" :style="props.style" />
</template>
