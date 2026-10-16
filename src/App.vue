<script setup lang="ts">
import { RouterView } from 'vue-router'
import UiToast from '@/components/ui/UiToast.vue'
import { useAppStore } from '@/stores/app'

// initialise the store (config, persisted settings) before any view needs it
useAppStore()
</script>

<template>
  <UiToast />
  <RouterView />
</template>
