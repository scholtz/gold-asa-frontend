<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
</script>

<template>
  <Layout :hideTopMenu="false">
    <div class="text-center sm:m-2 md:m-8">
      <h1>Aurum Standard Asset</h1>
      <div class="sm:m-1 md:m-4">
        <RouterLink to="/trade-gold">Buy</RouterLink>, use, or
        <RouterLink to="/trade-gold">sell</RouterLink> gold token backed by real gold
      </div>
      <div class="sm:m-1 md:m-4">
        Everybody can <RouterLink to="/proof-of-reserve">audit our reserves</RouterLink> - its what
        we sell in the <RouterLink to="/buy-gold-coins">eshop</RouterLink>
      </div>
      <div class="sm:m-1 md:m-4">
        Visit our <RouterLink to="/buy-gold-coins">gold eshop</RouterLink> including
        <RouterLink to="/buy-gold-coins">secondary marketplace</RouterLink>
      </div>
      <div class="sm:m-1 md:m-4">
        Each gold coin has its
        <abbr title="Non Fungible Token - Each coin is unique">NFT</abbr>, which can be traded using
        smart contract or DeFi
      </div>
      <div class="sm:m-1 md:m-4">
        NFTs in stock can be redeemed by parcel delivery within EU area
      </div>
    </div>
    <div class="grid">
      <div class="col-12">
        <ProductsCarousel />
      </div>
    </div>
  </Layout>
</template>
