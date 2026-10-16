<template>
  <div class="products-carousel" v-if="products">
    <p class="products-carousel__heading">{{ t('carousel.buyGoldNftTrade') }}</p>
    <Carousel :value="products" :numVisible="3" circular :autoplayInterval="5000">
      <template #item="slotProps">
        <ProductBox :item="slotProps.data"></ProductBox>
      </template>
    </Carousel>
  </div>
  <div v-else class="products-carousel products-carousel--loading" aria-busy="true">
    <div class="products-carousel__skeletons">
      <div v-for="n in 3" :key="n" class="products-carousel__skeleton">
        <Skeleton height="10rem" borderRadius="12px" />
        <Skeleton width="60%" height="1.1rem" />
        <Skeleton width="40%" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Carousel from '@/components/ui/UiCarousel.vue'
import Skeleton from '@/components/ui/UiSkeleton.vue'
import ProductBox from './ProductBox.vue'
import { ref, onMounted } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
onMounted(async () => {
  products.value = (await ProductService.getProductsSmall()).slice(0, 9)
})
const products = ref<IEshopItem[]>()
</script>

<style scoped>
.products-carousel__heading {
  max-width: 60ch;
  margin: 0 auto 1.5rem;
  text-align: center;
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--ink);
}
.products-carousel__skeletons {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.products-carousel__skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
@media (max-width: 767px) {
  .products-carousel__skeleton:nth-child(n + 2) {
    display: none;
  }
}
</style>
