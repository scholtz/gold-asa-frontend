<script setup lang="ts">
import { ProductService } from '@/service/ProductService'

import Button from 'primevue/button'
import { onMounted, reactive, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from 'primevue/usetoast'
import delay from '@/scripts/common/delay'
import { clientNotForSaleTxs, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import type algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'
import getAsa from '@/scripts/algo/getAsa'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import type { RouterLink } from 'vue-router'

const store = useAppStore()

const state = reactive({
  mintedTokens: ''
})

const products = ref<IEshopItem[]>()

onMounted(async () => {
  const data = (await ProductService.getAllProducts()).filter((c) => c.state.state == 1)
  if (data) {
    products.value = data
  }
  await loadMintedTokens()
})

const loadMintedTokens = async () => {
  const algod = getAlgodClient(store.state)
  const asa = await getAsa({ assetId: store.state.tokens.gold, client: algod })
  if (!asa) {
    state.mintedTokens = 'Unable to load info at the moment'
    return
  }
  const total = Number(asa.params.total)
  const account = await algod
    .accountAssetInformation(asa.params.reserve, store.state.tokens.gold)
    .do()
  const inReserves = Number(account['asset-holding']['amount'])
  console.log('account', account['asset-holding']['amount'])

  state.mintedTokens = formatAssetPrice({
    assetId: store.state.tokens.gold,
    value: total - inReserves
  })
}

const sum = () => {
  if (!products.value) return ''
  return (
    products.value
      .map((a) => a.state.weight)
      .reduce(function (a, b) {
        return a + b
      }) /
      10 ** 6 +
    ' g'
  )
}
</script>
<template>
  <DataTable :value="products" scrollable stripedRows sortMode="single">
    <Column field="nft.name" header="Name" :sortable="true" style="min-width: 200px" class="nowrap"
      ><template #body="slotProps"
        ><RouterLink :to="`/coin/${slotProps.data.nft.properties.slugName}`" class="nowrap">
          {{ slotProps.data.nft.name }}</RouterLink
        >
      </template></Column
    >
    <Column field="state.weight" header="Weight" :sortable="true">
      <template #body="slotProps"
        ><span class="nowrap">{{ slotProps.data.state.weight / 10 ** 6 }}&nbsp;g</span></template
      >
    </Column>
    <ColumnGroup type="footer">
      <Row>
        <Column footer="Sum of gold in reserves:" footerStyle="text-align:right" class="nowrap" />
        <Column class="nowrap" :footer="sum()" />
      </Row>
    </ColumnGroup>
  </DataTable>
</template>
<style>
.nowrap {
  white-space: nowrap;
}
</style>
