import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'
import { usePrimeVue } from 'primevue/config'
import axios from 'axios'

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
  bff: string
  algodHost: string
  algodPort: number
  algodToken: string
  theme: string
  currentTheme: string
  authState: AuthenticationStore
  authComponent: any
  env: 'mainnet-v1.0' | 'testnet-v1.0' | 'sandnet-v1'
  tokens: {
    gold: number
    usdc: number
    algo: number
    btc: number
    eur: number
  }
  customToken: number | null
  account: IAccount | null
  appId: number
  feeCollector: string
  reloadAccount(): Promise<void>
}
const tokens = {
  gold: 67395862,
  usdc: 37074699,
  algo: 0,
  btc: 67396528,
  eur: 227855942
}
const reloadAccount = async (): Promise<void> => {
  console.log('reload account base')
}
const defaultState: IState = {
  bff: 'https://bff.asa.gold',
  algodHost: 'https://testnet-api.algonode.cloud',
  algodPort: 443,
  algodToken: '',
  theme: 'lara-light-teal',
  currentTheme: '_empty',
  authState: new AuthenticationStore(),
  tokens: tokens,
  customToken: null,
  authComponent: null,
  env: 'testnet-v1.0',
  account: null,
  appId: 0,
  feeCollector: 'H27RABAZCD4AK2AFQQDO2JJYVACGVODA4ITJWBMCI3AGYGHO46JAAXO6LU',
  reloadAccount: reloadAccount
}
interface IConfig {
  bff: string
  appId: number
  env: 'mainnet-v1.0' | 'testnet-v1.0' | 'sandnet-v1'
  algodHost: string
  algodPort: number
  algodToken: string
  goldToken: number
  usdcToken: number
  algoToken: number
  btcToken: number
  eurToken: number
  feeCollector: string
}

const initState = { ...defaultState }
let configData: IConfig | null = null
try {
  const config = await axios.get('/config.json')
  if (config && config.data) {
    configData = config.data as IConfig
    initState.bff = configData.bff
    initState.appId = configData.appId
    initState.env = configData.env
    initState.algodHost = configData.algodHost
    initState.algodPort = configData.algodPort
    initState.tokens.gold = configData.goldToken
    initState.tokens.algo = configData.algoToken
    initState.tokens.usdc = configData.usdcToken
    initState.tokens.btc = configData.btcToken
    initState.tokens.eur = configData.eurToken
    initState.feeCollector = configData.feeCollector
  }
} catch (e: any) {
  console.error(e.message)
}
console.log('configData', configData)
export const useAppStore = defineStore('app', () => {
  const PrimeVue = usePrimeVue()
  let storageState: IState | null = null
  try {
    const stateFromStorage = localStorage.getItem('state')
    if (stateFromStorage) {
      const istate = JSON.parse(stateFromStorage) as IState
      if (istate.env == initState.env) {
        // if network has been changed make sure we do not load bad data from localstorage
        if (istate.algodHost) initState.algodHost = istate.algodHost
        if (istate.algodPort) initState.algodPort = istate.algodPort
        if (istate.algodToken) initState.algodToken = istate.algodToken
        if (istate.theme) initState.theme = istate.theme
        if (istate.tokens) initState.tokens = istate.tokens
        if (istate.env) initState.env = istate.env
        if (istate.customToken) initState.customToken = istate.customToken
        if (istate.feeCollector) initState.feeCollector = istate.feeCollector
        storageState = istate
      }
    }
  } catch (e: any) {
    console.error(e)
  }
  if (initState.currentTheme != initState.theme) {
    console.log('setting theme:', initState.theme)
    console.log(`setting theme from ${initState.currentTheme} to ${initState.theme}`)
    PrimeVue.changeTheme(initState.currentTheme, initState.theme, 'theme-link')
    PrimeVue.changeTheme(initState.currentTheme, initState.theme, 'theme-link-custom')
    initState.currentTheme = initState.theme
  }

  if (configData) {
    initState.appId = configData.appId
    initState.bff = configData.bff
    initState.env = configData.env
    initState.algodHost = configData.algodHost
    initState.algodPort = configData.algodPort
    initState.algodToken = configData.algodToken
    initState.tokens.gold = configData.goldToken
    initState.tokens.algo = configData.algoToken
    initState.tokens.usdc = configData.usdcToken
    initState.tokens.btc = configData.btcToken
    initState.tokens.eur = configData.eurToken
    initState.feeCollector = configData.feeCollector
    if (storageState?.env) {
      // allow overide by the storage
      initState.env = storageState?.env
      initState.algodHost = storageState.algodHost
      initState.algodPort = storageState.algodPort
      initState.algodToken = storageState.algodToken
    }
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
        PrimeVue.changeTheme(state.currentTheme, state.theme, 'theme-link-custom')
        state.currentTheme = state.theme
      }
      if (configData) {
        state.bff = configData.bff
        state.appId = configData.appId
        state.tokens.gold = configData.goldToken
        state.tokens.algo = configData.algoToken
        state.tokens.usdc = configData.usdcToken
        state.tokens.btc = configData.btcToken
        state.tokens.eur = configData.eurToken
      }
    },
    { deep: true }
  )
  return { state }
})

export const resetConfiguration = () => {
  localStorage.clear()
  const app = useAppStore()
  app.state = { ...defaultState }
}

export const useMainnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'https://mainnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.env = 'mainnet-v1.0'
  //app.state.tokens = tokens
}
export const useTestnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'https://testnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.env = 'testnet-v1.0'
  //app.state.tokens = tokens
}

export const useSandnet = () => {
  const app = useAppStore()
  app.state.algodHost = 'http://localhost'
  app.state.algodPort = 4001
  app.state.algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  app.state.env = 'sandnet-v1'
  //app.state.tokens = tokens
}
