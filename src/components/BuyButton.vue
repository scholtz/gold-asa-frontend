<script setup lang="ts">
import type IEshopItem from '@/types/IEshopItem'
import formatAssetPrice from '../scripts/algo/formatAssetPrice'
import Button from 'primevue/button'
import { clientBuyNFTTxs, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import { useAppStore } from '@/stores/app'
import { useToast } from 'primevue/usetoast'
import delay from '@/scripts/common/delay'
import { reactive } from 'vue'
import type algosdk from 'algosdk'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'

const toast = useToast()
const props = defineProps<{
  item: IEshopItem
  assetId: number
}>()

const state = reactive({
  sending: false,
  sent: false
})

const store = useAppStore()
async function buy(asset: number) {
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
    console.log('buy', asset)
    const algod = getAlgodClient(store.state)
    const sender = getTransactionSignerAccount({ addr: store.state.authState.account })
    const client = getClient({ appId: store.state.appId, algod, sender })
    console.log('buy.client', client)
    const grouped: algosdk.Transaction[] = await clientBuyNFTTxs({
      appClient: client,
      buyerAddr: store.state.authState.account,
      assetBuy: props.assetId,
      buyPrice: getPrice(),
      sellerAddress: props.item.state.sellerAddr,
      feeCollectorAddress: store.state.feeCollector,
      nftAsset: props.item.asa,
      goldToken: store.state.tokens.gold,
      algod: algod
    })
    console.log('grouped', grouped)
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const signedTxs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    console.log('grouped', grouped)
    const txSent = await algod.sendRawTransaction(signedTxs).do()
    console.log('txSent', txSent)
    state.sent = true
    state.sending = false
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
function getPrice() {
  if (props.item.state.asset1 == props.assetId) return props.item.state.quoteAsset1
  if (props.item.state.asset2 == props.assetId) return props.item.state.quoteAsset2
  if (props.item.state.asset3 == props.assetId) return props.item.state.quoteAsset3
  if (props.item.state.asset4 == props.assetId) return props.item.state.quoteAsset4
  if (props.item.state.asset5 == props.assetId) return props.item.state.quoteAsset5
  return 0
}
</script>
<template>
  <Button
    :disabled="state.sending || state.sent"
    :severity="state.sent ? 'success' : 'primary'"
    v-if="props.assetId && getPrice() > 0"
    class="mb-2"
    @click="buy(props.item.state.asset1)"
    >Buy @
    {{
      formatAssetPrice({
        assetId: props.assetId,
        value: getPrice()
      })
    }}</Button
  >
</template>
