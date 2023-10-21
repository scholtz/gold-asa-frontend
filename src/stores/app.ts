import { reactive, watch } from 'vue'
import { defineStore } from 'pinia'
import { usePrimeVue } from 'primevue/config'

interface IState {
  algodHost: string
  algodPort: number
  algodToken: string
  theme: string
  currentTheme: string
}

export const useAppStore = defineStore('app', () => {
  const PrimeVue = usePrimeVue()
  let defaultState: IState = {
    algodHost: 'https://mainnet-api.algonode.cloud',
    algodPort: 443,
    algodToken: '',
    theme: 'md-light-indigo',
    currentTheme: 'md-light-indigo'
  }
  try {
    const stateFromStorage = localStorage.getItem('state')
    if (stateFromStorage) {
      defaultState = JSON.parse(stateFromStorage) as IState
    }
  } catch (e: any) {
    console.error(e)
  }
  defaultState.currentTheme = 'md-light-indigo'
  if (defaultState.currentTheme != defaultState.theme) {
    console.log('setting theme:', defaultState.theme)
    console.log(`setting theme from ${defaultState.currentTheme} to ${defaultState.theme}`)
    PrimeVue.changeTheme(defaultState.currentTheme, defaultState.theme, 'theme-link')
    defaultState.currentTheme = defaultState.theme
  }
  const state = reactive(defaultState)
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
  app.state.algodHost = 'https://mainnet-api.algonode.cloud'
  app.state.algodPort = 443
  app.state.algodToken = ''
  app.state.theme = 'md-light-indigo'
}
