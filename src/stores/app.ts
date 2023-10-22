import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'
import { usePrimeVue } from 'primevue/config'

import type { IAlgorandAuthenticationStore } from 'algorand-authentication-component-vue'
import { AlgorandAuthentication } from 'algorand-authentication-component-vue'

interface IState {
  algodHost: string
  algodPort: number
  algodToken: string
  theme: string
  currentTheme: string
  authState: IAlgorandAuthenticationStore
  authComponent: ref<InstanceType<typeof AlgorandAuthentication>> | null
  env: 'mainnet-v1.0' | 'testnet-v1.0'
  tokens: {
    gold: number
    usdc: number
    algo: number
    btc: number
  }
}

const defaultState: IState = {
  algodHost: 'https://testnet-api.algonode.cloud',
  algodPort: 443,
  algodToken: '',
  theme: 'md-light-indigo',
  currentTheme: 'md-light-indigo',
  authState: {
    isAuthenticated: false,
    arc14Header: '',
    wallet: '',
    account: '',
    count: 0,
    arc76email: ''
  },
  tokens: {
    gold: 0,
    usdc: 67395862,
    algo: 0,
    btc: 67396528
  },
  authComponent: null,
  env: 'testnet-v1.0'
}
export const useAppStore = defineStore('app', () => {
  const PrimeVue = usePrimeVue()
  let initState = defaultState
  try {
    const stateFromStorage = localStorage.getItem('state')
    if (stateFromStorage) {
      const istate = JSON.parse(stateFromStorage) as IState
      initState = { ...initState, istate }
    }
  } catch (e: any) {
    console.error(e)
  }
  initState.currentTheme = 'md-light-indigo'
  if (initState.currentTheme != initState.theme) {
    console.log('setting theme:', initState.theme)
    console.log(`setting theme from ${initState.currentTheme} to ${initState.theme}`)
    PrimeVue.changeTheme(initState.currentTheme, initState.theme, 'theme-link')
    initState.currentTheme = initState.theme
  }
  const state = reactive(initState)
  watch(
    state,
    async (newState, oldState) => {
      console.log('state update', oldState, newState)
      localStorage.setItem('state', JSON.stringify(newState))

      if (state.currentTheme != state.theme) {
        console.log(`setting theme from ${state.currentTheme} to ${state.theme}`)
        PrimeVue.changeTheme(state.currentTheme, state.theme, 'theme-link')
        state.currentTheme = state.theme
      }
    },
    { deep: true }
  )
  return { state }
})

export const resetConfiguration = () => {
  const app = useAppStore()
  app.state = defaultState
}

export const useMainnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'https://mainnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.env = 'mainnet-v1.0'
  app.state.tokens = {
    gold: 450822081,
    usdc: 67395862,
    algo: 37074699,
    btc: 67396528
  }
}
export const useTestnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'https://testnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.env = 'testnet-v1.0'
  app.state.tokens = {
    gold: 450822081,
    usdc: 67395862,
    algo: 37074699,
    btc: 67396528
  }
}
