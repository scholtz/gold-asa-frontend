<script setup lang="ts">
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiTag from '@/components/ui/UiTag.vue'
import UiButton from '@/components/ui/UiButton.vue'

const props = defineProps<{
  hideTopMenu: boolean
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useAppStore()

const items = computed(() => [
  { label: t('navigation.home'), icon: 'home', route: '/' },
  { label: t('trading.dexTrading'), icon: 'coins', route: '/trade-gold' },
  { label: t('navigation.buyGoldCoins'), icon: 'cart', route: '/buy-gold-coins' },
  { label: t('navigation.proofOfReserves'), icon: 'shield', route: '/proof-of-reserve' }
])

const network = computed(() => {
  switch (store.state.env) {
    case 'mainnet-v1.0':
      return { label: 'Mainnet', severity: 'success' as const }
    case 'testnet-v1.0':
      return { label: 'Testnet', severity: 'warning' as const }
    case 'sandnet-v1':
      return { label: 'Sandbox', severity: 'warning' as const }
    default:
      return { label: store.state.algodHost, severity: 'warning' as const }
  }
})

const menuOpen = ref(false)
watch(
  () => route.fullPath,
  () => (menuOpen.value = false)
)

const isActive = (path: string) => (path === '/' ? route.path === '/' : route.path.startsWith(path))

async function logout() {
  if (!store.state.authComponent) {
    console.error('Unable to logout, authcomponent not initialized', store.state.authComponent)
    return
  }
  try {
    await store.state.authComponent?.logout()
  } catch (e: any) {
    console.error(e.message)
  }
  // authState is mirrored from the auth library (see AuthLayout), so it is cleared by the library logout
  router.push('/')
}
</script>

<template>
  <header class="site-header">
    <div class="container site-header__bar">
      <RouterLink to="/" class="brand" aria-label="ASA.Gold home">
        <img src="/images/logo.png" alt="" class="brand__logo" width="44" height="44" />
        <span class="brand__name">ASA<span>.Gold</span></span>
      </RouterLink>

      <nav v-if="!props.hideTopMenu" class="nav" :class="{ 'is-open': menuOpen }" aria-label="Main">
        <RouterLink
          v-for="item in items"
          :key="item.route"
          :to="item.route"
          class="nav__link"
          :class="{ 'is-active': isActive(item.route) }"
        >
          <UiIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="site-header__actions">
        <UiTag class="network-tag" :severity="network.severity" rounded>{{ network.label }}</UiTag>
        <UiButton
          v-if="!store.state.authState.isAuthenticated"
          icon="user"
          size="small"
          rounded
          aria-label="Log in"
          @click="store.state.authComponent?.auth()"
        >
          <span class="hide-sm">Log in</span>
        </UiButton>
        <UiButton
          v-else
          icon="logout"
          size="small"
          rounded
          outlined
          severity="secondary"
          aria-label="Log out"
          @click="logout"
        >
          <span class="hide-sm">Log out</span>
        </UiButton>
        <button
          v-if="!props.hideTopMenu"
          type="button"
          class="burger"
          :aria-expanded="menuOpen"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <UiIcon :name="menuOpen ? 'close' : 'menu'" size="1.5em" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(18, 26, 38, 0.96);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.site-header__bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: var(--header-height);
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--on-dark);
  text-decoration: none;
}
.brand:hover {
  color: var(--on-dark);
  text-decoration: none;
}
.brand__logo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
}
.brand__name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.brand__name span {
  color: var(--gold-300);
}
.nav {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.25rem;
}
.nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--on-dark-muted);
  border-radius: var(--radius);
  text-decoration: none;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}
.nav__link:hover {
  color: var(--on-dark);
  background: rgba(255, 255, 255, 0.07);
  text-decoration: none;
}
.nav__link.is-active {
  color: var(--gold-300);
  background: rgba(201, 162, 39, 0.14);
}
.site-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}
.burger {
  display: none;
  padding: 0.35rem;
  color: var(--on-dark);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  cursor: pointer;
}

@media (max-width: 991px) {
  .burger {
    display: inline-flex;
  }
  .nav {
    position: absolute;
    top: var(--header-height);
    left: 0;
    right: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem 1.25rem 1rem;
    background: var(--dark);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: var(--shadow-lg);
  }
  .nav.is-open {
    display: flex;
  }
  .nav__link {
    padding: 0.8rem 0.9rem;
  }
}
@media (max-width: 575px) {
  .hide-sm {
    display: none;
  }
  .site-header__bar {
    gap: 0.75rem;
  }
}
</style>
