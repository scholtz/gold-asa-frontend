import './polyfills'
import 'algorand-authentication-component-vue/style.css'

import './assets/tokens.css'
import './assets/base.css'
import './assets/utilities.css'
import './assets/layout.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { reloadOnStaleChunk } from './scripts/common/reloadOnStaleChunk'

import { WalletManagerPlugin } from '@txnlab/use-wallet-vue'
import { pera } from '@txnlab/use-wallet-pera'
import { defly } from '@txnlab/use-wallet-defly'
import { exodus } from '@txnlab/use-wallet-exodus'
import { biatec } from 'biatec-wallet-use-wallet-client'
import { runtimeConfig } from './stores/app'


const walletNetwork = (() => {
  let env: string | undefined = runtimeConfig?.env
  try {
    const stored = JSON.parse(localStorage.getItem('state') ?? '{}')
    if (!env) env = stored.env
  } catch {
    // ignore corrupted storage
  }
  if (env === 'mainnet-v1.0') return 'mainnet'
  if (env === 'sandnet-v1') return 'localnet'
  return 'testnet'
})()

if (!import.meta.env.VITE_WC_PROJECT_ID) {
  console.warn('VITE_WC_PROJECT_ID is not set; WalletConnect based wallet connections are unavailable')
}

const app = createApp(App)

app.use(WalletManagerPlugin, {
  wallets: [biatec({ projectId: import.meta.env.VITE_WC_PROJECT_ID ?? '' }), pera(), defly(), exodus()],
  defaultNetwork: walletNetwork
})

app.use(i18n)

app.use(createPinia())
reloadOnStaleChunk(router)
app.use(router)
app.mount('#app')
