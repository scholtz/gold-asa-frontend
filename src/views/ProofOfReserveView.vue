<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { onMounted, reactive, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import ReservesList from '@/components/ReservesList.vue'
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ProgressSpinner from 'primevue/progressspinner'
import delay from '@/scripts/common/delay'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getAsa from '@/scripts/algo/getAsa'
import { isReturnStatement } from 'typescript'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import { toNamespacedPath } from 'path'
import Divider from 'primevue/divider'
const store = useAppStore()

const state = reactive({
  mintedTokens: ''
})

onMounted(async () => {
  const data = (await ProductService.getAllProducts()).filter((c) => c.state.state == 1)
  if (data) {
    products.value = data
  }
  await loadMintedTokens()
})

const products = ref<IEshopItem[]>()

const explorerLink = () => {
  switch (store.state.env) {
    case 'mainnet-v1.0':
      return `https://algoexplorer.io/asset/${store.state.tokens.gold}`
    case 'testnet-v1.0':
      return `https://testnet.algoexplorer.io/asset/${store.state.tokens.gold}`
    default:
      return `https://app.dappflow.org/explorer/asset/${store.state.tokens.gold}/transactions`
  }
}

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
</script>

<template>
  <Layout :hideTopMenu="false">
    <div v-if="products">
      <Panel
        header="Proof of reserves"
        class="m-4 flex flex-grow-1 flex-column"
        toggleableContent="text"
      >
        <div class="grid">
          <div class="col-12 md:col-6">
            <h2>We bring revolution to gold market</h2>
            <p>
              Weight of gold in the reserves is always higher then minted gold backed tokens. This
              is ensured by the smart contract on public blockchain network - Algorand.
            </p>
            <p>Disadvantages of gold are:</p>
            <ul>
              <li>
                <b>No Income or Yield</b> - Gold doesn't generate any income or yield on its own.
                Unlike stocks or bonds, which can provide dividends or interest, holding gold won't
                produce any periodic cash flow.
              </li>
              <li>
                <b>Lack of Cash Flow</b> - Gold doesn't generate cash flow, which means investors
                can miss out on opportunities to reinvest in assets that do produce income.
              </li>
              <li>
                <b>Non fractionable</b> - When you own 1 gold coin you are not likely going to split
                it in half when you need to pay only half of the price.
              </li>
            </ul>
            <p>
              With tokenized gold this disadavtages <i><b>does not apply</b></i
              >. Now you can enjoy combination of algorand's features with gold market.
            </p>
            <ul>
              <li>Transaction finality <b>faster then using credit card</b></li>
              <li>Almost <b>zero transaction costs</b> (0.001 algo ~ $0.0001)</li>
              <li>You can <b>stake</b> your gold in AMMs and generate yield</li>
              <li><b>Self custody</b> - your keys your crypto</li>
              <li>You can fraction gold up to 6 decimals of gold gram ~ $0,00005</li>
            </ul>
          </div>
          <div class="col-12 md:col-6">
            <h2>Reserves</h2>
            <p>
              Asa.Gold token id is
              <a :href="explorerLink()" target="_blank">{{ store.state.tokens.gold }}</a>
            </p>
            <p>
              Minted tokens: <span v-if="state.mintedTokens">{{ state.mintedTokens }}</span
              ><ProgressSpinner
                v-else
                style="width: 1em; height: 1em"
                strokeWidth="8"
                animationDuration=".5s"
                class="mx-1"
              />
            </p>
            <h2>List of gold coins in reserves</h2>
            <ReservesList />
          </div>
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
