<script setup lang="ts">
import { ProductService } from '@/service/ProductService'

import Button from '@/components/ui/UiButton.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from '@/components/ui/useToast'
import delay from '@/scripts/common/delay'
import { clientNotForSaleTxs, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import type algosdk from 'algosdk2'
import * as algokit from '@algorandfoundation/algokit-utils'
import getAsa from '@/scripts/algo/getAsa'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import { RouterLink } from 'vue-router'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useRetryingLoad } from '@/scripts/common/retryingLoad'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()

const state = reactive({
  mintedTokens: ''
})

const products = ref<IEshopItem[]>()

useRetryingLoad({
  load: () => ProductService.getProductsResult(),
  onData: (data) => (products.value = data.filter((c) => c.state.state == 1))
})

onMounted(async () => {
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

type SortKey = 'name' | 'weight'
const sortKey = ref<SortKey>('name')
const sortAsc = ref(true)
const sortBy = (key: SortKey) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = true
  }
}
const sorted = computed(() => {
  const list = [...(products.value ?? [])]
  const dir = sortAsc.value ? 1 : -1
  return list.sort((a, b) =>
    sortKey.value === 'weight'
      ? (a.state.weight - b.state.weight) * dir
      : String(a.nft.name).localeCompare(String(b.nft.name)) * dir
  )
})

const sum = () => {
  if (!products.value) return ''
  return (
    products.value
      .map((a) => a.state.weight)
      .reduce(function (a, b) {
        return a + b
      }, 0) /
      10 ** 6 +
    ' g'
  )
}

</script>
<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th scope="col" :aria-sort="sortKey === 'name' ? (sortAsc ? 'ascending' : 'descending') : 'none'">
            <button type="button" class="sort" @click="sortBy('name')">
              Name <UiIcon name="sort" size="1em" />
            </button>
          </th>
          <th
            scope="col"
            class="num"
            :aria-sort="sortKey === 'weight' ? (sortAsc ? 'ascending' : 'descending') : 'none'"
          >
            <button type="button" class="sort" @click="sortBy('weight')">
              Weight <UiIcon name="sort" size="1em" />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in sorted" :key="item.nft.properties.slugName">
          <td>
            <RouterLink :to="`/coin/${item.nft.properties.slugName}`" class="nowrap">{{
              item.nft.name
            }}</RouterLink>
          </td>
          <td class="num nowrap">{{ item.state.weight / 10 ** 6 }}&nbsp;g</td>
        </tr>
        <tr v-if="!products">
          <td colspan="2">Loading...</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">{{ t('reserves.sumOfGoldInReserves') }}:</th>
          <th class="num nowrap">{{ sum() }}</th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
.sort {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.sort:hover {
  color: var(--ink);
}
tfoot th {
  background: var(--surface-alt);
  color: var(--ink);
  border-top: 2px solid var(--line-strong);
}
</style>
