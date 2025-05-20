<template>
  <div class="card product-slider-home" v-if="products">
    <div class="product-slider-heading text-center">
      <strong>Buy the gold coin NFT, trade the NFT or request physical delivery</strong>
    </div>
    <Carousel
      :value="products"
      :numVisible="3"
      :numScroll="1"
      :responsiveOptions="responsiveOptions"
      circular
      :autoplayInterval="5000"
    >
      <template #item="slotProps">
        <ProductBox :item="slotProps.data"></ProductBox>
      </template>
    </Carousel>
  </div>
  <div v-else class="col-12 text-center" style="height: 100px">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="8"
      fill="var(--surface-ground)"
      animationDuration=".5s"
      aria-label="Custom ProgressSpinner"
    />
  </div>
</template>

<script setup lang="ts">
import Carousel from 'primevue/carousel'
import ProductBox from './ProductBox.vue'
import { ref, onMounted } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
onMounted(async () => {
  products.value = (await ProductService.getProductsSmall()).slice(0, 9)
  if (products.value) {
    for (const item in responsiveOptions.value) {
      if (responsiveOptions.value[item].numVisible > products.value.length) {
        responsiveOptions.value[item].numVisible = products.value.length - 1
      }
    }
  }
})
const products = ref<IEshopItem[]>()
const responsiveOptions = ref([
  {
    breakpoint: '2899px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '2599px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '1899px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '1599px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1399px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1199px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1
  }
])
</script>
