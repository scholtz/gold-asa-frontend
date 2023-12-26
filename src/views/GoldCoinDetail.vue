<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import { useRoute } from 'vue-router'
import Galleria from 'primevue/galleria'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import IPFSImage from '../components/IPFSImage.vue'
import CoinState from '../components/CoinState.vue'
import BuyButton from '../components/BuyButton.vue'
import SaleCoin from '../components/SaleCoin.vue'
import StopSale from '../components/StopSale.vue'
import RequestDelivery from '../components/RequestDelivery.vue'

import Skeleton from 'primevue/skeleton'
import { useAppStore } from '@/stores/app'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
const state = reactive({
  formEditPrice: false,
  formStopSale: false,
  formRequestDelivery: false
})
const store = useAppStore()
const route = useRoute()
onMounted(async () => {
  const products = await ProductService.getAllProducts()
  product.value = products.find((p) => p.nft.properties.slugName == route.params.slugName)
})
const product = ref<IEshopItem>()
const galleria = ref()
const images = ref()
const activeIndex = ref(0)
const showThumbnails = ref(false)
const fullScreen = ref(false)
const isAutoPlay = ref(true)

const toggleAutoSlide = () => {
  isAutoPlay.value = !isAutoPlay.value
}
const onThumbnailButtonClick = () => {
  showThumbnails.value = !showThumbnails.value
}

const responsiveOptions = ref([
  {
    breakpoint: '1300px',
    numVisible: 4
  },
  {
    breakpoint: '575px',
    numVisible: 1
  }
])

const toggleFullScreen = () => {
  if (fullScreen.value) {
    closeFullScreen()
  } else {
    openFullScreen()
  }
}
const openFullScreen = () => {
  let elem = galleria.value.$el
  fullScreen.value = true
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen()
  }
}
const closeFullScreen = () => {
  fullScreen.value = false

  if (document.exitFullscreen) {
    document.exitFullscreen()
    // } else if (document.mozCancelFullScreen) {
    //   document.mozCancelFullScreen()
    // } else if (document.webkitExitFullscreen) {
    //   document.webkitExitFullscreen()
    // } else if (document.msExitFullscreen) {
    //   document.msExitFullscreen()
    // }
  }
}

const fullScreenIcon = computed(() => {
  return `pi ${fullScreen.value ? 'pi-window-minimize' : 'pi-window-maximize'}`
})
const slideButtonIcon = computed(() => {
  return `pi ${isAutoPlay.value ? 'pi-pause' : 'pi-play'}`
})

async function onChange() {
  console.log('onChange')
  if (!product.value) return
  var client = getAlgodClient(store.state)
  const detail = await getARC0003Details({ assetId: product.value.asa, client })
  if (!detail) return
  console.log('onChange.detail', detail)
  product.value.state = detail.state
  resetView()
}
async function resetView() {
  state.formEditPrice = false
  state.formStopSale = false
  state.formRequestDelivery = false
}
</script>

<template>
  <Layout :hideTopMenu="false">
    <div class="grid coin-detail" v-if="product">
      <div class="container">
        <div class="section-title">
          <h2>{{ product.nft.properties.name }}</h2>
          <div class="bar"></div>
        </div>
        <div class="row pb-8">
          <div class="col-12 md:col-6">
            <Galleria
              ref="galleria"
              v-model:activeIndex="activeIndex"
              :value="product.nft.properties.pictures"
              :numVisible="5"
              containerStyle="max-width: 600px;"
              :showThumbnails="showThumbnails"
              :showItemNavigators="true"
              :showItemNavigatorsOnHover="true"
              :circular="true"
              :autoPlay="isAutoPlay"
              :transitionInterval="10000"
              :responsiveOptions="responsiveOptions"
              :pt="{
                root: {
                  class: [{ 'flex flex-column ': fullScreen }]
                },
                content: {
                  class: ['relative', { 'flex-1 justify-content-center': fullScreen }]
                },

                thumbnailwrapper: 'absolute w-full left-0 bottom-0'
              }"
            >
              <template #item="slotProps">
                <IPFSImage
                  :src="slotProps.item.url"
                  :alt="product.nft.properties.name"
                  :style="[
                    {
                      objectFit: 'scale-down',
                      height: !fullScreen ? '400px' : '100%',
                      display: 'block'
                    }
                  ]"
                />
              </template>
              <template #thumbnail="slotProps">
                <div class="grid grid-nogutter justify-content-center">
                  <IPFSImage
                    :src="slotProps.item.thumbnail"
                    :alt="product.nft.properties.name"
                    style="display: block"
                  />
                </div>
              </template>
              <template #footer>
                <div class="flex align-items-center bg-black-alpha-90 text-300">
                  <Button
                    icon="pi pi-list"
                    @click="onThumbnailButtonClick"
                    :pt="{
                      root: {
                        class: 'border-none border-noround hover:bg-white-alpha-10 text-300',
                        style: 'background: transparent'
                      }
                    }"
                  />
                  <Button
                    :icon="slideButtonIcon"
                    @click="toggleAutoSlide"
                    :pt="{
                      root: {
                        class: 'border-none border-noround hover:bg-white-alpha-10 text-300',
                        style: 'background: transparent'
                      }
                    }"
                  />
                  <span v-if="images" class="title-container">
                    <span class="text-sm p-3">{{ activeIndex + 1 }}/{{ images.length }}</span>
                    <span class="font-bold text-sm p-3">{{ images[activeIndex].title }}</span>
                    <span class="text-sm p-3">{{ images[activeIndex].alt }}</span>
                  </span>
                  <Button
                    :icon="fullScreenIcon"
                    @click="toggleFullScreen"
                    :pt="{
                      root: {
                        class:
                          'border-none border-noround ml-auto hover:bg-white-alpha-10 text-300',
                        style: 'background: transparent'
                      }
                    }"
                  />
                </div>
              </template>
            </Galleria>
          </div>
          <div class="col-12 md:col-6 gold-detail">
            <SaleCoin
              :item="product"
              @onPriceChange="onChange"
              @onCancel="resetView"
              v-if="state.formEditPrice"
            />
            <StopSale
              :item="product"
              @onChange="onChange"
              @onCancel="resetView"
              v-else-if="state.formStopSale"
            />
            <RequestDelivery
              :item="product"
              @onChange="onChange"
              @onCancel="resetView"
              v-else-if="state.formRequestDelivery"
            />
            <table id="values-table" class="fontcolor" v-else>
              <tr v-if="store.state.authState.account == product.state.ownerAddr">
                <th></th>
                <td>
                  <Tag severity="success">You are owner of this coin</Tag>
                  <div>
                    <div>
                      <Button
                        v-if="product.state.state == 2"
                        class="my-2"
                        @click="state.formEditPrice = true"
                        >Set on sale</Button
                      >
                    </div>
                    <div>
                      <Button
                        v-if="product.state.state == 1 || product.state.state == 3"
                        class="my-2"
                        @click="state.formEditPrice = true"
                        >Change price</Button
                      >
                    </div>
                    <div>
                      <Button
                        v-if="product.state.state == 1 || product.state.state == 3"
                        class="my-2"
                        @click="state.formStopSale = true"
                        >Stop sale</Button
                      >
                    </div>
                    <div>
                      <Button
                        v-if="product.state.state == 2 || product.state.state == 3"
                        class="my-2"
                        @click="state.formRequestDelivery = true"
                        >Request physical delivery</Button
                      >
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th>State</th>
                <td><CoinState :item="product" /></td>
              </tr>
              <tr v-if="product.nft.properties.serialNumber">
                <th>Serial number</th>
                <td>{{ product.nft.properties.serialNumber }}</td>
              </tr>
              <tr v-if="product.nft.properties.diameter">
                <th>Diameter</th>
                <td>
                  {{ product.nft.properties.diameter }} {{ product.nft.properties.diameterUnit }}
                </td>
              </tr>
              <tr v-if="product.nft.properties.fitness">
                <th>Fitness</th>
                <td>{{ product.nft.properties.fitness }}</td>
              </tr>
              <tr v-if="product.nft.properties.weight">
                <th>Weight of {{ product.nft.properties.form }}</th>
                <td>{{ product.nft.properties.weight }} {{ product.nft.properties.weightUnit }}</td>
              </tr>
              <tr v-if="product.nft.properties.goldWeight">
                <th>Weight of gold</th>
                <td>
                  {{ product.nft.properties.goldWeight }} {{ product.nft.properties.weightUnit }}
                </td>
              </tr>
              <tr v-if="product.nft.properties.issueDate">
                <th>Date of minting</th>
                <td>{{ new Date(product.nft.properties.issueDate).toLocaleDateString() }}</td>
              </tr>
              <tr v-if="product.nft.properties.author">
                <th>Author</th>
                <td>{{ product.nft.properties.author }}</td>
              </tr>
              <tr v-if="product.nft.properties.mintage">
                <th>Mintage</th>
                <td>{{ product.nft.properties.mintage }}</td>
              </tr>
              <tr v-if="product.nft.properties.network">
                <th>Blockchain network</th>
                <td>{{ product.nft.properties.network }}</td>
              </tr>
              <tr v-if="product.nft.properties.inReservesSince">
                <th>In reserves since</th>
                <td>{{ new Date(product.nft.properties.inReservesSince).toLocaleDateString() }}</td>
              </tr>
              <tr
                v-if="
                  product.nft.properties.reservesNumismaticValue &&
                  product.nft.properties.inReservesSince
                "
              >
                <th
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
            </table>
            <div class="buy-coin-button team-info">
              <BuyButton
                class="btn-default"
                :assetId="product.state.asset1"
                :item="product"
              ></BuyButton>
            </div>
          </div>
        </div>
        <div class="row pb-8">
          <div class="md:col-12 col-12 tab-panel" v-if="product.nft.properties.story">
            <h4 class="buy-title ml-2">Story</h4>
            <p class="story fontcolor">{{ product.nft.properties.story }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="m-2 text-center">Loading..</div>
      <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
      <Skeleton height="2rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" height="4rem" borderRadius="16px"></Skeleton>
    </div>
    <!--<ProductBox v-if="product" :item="product" />-->
  </Layout>
</template>
<style scoped>
th {
  text-align: left;
  padding-right: 1em;
}
.story {
  font-size: smaller;
  color: #666;
}
</style>
