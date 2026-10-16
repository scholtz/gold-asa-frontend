<script setup lang="ts">
import TopHeader from '@/components/TopHeader.vue'
import UiToast from '@/components/ui/UiToast.vue'
import PageFooter from '@/components/PageFooter.vue'
import ForcedEmailVerification from '@/components/ForcedEmailVerification.vue'

import { watch, onBeforeUnmount, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToast } from '@/components/ui/useToast'
import { useAppStore } from '@/stores/app'
import type { IAuthBridge } from '@/stores/app'

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

const bridge: IAuthBridge = {
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
store.state.authComponent = bridge

onBeforeUnmount(() => {
  // do not leave a bridge bound to an unmounted layout
  if (toRaw(store.state.authComponent) === bridge) store.state.authComponent = null
})

// mirror the library state into the app store, so views do not depend on the library directly
watch(
  auth.authStore,
  (e) => {
    const target = store.state.authState
    const keys = [
      'inAuthentication',
      'isAuthenticated',
      'arc14Header',
      'wallet',
      'account',
      'count',
      'arc76email'
    ] as const
    for (const key of keys) {
      if (target[key] !== e[key]) (target as any)[key] = e[key]
    }
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="layout">
    <UiToast />
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
        <main class="layout__main">
          <slot />
        </main>
      </ForcedEmailVerification>
    </AlgorandAuthentication>
    <PageFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100vh;
}
.layout__main {
  flex: 1;
}
</style>
