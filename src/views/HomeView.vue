<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
</script>

<template>
  <Layout :hideTopMenu="false">
    <div class="grid">
      <div class="col-12 md:col-6">
        <div class="shadow-6 m-4 p-3">
          <RouterLink to="/trade-gold">Buy</RouterLink>, use, or
          <RouterLink to="/trade-gold">sell</RouterLink> gold token backed by real gold
        </div>
        <div class="shadow-6 m-4 p-3">
          Everybody can <RouterLink to="/proof-of-reserve">audit our reserves</RouterLink> - its
          what we sell in the <RouterLink to="/buy-gold-coins">eshop</RouterLink>
        </div>
        <div class="shadow-6 m-4 p-3">
          <RouterLink to="/buy-gold-coins">Gold eshop</RouterLink> including
          <RouterLink to="/buy-gold-coins">secondary marketplace</RouterLink> is powered by Algorand
          blockchain
        </div>
      </div>
      <div class="col-12 md:col-6 text-center">
        <div class="hidden md:block m-3 p-2">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/kURiQrN0lrk?si=Q9FK_WyIjFTVpc2A"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        <div class="block md:hidden m-2 p-2">
          <iframe
            width="100%"
            height="250"
            src="https://www.youtube.com/embed/kURiQrN0lrk?si=Q9FK_WyIjFTVpc2A"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <div class="col-12">
        <ProductsCarousel />
      </div>
    </div>
  </Layout>
</template>
