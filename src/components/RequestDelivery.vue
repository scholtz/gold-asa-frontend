<script setup lang="ts">
import Button from '@/components/ui/UiButton.vue'
import Panel from '@/components/ui/UiPanel.vue'
import { onMounted, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from '@/components/ui/useToast'
import delay from '@/scripts/common/delay'
import { clientRequestParcelDeliveryTxs, getBoxReferenceNFT, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import algosdk from 'algosdk2'
import * as algokit from '@algorandfoundation/algokit-utils'
import InputNumber from '@/components/ui/UiInputNumber.vue'
import { bffGetProfile, bffUpdateProfile } from '@/scripts/axios/BFF'
import type IProfile from '@/types/IProfile'
import countries from '@/scripts/common/countries'
import Dropdown from '@/components/ui/UiDropdown.vue'
import InputText from '@/components/ui/UiInputText.vue'
import formatPrice from '@/scripts/common/formatPrice'
import type { RouterLink } from 'vue-router'
import ProgressSpinner from '@/components/ui/UiSpinner.vue'
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
    const signedTxs = (await store.state.authComponent!.sign(groupedEncoded)) as Uint8Array[]
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
  <div v-if="!store.state.authState.isAuthenticated" class="delivery-login">
    <p>You must authenticate before you can request physical delivery</p>
    <Button @click="store.state.authComponent?.auth()">Login or Register</Button>
  </div>
  <div v-else class="delivery">
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

    <div v-if="!state.profile.legalEntity" class="delivery__block">
      <p>You did not fill in your user profile yet.</p>
      <div class="delivery__actions">
        <RouterLink to="/user-profile">
          <Button>Fill in user information first</Button>
        </RouterLink>
        <Button severity="secondary" @click="handleOnCancel">Go back</Button>
      </div>
    </div>
    <div v-else class="delivery__block">
      <Panel header="Delivery address">
        <div class="field-grid">
          <div class="field">
          <label for="deliveryStreet">Street</label>
          <InputText
            id="deliveryStreet"
            type="text"
            class="w-full"
            v-model="state.profile.deliveryAddress.street"
          />
          </div>
          <div class="field">
          <label for="deliveryCity">City</label>
          <InputText
            id="deliveryCity"
            type="text"
            class="w-full"
            v-model="state.profile.deliveryAddress.city"
          />
          </div>
          <div class="field">
          <label for="deliveryZip">ZIP code</label>
          <InputText
            id="deliveryZip"
            type="text"
            class="w-full"
            v-model="state.profile.deliveryAddress.zip"
          />
          </div>
          <div class="field">
          <label for="deliveryCountry">Country</label>
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
        <RouterLink to="/user-profile" class="delivery__profile-link">
          <Button severity="secondary" outlined size="small">Check your full user profile</Button>
        </RouterLink>
        <h4 class="delivery__shipping">Shipping price</h4>
        <p class="delivery__price">
          {{ formatPrice({ value: state.shippingPrice, decimals: 4 }) }} grams of gold
        </p>
      </Panel>
      <div class="delivery__actions">
        <Button
          severity="primary"
          @click="executeRequestDelivery"
          :disabled="state.sending || state.sent"
        >
          <ProgressSpinner v-if="state.sending || state.sent" class="inline-spinner" />
          Request delivery
        </Button>
        <Button severity="secondary" @click="handleOnCancel">Go back</Button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.delivery h3 {
  margin-bottom: 0.4rem;
}
.delivery p {
  color: var(--ink-soft);
}
.delivery__block {
  margin-top: 1.5rem;
}
.delivery-login {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
.delivery-login p {
  margin: 0;
}
.field-grid {
  display: grid;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-soft);
}
.delivery__profile-link {
  display: inline-block;
  margin-top: 1.25rem;
  text-decoration: none;
}
.delivery__shipping {
  margin: 1.25rem 0 0.25rem;
}
.delivery__price {
  margin: 0;
  font-weight: 600;
  color: var(--gold-700);
}
.delivery__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.delivery__actions a {
  text-decoration: none;
}
.inline-spinner {
  width: 1em;
  height: 1em;
}
@media (min-width: 576px) {
  .field-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
