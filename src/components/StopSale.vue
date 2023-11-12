<script setup lang="ts">
import Button from 'primevue/button'
import { reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from 'primevue/usetoast'
import delay from '@/scripts/common/delay'
import { clientNotForSaleTxs, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import type algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

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

const store = useAppStore()
const state = reactive({
  sending: false,
  sent: false
})

const toast = useToast()
const executeStopSale = async () => {
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
    const grouped: algosdk.Transaction[] = await clientNotForSaleTxs({
      appClient: client,
      nftAsset: props.item.asa
    })
    console.log('grouped', grouped)
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const signedTxs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    console.log('grouped', grouped)
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
  <div>By clicking the button you will set your gold coin not to be on sale.</div>
  <div>
    <Button
      :disabled="state.sending || state.sent"
      :severity="state.sent ? 'success' : 'primary'"
      @click="executeStopSale"
      class="m-3"
      >Set not for sale</Button
    >

    <Button severity="secondary" @click="handleOnCancel" class="m-3">Go back</Button>
  </div>
</template>
