<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { onMounted, reactive, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import ReservesList from '@/components/ReservesList.vue'
import Card from '@/components/ui/UiCard.vue'
import Timeline from '@/components/ui/UiTimeline.vue'
import { useAppStore } from '@/stores/app'
import ProgressSpinner from '@/components/ui/UiSpinner.vue'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getAsa from '@/scripts/algo/getAsa'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import Button from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useI18n } from 'vue-i18n'
import coinsImg from '@/assets/all-coins-2.jpg'

const { t } = useI18n()
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
  await makeEventTexts()
})

const sum = () => {
  if (!products.value) return ''
  const ret = products.value
    .map((a) => a.state.weight)
    .reduce(function (a, b) {
      return a + b
    }, 0)
  return formatAssetPrice({
    assetId: store.state.tokens.gold,
    value: ret
  })
}
const products = ref<IEshopItem[]>()
interface IReserveEvent {
  status: string
  date: string
  icon: string
  color: string
  subtitle?: string
  description: string[]
}
const events = ref<IReserveEvent[]>([])
const makeEventTexts = () => {
  events.value = [
    {
      status: t('proofOfReserves.title'),
      date: '15/10/2020 10:30',
      icon: 'info',
      color: '#9C27B0',
      description: [
        t('proofOfReserves.description', { reserves: sum(), minted: state.mintedTokens })
      ]
    },
    {
      status: t('proofOfReserves.disadvantagesTitle'),
      date: '15/10/2020 10:30',
      icon: 'info',
      color: '#9C27B0',
      description: [
        t('proofOfReserves.disadvantage1'),
        t('proofOfReserves.disadvantage2'),
        t('proofOfReserves.advantage1'),
        t('proofOfReserves.advantage2'),
        t('proofOfReserves.advantage3')
      ]
    },
    {
      status: t('proofOfReserves.tokenizedGoldTitle'),
      date: '15/10/2020 14:00',
      icon: 'info',
      subtitle: t('proofOfReserves.algorandFeaturesSubtitle'),
      color: '#673AB7',
      description: [
        t('proofOfReserves.fastTransactions'),
        t('proofOfReserves.lowCosts'),
        t('proofOfReserves.stakeGold'),
        t('proofOfReserves.selfCustody'),
        t('proofOfReserves.fractionable')
      ]
    }
  ]
}
const explorerLink = () => {
  switch (store.state.env) {
    case 'mainnet-v1.0':
      return `https://allo.info/asset/${store.state.tokens.gold}/token/`
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
    state.mintedTokens = t('proofOfReserves.unableToLoad')
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
    <template v-if="products">
      <header class="page-hero">
        <div class="container">
          <h1 data-aos="fade-down">{{ t('reserves.weBringRevolutionToGoldMarket') }}</h1>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <div class="stats">
            <div class="stat">
              <p class="stat__label">{{ t('reserves.asaGoldTokenId') }}</p>
              <a :href="explorerLink()" target="_blank" rel="noopener" class="stat__link">
                <Button severity="secondary" outlined>{{ store.state.tokens.gold }}</Button>
              </a>
            </div>
            <div class="stat">
              <p class="stat__label">{{ t('reserves.mintedTokens') }}</p>
              <p class="stat__value">
                <template v-if="state.mintedTokens">{{ state.mintedTokens }}</template>
                <ProgressSpinner v-else style="width: 1.25em; height: 1.25em" />
              </p>
            </div>
          </div>

          <div class="timeline-wrap" data-aos="fade-in">
            <Timeline :value="events" align="alternate">
              <template #marker="slotProps">
                <span class="marker" aria-hidden="true">
                  <UiIcon :name="slotProps.item.icon" />
                </span>
              </template>
              <template #content="slotProps">
                <Card class="event-card">
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
      </section>

      <section class="section section--alt">
        <div class="container">
          <div class="section-head">
            <h2>{{ t('reserves.learnAboutProofOfReserves') }}</h2>
          </div>
          <div class="reserves-grid">
            <img
              class="reserves-img"
              :src="coinsImg"
              alt="Gold coins held in the ASA.Gold reserves"
              loading="lazy"
            />
            <div>
              <p class="reserves-intro">{{ t('reserves.listIntro') }}</p>
              <ReservesList />
            </div>
          </div>
        </div>
      </section>
    </template>
    <div v-else class="loading" role="status">
      <ProgressSpinner style="width: 3rem; height: 3rem" strokeWidth="6" aria-label="Loading" />
    </div>
  </Layout>
</template>

<style scoped>
.stats {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  margin-bottom: 3rem;
}
.stat {
  padding: 1.25rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.stat__label {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.stat__value {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--gold-700);
  overflow-wrap: anywhere;
}
.stat__link {
  text-decoration: none;
}
.marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--gold-50);
  border: 2px solid var(--gold-500);
  color: var(--gold-700);
  box-shadow: var(--shadow-sm);
  z-index: 1;
}
.event-card {
  margin-bottom: 1.5rem;
  text-align: left;
}
.event-card ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--ink-soft);
}
.event-card li {
  margin-bottom: 0.5rem;
}
.reserves-intro {
  margin: 0 0 1.5rem;
  color: var(--ink-soft);
}
.reserves-grid {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}
.reserves-img {
  width: 100%;
  height: 100%;
  min-height: 16rem;
  max-height: 32rem;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.loading {
  display: flex;
  justify-content: center;
  padding: 8rem 1rem;
  color: var(--gold-600);
}
@media (min-width: 992px) {
  .reserves-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
