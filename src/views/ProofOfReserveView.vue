<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { onMounted, reactive, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import ReservesList from '@/components/ReservesList.vue'
import Card from 'primevue/card'
import Timeline from 'primevue/timeline'
import { useAppStore } from '@/stores/app'
import ProgressSpinner from 'primevue/progressspinner'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getAsa from '@/scripts/algo/getAsa'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
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

  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  })
})

const products = ref<IEshopItem[]>()
const events = ref([
  {
    status: 'Disadvantages Of Gold Are:',
    date: '15/10/2020 10:30',
    icon: 'pi pi-comment',
    color: '#9C27B0',
    description: [
      "No Income or Yield - Gold doesn't generate any income or yield on its own. Unlike stocks or bonds, which can provide dividends or interest, holding gold won't produce any periodic cash flow.",
      "Lack of Cash Flow - Gold doesn't generate cash flow, which means investors can miss out on opportunities to reinvest in assets that do produce income.",
      'You can stake your gold in AMMs and generate yield',
      'Self custody - your keys your crypto',
      'Non fractionable - When you own 1 gold coin you are not likely going to split it in half when you need to pay only half of the price.'
    ]
  },
  {
    status: 'With Tokenized Gold This Disadavtages Does Not Apply.',
    date: '15/10/2020 14:00',
    icon: 'pi pi-comment',
    subtitle: "Now You Can Enjoy Combination of Algorand's Features With Gold Market.",
    color: '#673AB7',
    description: [
      'Transaction finality faster then using credit card',
      'Almost zero transaction costs (0.001 algo ~ $0.0001)',
      'You can stake your gold in AMMs and generate yield',
      'Self custody - your keys your crypto',
      'You can fraction gold up to 6 decimals of gold gram ~ $0,00005'
    ]
  }
])
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
    <div v-if="products" class="allbackground">
      <div class="Dextrading-about-background">
        <div class="col-md-12 col-sm-12 text-white welcome-banner text-center nav-text text-center">
          <div class="welcome-content">
            <h1 class="title" data-aos="fade-down">We Bring Revolution To Gold Market</h1>
            <p data-aos="zoom-in" class="fontcolor">
              Weight of gold in the reserves is always higher then minted gold backed tokens. This
              is ensured by the smart contract on public blockchain network - Algorand.
            </p>
          </div>
        </div>
      </div>
      <div class="timeline-display">
        <div class="card card-backgroundimage">
          <Timeline
            :value="events"
            align="alternate"
            class="customized-timeline"
            data-aos="fade-in"
          >
            <template #marker="slotProps">
              <span
                class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
              >
                <i :class="slotProps.item.icon"></i>
              </span>
            </template>
            <template #content="slotProps">
              <Card class="mt-5">
                <template #title>
                  {{ slotProps.item.status }}
                  {{ slotProps.item.subtitle }}
                </template>
                <template #content>
                  <ul>
                    <li v-for="desc in slotProps.item.description" :key="desc">
                      {{ desc }}
                    </li>
                  </ul>
                </template>
              </Card>
            </template>
          </Timeline>
        </div>
      </div>
      <div class="container">
        <div class="row row--15 card-display text-center">
          <div class="lg:col-4 md:col-6 sm:col-6 col-12">
            <div class="rn-address card">
              <div class="icon">
                <i
                  data-name="map-pin"
                  data-tags="location,navigation,travel,marker"
                  data-type="map-pin"
                  class="vue-feather vue-feather--map-pin"
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="feather feather-map-pin vue-feather__content"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle></svg></i>
              </div>
              <div class="inner">
                <h4 class="title">Reserves</h4>
                <p>
                  <h3 class="title">Asa.Gold Token ID</h3>
                  <a class="text-300" :href="explorerLink()" target="_blank">{{ store.state.tokens.gold }}</a> 
                </p>
                <p>
                  <h3 class="title">Minted Tokens</h3>
                  <span v-if="state.mintedTokens">{{ state.mintedTokens }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="data-table ptb--120">
          <h2 class="mb-7">List Of Gold Coins In Reserves</h2>
          <div class="grid grid-nogutter surface-section text-800">
            <div
              class="col-12 md:col-6 pl-6 text-center md:text-center flex align-items-center"
            >
              <section>
                <ReservesList />
              </section>
            </div>
            <div class="col-12 md:col-6 overflow-hidden pr-6">
              <Image src="dexdradingcompany.jpg" alt="Image" />
            </div>
          </div>
        </div> -->
      </div>
      <div class="container">
        <div class="section-title">
          <h2 class="title">Learn About Proof Of Reserves</h2>
          <div class="bar"></div>
          <p>We Bring Revolution To Gold Market</p>
        </div>
        <div class="row row--15">
          <div class="lg:col-6 md:col-6 sm:col-6 col-12">
            <div class="background rn-address">
              <div class="companyimage"></div>
            </div>
          </div>
          <div class="lg:col-6 md:col-6 sm:col-6 col-12">
            <div class="background rn-address">
              <ReservesList />
            </div>
          </div>
        </div>
      </div>
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

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  ::v-deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
      flex-direction: row !important;

      .p-timeline-event-content {
        text-align: left !important;
      }
    }

    .p-timeline-event-opposite {
      flex: 0;
    }
  }
}
</style>
