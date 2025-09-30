import 'algorand-authentication-component-vue/dist/style.css'

import 'primeflex/primeflex.scss'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(i18n)

app.use(createPinia())
app.use(router)
app.component('Toast', Toast)
app.mount('#app')
