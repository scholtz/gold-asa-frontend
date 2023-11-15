<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
</script>

<template>
  <Layout :hideTopMenu="false">
    <Panel header="ASA.Gold - gold token backed by real gold" class="m-4">
      <div class="grid">
        <div class="col-12 md:col-6">
          <ol id="mainlist">
            <li>Buy, use, or sell gold token backed by real gold</li>
            <li>Everybody can audit our reserves - its what we sell in the eshop</li>
            <li>Gold eshop including secondary marketplace is powered by Algorand blockchain</li>
          </ol>
        </div>
        <div class="col-12 md:col-6 text-center">
          <iframe width="420" height="315" src="https://www.youtube.com/watch?v=kURiQrN0lrk">
          </iframe>
        </div>
        <div class="col-12">
          <ProductsCarousel />
        </div>
      </div>
    </Panel>
  </Layout>
</template>
<style>
#mainlist li {
  position: relative;
  counter-increment: list;
  max-width: 45rem;
  margin: 1rem auto;
  padding: 1rem 1rem 1rem;
  box-shadow: 0.1rem 0.1rem 1.5rem rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
  overflow: hidden;
}
</style>
