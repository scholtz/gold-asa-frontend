<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
import { onMounted, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import ProgressSpinner from 'primevue/progressspinner'
import type IEshopItem from '@/types/IEshopItem'
import Button from 'primevue/button'
import ProductBox from '@/components/ProductBox.vue'
import Panel from 'primevue/panel'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
onMounted(async () => {
  products.value = await ProductService.getAllProducts()
})

const products = ref<IEshopItem[]>()
</script>

<template>
  <Layout :hideTopMenu="false" class="ChangeBackgroundcolor1">
    <div v-if="products">
      <div class="allcoin-slider">
        <ProductsCarousel />
      </div>

      <Panel
        :header="t('trading.listOfGoldCoins')"
        class="m-4 flex flex-grow-1 flex-column card-0-2-27"
        toggleableContent="text"
      >
        <div class="flex justify-content-between setting-gold flex-row flex-wrap">
          <ProductBox
            v-for="item in products"
            :item="item"
            :key="item.asa"
            class="m-1"
          ></ProductBox>
        </div>
      </Panel>
    </div>
    <div v-else style="margin-top: 200px; height: 500px">
      <div class="m-2 text-center">
        <ProgressSpinner
          style="width: 100px; height: 100px; margin-top: 100px"
          strokeWidth="8"
          fill="var(--surface-ground)"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
      </div>
    </div>
  </Layout>
</template>
