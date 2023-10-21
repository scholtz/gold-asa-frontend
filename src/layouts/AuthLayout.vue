<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'

import { reactive, ref } from 'vue'
import algosdk from 'algosdk'

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { AlgorandAuthentication } from 'algorand-authentication-component-vue'
import type {
  IAlgorandAuthenticationStore,
  INotification
} from 'algorand-authentication-component-vue'
const defaultAuthState: IAlgorandAuthenticationStore = {
  isAuthenticated: false,
  arc14Header: '',
  wallet: '',
  account: '',
  count: 0,
  arc76email: ''
}
const authState = reactive({
  isAuthenticated: defaultAuthState.isAuthenticated,
  arc14Header: defaultAuthState.arc14Header,
  wallet: defaultAuthState.wallet,
  account: defaultAuthState.account,
  count: defaultAuthState.count,
  arc76email: defaultAuthState.arc76email
})

function onStateChange(e: IAlgorandAuthenticationStore) {
  console.log('onStateChange', e)
  authState.isAuthenticated = e.isAuthenticated
  authState.arc14Header = e.arc14Header
  authState.wallet = e.wallet
  authState.account = e.account
  authState.count = e.count
  authState.arc76email = e.arc76email
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
    from: authState.account,
    suggestedParams: {
      fee: 0,
      firstRound: 32961555,
      genesisHash: 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=',
      genesisID: 'mainnet-v1.0',
      lastRound: 32962555,
      flatFee: true
    },
    to: authState.account
  })

  const signed = await authComponent.value.sign([algosdk.encodeUnsignedTransaction(tx)])
  console.log('signed', signed)
}
async function logout() {
  if (!authComponent?.value) return
  const logout = await authComponent.value.logout()
  console.log('logout', logout)
}
</script>

<template>
  <div class="flex flex-column justify-content-center min-h-full p-0 m-0">
    <Toast />
    <Suspense>
      <AlgorandAuthentication
        @onStateChange="onStateChange"
        @onNotification="onNotification"
        ref="authComponent"
        :wallets="['pera', 'exodus', 'defly', 'myalgo', 'mnemonic']"
        useDemoMnemonics="novel consider desert ribbon cage first audit couple discover seed text guard crater exchange roof stable march tortoise hockey magic dawn jacket cricket ability bright"
        algodHost="https://mainnet-api.algonode.cloud"
        :algodPort="443"
      >
        <TopHeader />
        <div class="flex-grow-1">
          <slot />
        </div>
      </AlgorandAuthentication>
    </Suspense>
  </div>
</template>
