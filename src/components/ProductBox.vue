<script setup lang="ts">
import type IEshopItem from '@/types/IEshopItem'
import IPFSImage from './IPFSImage.vue'
import CoinState from './CoinState.vue'
const props = defineProps<{
  item: IEshopItem
}>()
</script>
<template>
  <RouterLink :to="`/coin/${props.item.nft.properties.slugName}`">
    <div class="border-1 surface-border border-round m-1 text-center py-2 px-2">
      <div class="mb-2">
        <IPFSImage
          :src="props.item.nft.properties.pictures[0].thumbnail"
          :alt="props.item.nft.name"
          class="shadow-2"
        />
      </div>
      <div>
        <h4 class="mb-1">
          {{ props.item.nft.name }}
        </h4>
        <h6 class="mt-0 mb-3">${{ props.item.state.quoteAsset1 }}</h6>
        <div><CoinState :item="props.item"></CoinState></div>
      </div></div
  ></RouterLink>
</template>
<style>
a {
  text-decoration: none;
}
</style>
