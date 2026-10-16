<script setup lang="ts">
import Button from '@/components/ui/UiButton.vue'
import { reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import type IEshopItem from '@/types/IEshopItem'
import { useToast } from '@/components/ui/useToast'
import delay from '@/scripts/common/delay'
import { clientNotForSaleTxs, getBoxReferenceNFT, getClient } from 'algorand-asa-gold'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getTransactionSignerAccount from '@/scripts/algo/getTransactionSignerAccount'
import type algosdk from 'algosdk2'
import * as algokit from '@algorandfoundation/algokit-utils'
import ProgressSpinner from '@/components/ui/UiSpinner.vue'
import clearBoxCache from '@/scripts/algo/clearBoxCache'

const emit = defineEmits(['onChange', 'onCancel'])

const handleOnChange = () => {
  console.log('stopSale.emitting onChange')
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
const testhandleOnChange = async () => {
  handleOnChange()
}
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
    console.log('calling handleOnChange')
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
  <div class="stop-sale">
    <p>By clicking the button you will set your gold coin not to be on sale.</p>
    <div class="stop-sale__actions">
      <Button
        :disabled="state.sending || state.sent"
        :severity="state.sent ? 'success' : 'primary'"
        @click="executeStopSale"
      >
        <ProgressSpinner v-if="state.sending || state.sent" class="inline-spinner" />
        Set not for sale
      </Button>

      <Button severity="secondary" @click="handleOnCancel">Go back</Button>
    </div>
  </div>
</template>
<style scoped>
.stop-sale p {
  margin: 0 0 1rem;
  color: var(--ink-soft);
}
.stop-sale__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.inline-spinner {
  width: 1em;
  height: 1em;
}
</style>
