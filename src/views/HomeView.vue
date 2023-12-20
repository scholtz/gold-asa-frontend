<script setup lang="ts">
import Image from "primevue/image";
import Layout from "@/layouts/AuthLayout.vue";
import ProductsCarousel from "@/components/ProductsCarousel.vue";
</script>

<template>
  <Layout :hideTopMenu="false">
  
    <div class="grid grid-nogutter surface-section backgroundImage text-800">
      <div class="col-12 md:col-9 p-3 text-center md:text-left flex align-items-center">
        <section class="fontcolor">
          <div class="sm:m-2 md:m-4 allfont">
            <h1 class="sm:m-2 md:m-4 title">Aurum Standard Asset</h1>
            <div class="sm:m-2 md:m-4">
              <RouterLink to="/trade-gold">Buy</RouterLink>, use, or
              <RouterLink to="/trade-gold">sell</RouterLink> gold token backed by real
              gold
            </div>
            <div class="sm:m-2 md:m-4">
              Everybody can
              <RouterLink to="/proof-of-reserve">audit our reserves</RouterLink> - its
              what we sell in the <RouterLink to="/buy-gold-coins">eshop</RouterLink>
            </div>
            <div class="sm:m-2 md:m-4">
              Visit our
              <RouterLink to="/buy-gold-coins">gold eshop</RouterLink> including
              <RouterLink to="/buy-gold-coins">secondary marketplace</RouterLink>
            </div>
            <div class="sm:m-2 md:m-4">
              Each gold coin has its
              <abbr title="Non Fungible Token - Each coin is unique">NFT</abbr>, which can
              be traded using smart contract or DeFi
            </div>
            <div class="sm:m-2 md:m-4">
              NFTs in stock can be redeemed by parcel delivery within EU area
            </div>
          </div>
        </section>
      </div>
      <div class="col-12 md:col-3 background-container overflow-hidden">
        <Image
          src="./android-chrome-192x192.png"
          width="300"
          alt="Image"
          class="md:ml-auto block md:h-full"
          style="margin-top: 100px"
        />
      </div>
    </div>
    <div class="grid body-grid">
      <div class="col-12">
        <ProductsCarousel />
      </div>
    </div>
  </Layout>
</template>

<style>
.fontcolor {
  font-size: "30px";
}
.background-container {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>
