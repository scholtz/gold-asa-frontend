<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
import { onMounted, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import UiIcon from '@/components/ui/UiIcon.vue'
import Skeleton from '@/components/ui/UiSkeleton.vue'
import type IEshopItem from '@/types/IEshopItem'
import ProductBox from '@/components/ProductBox.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
onMounted(async () => {
  products.value = await ProductService.getAllProducts()
})

const products = ref<IEshopItem[]>()
</script>

<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('navigation.buyGoldCoins') }}</h1>
        <p>{{ t('carousel.buyGoldNftTrade') }}</p>
      </div>
    </header>

    <template v-if="products">
      <section class="section section--alt" v-if="products.length">
        <div class="container">
          <ProductsCarousel />
        </div>
      </section>
      <section class="section">
        <div class="container">
          <h2 class="list-title">{{ t('trading.listOfGoldCoins') }}</h2>
          <div class="card-grid" v-if="products.length">
            <ProductBox v-for="item in products" :item="item" :key="item.asa"></ProductBox>
          </div>
          <div v-else class="empty" aria-hidden="true">
            <UiIcon name="coins" size="2.5em" />
          </div>
        </div>
      </section>
    </template>
    <section v-else class="section" aria-busy="true">
      <div class="container">
        <div class="card-grid">
          <div v-for="n in 8" :key="n" class="skeleton-card">
            <Skeleton height="12rem" borderRadius="12px" />
            <Skeleton width="65%" height="1.1rem" />
            <Skeleton width="40%" />
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.list-title {
  margin-bottom: 1.5rem;
}
.empty {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: var(--radius-lg);
}
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
</style>
