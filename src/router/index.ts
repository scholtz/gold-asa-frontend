import { createRouter, createWebHistory } from 'vue-router'
import PublicHomeView from '../views/public/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta?.env?.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PublicHomeView
    },
    {
      path: '/auth',
      name: 'auth-home',
      component: () => import('../views/auth/HomeView.vue')
    },
    {
      path: '/trade-gold',
      name: 'public-trade-gold-token',
      component: () => import('../views/public/TradeGoldTokenView.vue')
    },
    {
      path: '/auth/trade-gold',
      name: 'auth-trade-gold-token',
      component: () => import('../views/auth/TradeGoldTokenView.vue')
    },
    {
      path: '/buy-gold-coins',
      name: 'public-trade-gold-coins',
      component: () => import('../views/public/TradeGoldCoinsView.vue')
    },
    {
      path: '/auth/buy-gold-coins',
      name: 'auth-trade-gold-coins',
      component: () => import('../views/auth/TradeGoldCoinsView.vue')
    },
    {
      path: '/proof-of-reserve',
      name: 'public-proof-of-reserve',
      component: () => import('../views/public/ProofOfReserveView.vue')
    },
    {
      path: '/auth/proof-of-reserve',
      name: 'auth-proof-of-reserve',
      component: () => import('../views/auth/ProofOfReserveView.vue')
    },
    {
      path: '/about-asa-gold',
      name: 'public-about-asa-gold',
      component: () => import('../views/public/AboutUsView.vue')
    },
    {
      path: '/auth/about-asa-gold',
      name: 'auth-about-asa-gold',
      component: () => import('../views/auth/AboutUsView.vue')
    },
    {
      path: '/contact-us',
      name: 'public-contact-us',
      component: () => import('../views/public/ContactUsView.vue')
    },
    {
      path: '/auth/contact-us',
      name: 'auth-contact-us',
      component: () => import('../views/auth/ContactUsView.vue')
    },
    {
      path: '/settings',
      name: 'public-settings',
      component: () => import('../views/public/SettingsView.vue')
    },
    {
      path: '/auth/settings',
      name: 'auth-settings',
      component: () => import('../views/auth/SettingsView.vue')
    },
    {
      path: '/buy-gold-with-eur',
      name: 'public-buy-gold-with-eur',
      component: () => import('../views/public/TradeGoldTokenFiatView.vue')
    },
    {
      path: '/auth/buy-gold-with-eur',
      name: 'auth-buy-gold-with-eur',
      component: () => import('../views/auth/TradeGoldTokenFiatView.vue')
    },
    {
      path: '/my-gold-transactions',
      name: 'public-my-gold-transactions',
      component: () => import('../views/public/MyTransactionsView.vue')
    },
    {
      path: '/auth/my-gold-transactions',
      name: 'auth-my-gold-transactions',
      component: () => import('../views/auth/MyTransactionsView.vue')
    }
  ]
})

export default router
