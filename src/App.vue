<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Gradient } from 'whatamesh'
import { onMounted, watch } from 'vue'
const store = useAppStore()
console.log('store.init', store)
let gradient = new Gradient()
onMounted(() => {
  gradient.initGradient('#gradient-canvas')
})
watch(
  store.state,
  () => {
    setTimeout(() => {
      gradient.initGradient('#gradient-canvas')
    }, 200)
  },
  { deep: true }
)
</script>

<template>
  <canvas id="gradient-canvas"></canvas>
  <RouterView />
</template>
