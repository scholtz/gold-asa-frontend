<template>
  <div class="card" v-if="products">
    <Carousel
      :value="products"
      :numVisible="3"
      :numScroll="1"
      :responsiveOptions="responsiveOptions"
      circular
      :autoplayInterval="20000"
      class="my-4"
    >
      <template #item="slotProps">
        <ProductBox :item="slotProps.data"></ProductBox>
      </template>
    </Carousel>
  </div>
  <div v-else>
    <div class="m-2 text-center">Loading..</div>
    <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
    <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
    <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
    <Skeleton height="2rem" class="mb-2" borderRadius="16px"></Skeleton>
    <Skeleton width="10rem" height="4rem" borderRadius="16px"></Skeleton>
  </div>
</template>

<script setup lang="ts">
import Skeleton from 'primevue/skeleton'

import Carousel from 'primevue/carousel'
import ProductBox from './ProductBox.vue'
import { ref, onMounted } from 'vue'
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
    numVisible: 7,
    numScroll: 1
  },
  {
    breakpoint: '2599px',
    numVisible: 6,
    numScroll: 1
  },
  {
    breakpoint: '1899px',
    numVisible: 5,
    numScroll: 1
  },
  {
    breakpoint: '1599px',
    numVisible: 4,
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

const getSeverity = (
  status: string
): 'success' | 'info' | 'warning' | 'danger' | string | undefined => {
  switch (status) {
    case 'INSTOCK':
      return 'success'

    case 'LOWSTOCK':
      return 'warning'

    case 'OUTOFSTOCK':
      return 'danger'

    default:
      return undefined
  }
}
</script>
