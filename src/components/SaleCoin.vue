<script setup lang="ts">
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import getAsaDecimals from '@/scripts/algo/getAsaDecimals'
import { computed, onMounted, reactive, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import formatAssetPrice from '@/scripts/algo/formatAssetPrice'
import getAsaFromCache from '@/scripts/algo/getAsaFromCache'
import { useToast } from 'primevue/usetoast'
import delay from '@/scripts/common/delay'
import { clientChangeQuotationTxs, getBoxReferenceNFT, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import type algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'
import ProgressSpinner from 'primevue/progressspinner'
import clearBoxCache from '@/scripts/algo/clearBoxCache'

const emit = defineEmits(['onPriceChange', 'onCancel'])

const handleOnPriceChange = () => {
  emit('onPriceChange')
}
const handleOnCancel = () => {
  emit('onCancel')
}
const props = defineProps<{
  item: IEshopItem
}>()

const store = useAppStore()
const state = reactive({
  inReview: false,
  asset1: '0',
  asset1Amount: 0,
  asset2: '0',
  asset2Amount: 0,
  asset3: '0',
  asset3Amount: 0,
  asset4: '0',
  asset4Amount: 0,
  asset5: '0',
  asset5Amount: 0,
  sending: false,
  sent: false
})
const load = () => {
  const asa1 = getAsaFromCache({ assetId: parseInt(state.asset3) })
  state.asset1 = props.item.state.asset1.toString()
  state.asset1Amount = props.item.state.quoteAsset1 / 10 ** (asa1?.params?.decimals ?? 6)
  const asa2 = getAsaFromCache({ assetId: parseInt(state.asset3) })
  state.asset2 = props.item.state.asset2.toString()
  state.asset2Amount = props.item.state.quoteAsset2 / 10 ** (asa2?.params?.decimals ?? 6)
  const asa3 = getAsaFromCache({ assetId: parseInt(state.asset3) })
  state.asset3 = props.item.state.asset3.toString()
  state.asset3Amount = props.item.state.quoteAsset3 / 10 ** (asa3?.params?.decimals ?? 6)
  const asa4 = getAsaFromCache({ assetId: parseInt(state.asset3) })
  state.asset4 = props.item.state.asset4.toString()
  state.asset4Amount = props.item.state.quoteAsset4 / 10 ** (asa4?.params?.decimals ?? 6)
  const asa5 = getAsaFromCache({ assetId: parseInt(state.asset3) })
  state.asset5 = props.item.state.asset5.toString()
  state.asset5Amount = props.item.state.quoteAsset5 / 10 ** (asa5?.params?.decimals ?? 6)

  console.log('state.load', JSON.stringify(state))
}

onMounted(() => {
  load()
})

const assets = ref([
  { name: 'Not selected', code: '0' },
  { name: `Gold (${store.state.tokens.gold})`, code: store.state.tokens.gold.toString() },
  { name: `USDC (${store.state.tokens.usdc})`, code: store.state.tokens.usdc.toString() },
  { name: `BTC (${store.state.tokens.btc})`, code: store.state.tokens.btc.toString() }
])

const assets2 = computed(() => {
  return assets.value.filter((v) => {
    if (parseInt(state.asset1) > 0) if (v.code == state.asset1) return false
    return true
  })
})
const assets3 = computed(() => {
  return assets.value.filter((v) => {
    if (parseInt(state.asset1) > 0) if (v.code == state.asset1) return false
    if (parseInt(state.asset2) > 0) if (v.code == state.asset2) return false
    return true
  })
})
const getDecimals = (asset: number) => {
  console.log('getDecimals', asset, state)
  return getAsaDecimals({ assetId: asset })
}
const asset1Active = () => {
  return (
    parseInt(state.asset1) > 0 &&
    state.asset1Amount > 0 &&
    getAsaFromCache({ assetId: parseInt(state.asset1) })
  )
}
const asset2Active = () => {
  return (
    parseInt(state.asset2) > 0 &&
    state.asset2Amount > 0 &&
    getAsaFromCache({ assetId: parseInt(state.asset2) })
  )
}
const asset3Active = () => {
  return (
    parseInt(state.asset3) > 0 &&
    state.asset3Amount > 0 &&
    getAsaFromCache({ assetId: parseInt(state.asset3) })
  )
}
const asset4Active = () => {
  return (
    parseInt(state.asset4) > 0 &&
    state.asset4Amount > 0 &&
    getAsaFromCache({ assetId: parseInt(state.asset4) })
  )
}
const asset5Active = () => {
  return (
    parseInt(state.asset5) > 0 &&
    state.asset5Amount > 0 &&
    getAsaFromCache({ assetId: parseInt(state.asset5) })
  )
}
const onlyOnePriceIsSet = () => {
  let count = 0
  if (asset1Active()) count++
  if (asset2Active()) count++
  if (asset3Active()) count++
  if (asset4Active()) count++
  if (asset5Active()) count++
  return count == 1
}
const anyPriceIsSet = () => {
  let count = 0
  if (asset1Active()) count++
  if (asset2Active()) count++
  if (asset3Active()) count++
  if (asset4Active()) count++
  if (asset5Active()) count++
  return count > 0
}
interface IClientChangePriceInput {
  appClient: any
  nftAsset: number
  goldToken?: number | undefined
  goldTokenPrice?: number | undefined
  asa2?: number | undefined
  asa2Price?: number | undefined
  asa3?: number | undefined
  asa3Price?: number | undefined
  asa4?: number | undefined
  asa4Price?: number | undefined
  asa5?: number | undefined
  asa5Price?: number | undefined
}

const toast = useToast()
const executeSale = async () => {
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
    const algod = getAlgodClient(store.state)
    const sender = getTransactionSignerAccount({ addr: store.state.authState.account })
    const client = getClient({ appId: store.state.appId, algod, sender })
    const input: IClientChangePriceInput = {
      appClient: client,
      nftAsset: props.item.asa
    }
    if (asset1Active()) {
      input.goldToken = parseInt(state.asset1)
      input.goldTokenPrice =
        state.asset1Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset1) })
    }
    if (asset2Active()) {
      input.asa2 = parseInt(state.asset2)
      input.asa2Price =
        state.asset2Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset2) })
    }
    if (asset3Active()) {
      input.asa3 = parseInt(state.asset3)
      input.asa3Price =
        state.asset3Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset3) })
    }
    if (asset4Active()) {
      input.asa4 = parseInt(state.asset4)
      input.asa4Price =
        state.asset4Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset4) })
    }
    if (asset5Active()) {
      input.asa5 = parseInt(state.asset5)
      input.asa5Price =
        state.asset5Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset5) })
    }
    console.log('input', input)
    const grouped: algosdk.Transaction[] = await clientChangeQuotationTxs(input)

    const groupedEncoded = grouped.map((tx) => tx.toByte())
    console.log('grouped', grouped)
    console.log('state', JSON.stringify(state))
    const signedTxs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    console.log('state', JSON.stringify(state))
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
    await delay(1000)
    load()
    handleOnPriceChange()
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
  <div>
    <table v-if="!state.inReview">
      <tr>
        <th>Token</th>
        <th>Price</th>
      </tr>
      <tr>
        <td>
          <Dropdown
            v-model="state.asset1"
            :options="assets"
            optionLabel="name"
            optionValue="code"
            placeholder="Select a token to receive"
            class="w-full"
          />
        </td>
        <td>
          <InputNumber
            v-if="parseInt(state.asset1) > 0"
            v-model="state.asset1Amount"
            :min="0"
            :minFractionDigits="getDecimals(parseInt(state.asset1))"
            :maxFractionDigits="getDecimals(parseInt(state.asset1))"
          />
        </td>
      </tr>
      <tr>
        <td>
          <Dropdown
            v-model="state.asset2"
            :options="assets2"
            optionLabel="name"
            optionValue="code"
            placeholder="Select a token to receive"
            class="w-full"
          />
        </td>
        <td>
          <InputNumber
            v-if="parseInt(state.asset2) > 0"
            v-model="state.asset2Amount"
            :min="0"
            :minFractionDigits="getDecimals(parseInt(state.asset2))"
            :maxFractionDigits="getDecimals(parseInt(state.asset2))"
          />
        </td>
      </tr>
      <tr>
        <td>
          <Dropdown
            v-model="state.asset3"
            :options="assets3"
            optionLabel="name"
            optionValue="code"
            placeholder="Select a token to receive"
            class="w-full"
          />
        </td>
        <td>
          <InputNumber
            v-if="parseInt(state.asset3) > 0"
            v-model="state.asset3Amount"
            :min="0"
            :minFractionDigits="getDecimals(parseInt(state.asset3))"
            :maxFractionDigits="getDecimals(parseInt(state.asset3))"
          />
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          <Button :disabled="!anyPriceIsSet()" @click="state.inReview = true" class="m-2">
            Review sale
          </Button>
          <Button severity="secondary" @click="handleOnCancel" class="m-2">Cancel</Button>
        </td>
      </tr>
    </table>
    <div v-else>
      <div v-if="onlyOnePriceIsSet()">
        You are setting the sale of this gold coin for
        <span v-if="asset1Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset1),
            value: state.asset1Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset1) })
          })
        }}</span>
        <span v-if="asset2Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset2),
            value: state.asset2Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset2) })
          })
        }}</span>
        <span v-if="asset3Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset3),
            value: state.asset3Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset3) })
          })
        }}</span>
        <span v-if="asset4Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset4),
            value: state.asset4Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset4) })
          })
        }}</span>
        <span v-if="asset5Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset5),
            value: state.asset5Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset5) })
          })
        }}</span>
      </div>
      <div v-else>
        You are setting the sale of this gold coin for any of combination of these prices
        <span v-if="asset1Active()">{{
          formatAssetPrice({
            assetId: parseInt(state.asset1),
            value: state.asset1Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset1) })
          })
        }}</span>
        <span v-if="asset2Active()"
          >,{{
            formatAssetPrice({
              assetId: parseInt(state.asset2),
              value: state.asset2Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset2) })
            })
          }}</span
        >
        <span v-if="asset3Active()"
          >,{{
            formatAssetPrice({
              assetId: parseInt(state.asset3),
              value: state.asset3Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset3) })
            })
          }}</span
        >
        <span v-if="asset4Active()"
          >,{{
            formatAssetPrice({
              assetId: parseInt(state.asset4),
              value: state.asset4Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset4) })
            })
          }}</span
        >
        <span v-if="asset5Active()"
          >,{{
            formatAssetPrice({
              assetId: parseInt(state.asset5),
              value: state.asset5Amount * 10 ** getAsaDecimals({ assetId: parseInt(state.asset5) })
            })
          }}</span
        >
      </div>

      <Button
        :disabled="state.sending || state.sent"
        :severity="state.sent ? 'success' : 'primary'"
        @click="executeSale()"
        class="m-3"
      >
        <ProgressSpinner
          v-if="state.sending || state.sent"
          style="width: 1em; height: 1em"
          strokeWidth="8"
          animationDuration=".5s"
          class="mx-1"
        />
        Set on sale
      </Button>

      <Button severity="secondary" @click="state.inReview = false" class="m-3">Go back</Button>
    </div>
  </div>
</template>
