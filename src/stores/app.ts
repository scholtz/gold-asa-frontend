import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'
import { usePrimeVue } from 'primevue/config'

import { AuthenticationStore } from 'algorand-authentication-component-vue'
export interface IAccount {
  email: string
  termsAndConditions: string
  marketingConsent: boolean
  lastEmailValidationTime: Date
  gdpr: string
  funded: number
}
export interface IState {
  algodHost: string
  algodPort: number
  algodToken: string
  theme: string
  currentTheme: string
  authState: AuthenticationStore
  authComponent: any
  env: 'mainnet-v1.0' | 'testnet-v1.0'
  tokens: {
    gold: number
    usdc: number
    algo: number
    btc: number
  }
  customToken: number | null
  account: IAccount | null
  reloadAccount(): Promise<void>
}
const tokens = {
  gold: 67395862,
  usdc: 37074699,
  algo: 0,
  btc: 67396528
}
const reloadAccount = async (): Promise<void> => {
  console.log('reload account base')
}
const defaultState: IState = {
  algodHost: 'https://testnet-api.algonode.cloud',
  algodPort: 443,
  algodToken: '',
  theme: 'md-light-indigo',
  currentTheme: 'md-light-indigo',
  authState: new AuthenticationStore(),
  tokens: tokens,
  customToken: null,
  authComponent: null,
  env: 'testnet-v1.0',
  account: null,
  reloadAccount: reloadAccount
}
export const useAppStore = defineStore('app', () => {
  const PrimeVue = usePrimeVue()
  const initState = defaultState
  try {
    const stateFromStorage = localStorage.getItem('state')
    if (stateFromStorage) {
      const istate = JSON.parse(stateFromStorage) as IState
      if (istate.algodHost) initState.algodHost = istate.algodHost
      if (istate.algodPort) initState.algodPort = istate.algodPort
      if (istate.algodToken) initState.algodToken = istate.algodToken
      if (istate.theme) initState.theme = istate.theme
      if (istate.tokens) initState.tokens = istate.tokens
      if (istate.env) initState.env = istate.env
      if (istate.customToken) initState.customToken = istate.customToken
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
  app.state.tokens = tokens
}
export const useTestnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'https://testnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.env = 'testnet-v1.0'
  app.state.tokens = tokens
}
