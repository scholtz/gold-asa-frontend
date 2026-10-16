<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'
import PageFooter from '@/components/PageFooter.vue'
import ForcedEmailVerification from '@/components/ForcedEmailVerification.vue'

import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToast } from 'primevue/usetoast'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  hideTopMenu: boolean
}>()

const store = useAppStore()
const toast = useToast()

import { AlgorandAuthentication, useAVMAuthentication } from 'algorand-authentication-component-vue'
import type { INotification } from 'algorand-authentication-component-vue'
import algosdk from 'algosdk'

const { locale } = useI18n()
const auth = useAVMAuthentication()

function onNotification(e: INotification) {
  try {
    if (e.severity == 'error') {
      console.error(e.message)
    }
    toast.add({
      severity: e.severity,
      detail: e.message,
      life: 5000
    })
  } catch (e: any) {
    console.error(e.message)
  }
}

store.state.authComponent = {
  auth: () => auth.authenticate(),
  logout: () => auth.logout(),
  sign: async (encodedTxns) => {
    const txns = encodedTxns.map((tx) => algosdk.decodeUnsignedTransaction(tx))
    return await auth.sign(
      txns,
      txns.map((_, index) => index)
    )
  }
}

// mirror the library state into the app store, so views do not depend on the library directly
watch(
  auth.authStore,
  (e) => {
    const target = store.state.authState
    target.inAuthentication = e.inAuthentication
    target.isAuthenticated = e.isAuthenticated
    target.arc14Header = e.arc14Header
    target.wallet = e.wallet
    target.account = e.account
    target.count = e.count
    target.arc76email = e.arc76email
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="flex flex-column justify-content-center min-h-full p-0 m-0">
    <Toast />
    <TopHeader :hideTopMenu="props.hideTopMenu" />
    <AlgorandAuthentication
      arc14Realm="ASA.Gold"
      :locale="locale"
      @onNotification="onNotification"
      :wallets="['biatec', 'pera', 'defly', 'exodus']"
      :algodHost="store.state.algodHost"
      :algodPort="store.state.algodPort"
      :algodToken="store.state.algodToken"
    >
      <ForcedEmailVerification>
        <div class="flex-grow-1">
          <slot />
        </div>
      </ForcedEmailVerification>
    </AlgorandAuthentication>
    <PageFooter />
  </div>
</template>
