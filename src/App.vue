<script setup lang="ts">
import { RouterView } from "vue-router";
import { useAppStore } from "@/stores/app";
const store = useAppStore();
console.log("store.init", store);
</script>

<template>
  <RouterView />
</template>
