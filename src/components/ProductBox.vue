<script setup lang="ts">
import type IEshopItem from '@/types/IEshopItem'
import IPFSImage from './IPFSImage.vue'
import CoinState from './CoinState.vue'
import Button from 'primevue/button'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
const props = defineProps<{
  item: IEshopItem
}>()
</script>
<template>
  <RouterLink
    v-if="props.item && props.item.nft"
    :to="`/coin/${props.item.nft.properties.slugName}`"
  >
    <div class="border-1 surface-border border-round text-center">
      <div class="mb-2">
        <IPFSImage
          :src="props.item.nft.properties.pictures[0].thumbnail"
          :alt="props.item.nft.name"
        />
      </div>
      <div>
        <h4 class="mb-1">
          <Button>{{ props.item.nft.name }}</Button>
        </h4>
        <h6 class="mt-0 mb-3" v-if="props.item.state.quoteAsset1">
          <Button size="small" link>
            {{
              formatAssetPrice({
                value: props.item.state.quoteAsset1,
                assetId: props.item.state.asset1
              })
            }}
          </Button>
        </h6>
        <div><CoinState :item="props.item"></CoinState></div>
      </div></div
  ></RouterLink>
</template>
