<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
import { onMounted, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import ProductBox from '@/components/ProductBox.vue'
import Panel from 'primevue/panel'
onMounted(async () => {
  products.value = await ProductService.getAllProducts()
})

const products = ref<IEshopItem[]>()
</script>

<template>
  <Layout :hideTopMenu="false">
    <div v-if="products">
      <ProductsCarousel />

      <Panel
        header="List of all gold coins"
        class="m-4 flex flex-grow-1 flex-column"
        toggleableContent="text"
      >
        <div class="flex justify-content-between flex-row flex-wrap">
          <ProductBox
            v-for="item in products"
            :item="item"
            :key="item.asa"
            class="m-1"
          ></ProductBox>
        </div>
      </Panel>
    </div>
    <div v-else>
      <div class="m-2 text-center">Loading..</div>
      <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
      <Skeleton height="2rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" height="4rem" borderRadius="16px"></Skeleton>
    </div>
  </Layout>
</template>
