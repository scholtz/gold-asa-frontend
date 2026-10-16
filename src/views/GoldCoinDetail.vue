<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import { useRoute } from 'vue-router'
import Galleria from '@/components/ui/UiGallery.vue'
import Button from '@/components/ui/UiButton.vue'
import Tag from '@/components/ui/UiTag.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import IPFSImage from '../components/IPFSImage.vue'
import CoinState from '../components/CoinState.vue'
import BuyButton from '../components/BuyButton.vue'
import SaleCoin from '../components/SaleCoin.vue'
import StopSale from '../components/StopSale.vue'
import RequestDelivery from '../components/RequestDelivery.vue'

import Skeleton from '@/components/ui/UiSkeleton.vue'
import { useAppStore } from '@/stores/app'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import retryingLoad from '@/scripts/common/retryingLoad'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const state = reactive({
  formEditPrice: false,
  formStopSale: false,
  formRequestDelivery: false
})
const store = useAppStore()
const route = useRoute()
let stopLoading: (() => void) | undefined
onMounted(() => {
  console.log('GoldCoinDetail.onMounted')
  stopLoading = retryingLoad({
    load: async () => {
      const result = await ProductService.getProductsResult()
      const found = result.data.find((p) => p.nft.properties.slugName == route.params.slugName)
      // keep retrying while the coin is missing and some assets failed to load
      return { data: found, complete: result.complete || !!found }
    },
    onData: (found) => {
      if (found) product.value = found
    }
  })
})
onUnmounted(() => stopLoading?.())
const product = ref<IEshopItem>()
const activeIndex = ref(0)

const onChange = async () => {
  console.log('onChange')
  resetView()
  if (!product.value) return
  var client = getAlgodClient(store.state)
  let detail
  try {
    detail = await getARC0003Details({ assetId: product.value.asa, client })
  } catch (e: any) {
    console.error(`Unable to refresh coin ${product.value.asa}: ${e?.message ?? e}`)
    return
  }
  if (!detail) return
  console.log('onChange.detail', detail)
  product.value.state = detail.state
}
async function resetView() {
  console.log('resetView')
  state.formEditPrice = false
  state.formStopSale = false
  state.formRequestDelivery = false
}
</script>

<template>
  <Layout :hideTopMenu="false">
    <template v-if="product">
      <header class="page-hero">
        <div class="container">
          <h1>{{ product.nft.properties.name }}</h1>
          <div class="hero-meta"><CoinState :item="product" /></div>
        </div>
      </header>
      <section class="section">
        <div class="container coin">
          <div class="coin__gallery">
            <Galleria v-model:activeIndex="activeIndex" :value="product.nft.properties.pictures">
              <template #item="slotProps">
                <IPFSImage
                  class="coin__image"
                  :src="slotProps.item.url"
                  :alt="product.nft.properties.name"
                />
              </template>
              <template #thumbnail="slotProps">
                <IPFSImage
                  :src="slotProps.item.thumbnail"
                  :alt="`${product.nft.properties.name} ${slotProps.index + 1}`"
                />
              </template>
            </Galleria>
          </div>
          <div class="coin__info">
            <SaleCoin
              :item="product"
              @onPriceChange="onChange"
              @onCancel="resetView"
              v-if="state.formEditPrice"
              class="coin__card"
            />
            <StopSale
              :item="product"
              @onChange="onChange"
              @onCancel="resetView"
              v-else-if="state.formStopSale"
              class="coin__card"
            />
            <RequestDelivery
              :item="product"
              @onChange="onChange"
              @onCancel="resetView"
              v-else-if="state.formRequestDelivery"
              class="coin__card"
            />
            <template v-else>
              <div
                class="owner-box"
                v-if="store.state.authState.account == product.state.ownerAddr"
              >
                <Tag severity="success" rounded>You are owner of this coin</Tag>
                <div class="owner-box__actions">
                  <Button
                    v-if="product.state.state == 2"
                    size="small"
                    @click="state.formEditPrice = true"
                    >Set on sale</Button
                  >
                  <Button
                    v-if="product.state.state == 1 || product.state.state == 3"
                    size="small"
                    @click="state.formEditPrice = true"
                    >Change price</Button
                  >
                  <Button
                    v-if="product.state.state == 1 || product.state.state == 3"
                    size="small"
                    severity="secondary"
                    @click="state.formStopSale = true"
                    >Stop sale</Button
                  >
                  <Button
                    v-if="product.state.state == 2 || product.state.state == 3"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="state.formRequestDelivery = true"
                    >Request physical delivery</Button
                  >
                </div>
              </div>

              <div class="table-wrap">
                <table id="values-table" class="table details">
                  <tbody>
                    <tr>
                      <th scope="row">State</th>
                      <td><CoinState :item="product" /></td>
                    </tr>
                    <tr v-if="product.nft.properties.serialNumber">
                      <th scope="row">{{ t('productDetails.serialNumber') }}</th>
                      <td>{{ product.nft.properties.serialNumber }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.serialNumber">
                      <th scope="row">ASA Id</th>
                      <td>
                        <a
                          :href="`https://allo.info/asset/${product.asa}/nft`"
                          target="_blank"
                          rel="noopener"
                          class="asa-link"
                        >
                          {{ product.asa }}
                          <UiIcon name="expand" size="0.9em" />
                        </a>
                      </td>
                    </tr>
                    <tr v-if="product.nft.properties.diameter">
                      <th scope="row">{{ t('productDetails.diameter') }}</th>
                      <td>
                        {{ product.nft.properties.diameter }}
                        {{ product.nft.properties.diameterUnit }}
                      </td>
                    </tr>
                    <tr v-if="product.nft.properties.fitness">
                      <th scope="row">{{ t('productDetails.fitness') }}</th>
                      <td>{{ product.nft.properties.fitness }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.weight">
                      <th scope="row">{{ t('productDetails.weightOfCoin') }}</th>
                      <td>
                        {{ product.nft.properties.weight }} {{ product.nft.properties.weightUnit }}
                      </td>
                    </tr>
                    <tr v-if="product.nft.properties.goldWeight">
                      <th scope="row">Weight of gold</th>
                      <td>
                        {{ product.nft.properties.goldWeight }}
                        {{ product.nft.properties.weightUnit }}
                      </td>
                    </tr>
                    <tr v-if="product.nft.properties.issueDate">
                      <th scope="row">Date of minting</th>
                      <td>{{ new Date(product.nft.properties.issueDate).toLocaleDateString() }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.author">
                      <th scope="row">Author</th>
                      <td>{{ product.nft.properties.author }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.mintage">
                      <th scope="row">Mintage</th>
                      <td>{{ product.nft.properties.mintage }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.network">
                      <th scope="row">Blockchain network</th>
                      <td>{{ product.nft.properties.network }}</td>
                    </tr>
                    <tr v-if="product.nft.properties.inReservesSince">
                      <th scope="row">In reserves since</th>
                      <td>
                        {{ new Date(product.nft.properties.inReservesSince).toLocaleDateString() }}
                      </td>
                    </tr>
                    <tr
                      v-if="
                        product.nft.properties.reservesNumismaticValue &&
                        product.nft.properties.inReservesSince
                      "
                    >
                      <th
                        scope="row"
                        :title="`Numismatic value on ${new Date(
                          product.nft.properties.inReservesSince
                        ).toLocaleDateString()}`"
                      >
                        Initial numismatic value
                      </th>
                      <td>
                        {{
                          formatAssetPrice({
                            assetId: store.state.tokens.gold,
                            value: product.nft.properties.reservesNumismaticValue * 10 ** 6
                          })
                        }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                class="buy-coin-button"
                v-if="store.state.authState.account != product.state.ownerAddr"
              >
                <BuyButton :assetId="product.state.asset1" :item="product"></BuyButton>
              </div>
            </template>
          </div>
        </div>
      </section>
      <section class="section section--alt" v-if="product.nft.properties.story">
        <div class="container">
          <div class="prose">
            <h2>{{ t('productDetails.story') }}</h2>
            <p>{{ product.nft.properties.story }}</p>
          </div>
        </div>
      </section>
    </template>
    <template v-else>
      <header class="page-hero">
        <div class="container">
          <Skeleton width="min(24rem, 70%)" height="2.2rem" />
        </div>
      </header>
      <section class="section" aria-busy="true">
        <div class="container coin">
          <Skeleton height="26rem" borderRadius="16px" />
          <div class="skeleton-stack">
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton width="10rem" height="3rem" borderRadius="999px" />
          </div>
        </div>
      </section>
    </template>
  </Layout>
</template>
<style scoped>
.hero-meta {
  margin-top: 0.5rem;
}
.coin {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
  align-items: start;
}
.coin__image {
  display: block;
  width: 100%;
  max-width: 100%;
  max-height: 28rem;
  object-fit: contain;
}
.coin__card {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.coin__info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}
.owner-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.1rem 1.25rem;
  background: var(--gold-50);
  border: 1px solid var(--gold-300);
  border-radius: var(--radius-lg);
}
.owner-box__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.details th {
  width: 40%;
  white-space: normal;
}
.details td {
  color: var(--ink);
  word-break: break-word;
}
.asa-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--gold-700);
}
.buy-coin-button {
  display: flex;
}
.skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 992px) {
  .coin {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
  }
}
</style>
