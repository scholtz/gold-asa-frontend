<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
</script>

<template>
  <Layout :hideTopMenu="false">
    <ProductsCarousel />
  </Layout>
</template>
