<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'

import { onMounted, ref } from 'vue'
import algosdk from 'algosdk'

import { useToast } from 'primevue/usetoast'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const toast = useToast()

import { AlgorandAuthentication } from 'algorand-authentication-component-vue'
import type { IAuthenticationStore, INotification } from 'algorand-authentication-component-vue'

function onStateChange(e: IAuthenticationStore) {
  console.log('onStateChange', e)
  store.state.authState.isAuthenticated = e.isAuthenticated
  store.state.authState.arc14Header = e.arc14Header
  store.state.authState.wallet = e.wallet
  store.state.authState.account = e.account
  store.state.authState.count = e.count
  store.state.authState.arc76email = e.arc76email
  store.state.authState.anyWallet = e.anyWallet
}
function onNotification(e: INotification) {
  try {
    if (e.severity == 'error') {
      console.error(e.message)
    } else {
      console.log('onNotification', e)
    }
    const ret = toast.add({
      severity: e.severity,
      detail: e.message,
      life: 5000
    })
    console.log('ret', ret)
  } catch (e: any) {
    console.error(e.message)
  }
}
console.log('AlgorandAuthentication', AlgorandAuthentication)
const authComponent = ref<InstanceType<typeof AlgorandAuthentication>>()
async function signTx() {
  if (!authComponent?.value) return

  const tx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    amount: 0,
    from: store.state.authState.account,
    suggestedParams: {
      fee: 0,
      firstRound: 32961555,
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      genesisID: 'mainnet-v1.0',
      lastRound: 32962555,
      flatFee: true
    },
    to: store.state.authState.account
  })

  const signed = await authComponent.value.sign([algosdk.encodeUnsignedTransaction(tx)])
  console.log('signed', signed)
}
async function logout() {
  if (!authComponent?.value) return
  const logout = await authComponent.value.logout()
  console.log('logout', logout)
}

onMounted(() => {
  store.state.authComponent = authComponent.value
  console.log('store.state.authComponent', store.state.authComponent)

  console.log('store.state.anyWallet', store.state.authState.anyWallet)
})
</script>

<template>
  <div class="flex flex-column justify-content-center min-h-full p-0 m-0">
    <Toast />
    <Suspense>
      <AlgorandAuthentication
        arc14Realm="ASA.Gold"
        @onStateChange="onStateChange"
        @onNotification="onNotification"
        ref="authComponent"
        :wallets="['pera', 'exodus', 'defly', 'myalgo', 'mnemonic']"
        useDemoMnemonics="novel consider desert ribbon cage first audit couple discover seed text guard crater exchange roof stable march tortoise hockey magic dawn jacket cricket ability bright"
        :algodHost="store.state.algodHost"
        :algodPort="store.state.algodPort"
        :algodToken="store.state.algodToken"
        :store="store.state.authState"
      >
        <TopHeader />
        <div class="flex-grow-1">
          <slot />
        </div>
      </AlgorandAuthentication>
    </Suspense>
  </div>
</template>
