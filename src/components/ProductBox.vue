<script setup lang="ts">
import type IEshopItem from '@/types/IEshopItem'
import IPFSImage from './IPFSImage.vue'
import CoinState from './CoinState.vue'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
const props = defineProps<{
  item: IEshopItem
}>()
</script>
<template>
  <RouterLink
    v-if="props.item && props.item.nft"
    :to="`/coin/${props.item.nft.properties.slugName}`"
    class="product-box"
  >
    <div class="product-box__media">
      <IPFSImage
        :src="props.item.nft.properties.pictures[0].thumbnail"
        :alt="props.item.nft.name"
      />
    </div>
    <div class="product-box__body">
      <h3 class="product-box__name">{{ props.item.nft.name }}</h3>
      <p class="product-box__price" v-if="props.item.state.quoteAsset1">
        {{
          formatAssetPrice({
            value: props.item.state.quoteAsset1,
            assetId: props.item.state.asset1
          })
        }}
      </p>
      <CoinState :item="props.item"></CoinState>
    </div>
  </RouterLink>
</template>
<style scoped>
.product-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--ink);
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.product-box:hover {
  transform: translateY(-3px);
  border-color: var(--gold-300, var(--gold-500));
  box-shadow: var(--shadow-md);
}
.product-box__media {
  display: grid;
  place-items: center;
  aspect-ratio: 1 / 1;
  padding: 1rem;
  background: var(--surface-alt);
}
.product-box__media :deep(img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.product-box__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 1rem 1.25rem;
  text-align: center;
}
.product-box__name {
  margin: 0;
  font-size: 1.05rem;
}
.product-box__price {
  margin: 0;
  font-weight: 600;
  color: var(--gold-700);
}
@media (prefers-reduced-motion: reduce) {
  .product-box {
    transition: none;
  }
  .product-box:hover {
    transform: none;
  }
}
</style>
