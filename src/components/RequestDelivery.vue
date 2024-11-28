<script setup lang="ts">
import Button from 'primevue/button'
import { onMounted, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from 'primevue/usetoast'
import delay from '@/scripts/common/delay'
import { clientRequestParcelDeliveryTxs, getBoxReferenceNFT, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'
import InputNumber from 'primevue/inputnumber'
import { bffGetProfile, bffUpdateProfile } from '@/scripts/axios/BFF'
import type IProfile from '@/types/IProfile'
import countries from '@/scripts/common/countries'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import formatPrice from '@/scripts/common/formatPrice'
import type { RouterLink } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import clearBoxCache from '@/scripts/algo/clearBoxCache'

const emit = defineEmits(['onChange', 'onCancel'])

const handleOnChange = () => {
  emit('onChange')
}
const handleOnCancel = () => {
  console.log('handleOnCancel')
  emit('onCancel')
}
const props = defineProps<{
  item: IEshopItem
}>()

const emptyProfile: IProfile = {
  legalEntity: '',
  firstName: '',
  lastName: '',
  company: '',
  taxId: '',
  deliveryAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  residentialAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  companyAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  }
}

const store = useAppStore()
const state = reactive({
  sending: false,
  sent: false,
  insuranceAmount: 0,
  shippingPrice: 0.9,
  address: '',
  profile: emptyProfile,
  origProfile: emptyProfile
})

async function loadProfile() {
  if (!store.state.authState?.arc14Header) return
  const profile = await bffGetProfile(store.state.authState.arc14Header)
  if (!profile) return
  const profileObj = profile as IProfile
  state.profile = profileObj
  state.origProfile = JSON.parse(JSON.stringify(state.profile))
}
watch(
  () => store.state.authState,
  async () => {
    await loadProfile()
  }
)

watch(
  () => state.insuranceAmount,
  async () => {
    state.shippingPrice = state.insuranceAmount * 0.008 + 0.9
  }
)

onMounted(async () => {
  await loadProfile()
})

const toast = useToast()
const executeRequestDelivery = async () => {
  if (!store.state.authState.isAuthenticated) {
    toast.add({
      severity: 'info',
      detail: 'Please authenticate first',
      life: 5000
    })
    await delay(1000)
    store.state.authComponent?.auth()
    return
  }
  try {
    state.sending = true
    console.log('profile', JSON.stringify(state.origProfile), JSON.stringify(state.profile))
    if (JSON.stringify(state.origProfile) != JSON.stringify(state.profile)) {
      // profile has been updated

      const updated = await bffUpdateProfile(state.profile, store.state.authState.arc14Header)
      if (!updated) {
        throw Error('Error occured while storing the delivery address')
      }
    }

    const algod = getAlgodClient(store.state)
    const params = await algod.getTransactionParams().do()
    const sender = getTransactionSignerAccount({ addr: store.state.authState.account })
    const client = getClient({ appId: store.state.appId, algod, sender })
    const unsignedTxns: algosdk.Transaction[] = await clientRequestParcelDeliveryTxs({
      appClient: client,
      nftAsset: props.item.asa
    })
    unsignedTxns.push(
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        amount: Math.round(state.shippingPrice * 10 ** 6),
        assetIndex: store.state.tokens.gold,
        from: store.state.authState.account,
        to: store.state.feeCollector,
        suggestedParams: params
      })
    )
    const unsignedTxnsWithoutGroup = unsignedTxns.map((tx) => {
      tx.group = undefined
      return tx
    })
    const grouped = algosdk.assignGroupID(unsignedTxnsWithoutGroup)
    console.log('grouped', grouped)
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const signedTxs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    state.sending = true
    console.log('grouped', grouped)
    clearBoxCache({
      index: store.state.appId,
      boxName: getBoxReferenceNFT({ nftAsset: props.item.asa, app: store.state.appId }).name
    })
    const txSent = await algod.sendRawTransaction(signedTxs).do()
    console.log('txSent', txSent)
    state.sent = true
    state.sending = false

    await algokit.waitForConfirmation(txSent.txId, 3, algod)

    handleOnChange()
  } catch (e: any) {
    state.sending = false
    console.error(e.message)
    toast.add({
      severity: 'error',
      detail: e.message,
      life: 5000
    })
  }
}
</script>
<template>
  <div v-if="!store.state.authState.isAuthenticated">
    You must authenticate before you can request physical delivery
    <Button @click="store.state.authComponent?.auth()" class="m-3">Login or Register</Button>
  </div>
  <div v-else>
    <h3>Deliver insurance price</h3>
    <p>Please define insurance price for the package in grams of gold.</p>
    <InputNumber
      id="amount"
      v-model="state.insuranceAmount"
      :min="0"
      :step="0.01"
      suffix=" GLD"
      :show-buttons="true"
      class="w-full"
    ></InputNumber>

    <div v-if="!state.profile.legalEntity">
      <p>You did not fill in your user profile yet.</p>
      <RouterLink to="/user-profile">
        <Button class="m-3">Fill in user information first</Button>
      </RouterLink>
      <Button severity="secondary" @click="handleOnCancel" class="m-3">Go back</Button>
    </div>
    <div v-else>
      <h3>Delivery address</h3>
      <Panel header="Delivery address">
        <div class="field grid">
          <label for="deliveryStreet" class="col-12 mb-2 md:col-4 md:mb-0"></label>
          <div class="col-12 md:col-8">
            <RouterLink to="/user-profile">
              <Button class="m-3">Check your full user profile</Button>
            </RouterLink>
          </div>
        </div>
        <div class="field grid">
          <label for="deliveryStreet" class="col-12 mb-2 md:col-4 md:mb-0">Street</label>
          <div class="col-12 md:col-8">
            <InputText
              id="deliveryStreet"
              type="text"
              class="w-full"
              v-model="state.profile.deliveryAddress.street"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="deliveryCity" class="col-12 mb-2 md:col-4 md:mb-0">City</label>
          <div class="col-12 md:col-8">
            <InputText
              id="deliveryCity"
              type="text"
              class="w-full"
              v-model="state.profile.deliveryAddress.city"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="deliveryZip" class="col-12 mb-2 md:col-4 md:mb-0">ZIP code</label>
          <div class="col-12 md:col-8">
            <InputText
              id="deliveryZip"
              type="text"
              class="w-full"
              v-model="state.profile.deliveryAddress.zip"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="deliveryCountry" class="col-12 mb-2 md:col-4 md:mb-0">Country</label>
          <div class="col-12 md:col-8">
            <Dropdown
              filter
              id="deliveryCountry"
              type="text"
              class="w-full"
              v-model="state.profile.deliveryAddress.country"
              optionLabel="countryName"
              optionValue="countryName"
              :options="countries"
            />
          </div>
        </div>
        <h3>Shipping price</h3>
        <p>{{ formatPrice({ value: state.shippingPrice, decimals: 4 }) }} grams of gold</p>
      </Panel>
      <Button
        severity="primary"
        @click="executeRequestDelivery"
        class="m-3"
        :disabled="state.sending || state.sent"
      >
        <ProgressSpinner
          v-if="state.sending || state.sent"
          style="width: 1em; height: 1em"
          strokeWidth="8"
          animationDuration=".5s"
          class="mx-1"
        />
        Request delivery
      </Button>
      <Button severity="secondary" @click="handleOnCancel" class="m-3">Go back</Button>
    </div>
  </div>
</template>
