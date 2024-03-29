<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { useAppStore } from '@/stores/app'
const props = defineProps<{
  hideTopMenu: boolean
}>()

const router = useRouter()
const store = useAppStore()

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  // {
  //   label: 'Fiat payment',
  //   icon: 'pi pi-fw pi-money-bill',
  //   route: '/buy-gold-with-eur'
  // },
  {
    label: 'DEX trading',
    icon: 'pi pi-fw pi-bitcoin',
    route: '/trade-gold'
  },
  {
    label: 'Buy gold coins',
    icon: 'pi pi-fw pi-shopping-cart',
    route: '/buy-gold-coins'
  },
  {
    label: 'Proof of reserves',
    icon: 'pi pi-fw pi-verified',
    route: '/proof-of-reserve'
  }
])
// window.addEventListener("scroll", handleScroll);

function logout() {
  if (!store.state.authComponent) {
    console.error('Unable to logout, authcomponent not initialized', store.state.authComponent)
    return
  }
  console.log('sending logout')
  store.state.authComponent?.logout()
  store.state.authState.isAuthenticated = false
  store.state.authState.arc76email = ''
  store.state.authState.arc14Header = ''
  store.state.authState.account = ''
  router.push('/')
  console.log('logout sent')
}

const showScrollMessage = ref(false)
const dynamicClass = ref(false)

const handleScroll = () => {
  const scrollPosition = window.scrollY || window.pageYOffset
  showScrollMessage.value = scrollPosition > 0

  if (scrollPosition >= 0) {
    dynamicClass.value = true
  } else {
    dynamicClass.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header>
    <Menubar
      v-if="!props.hideTopMenu"
      :model="items"
      class="border-0 lg:m-4 m-1"
      breakpoint="1420px"
    >
      <template #start>
        <div class="block md:hidden">
          <img
            class="logo-small m-1"
            src="/images/logo.png"
            style="width: 60px"
            alt="logo"
            @click="$router.push('/')"
          />
        </div>
        <div class="hidden md:block lg:block xl:block">
          <img
            class="logo m-1"
            src="/images/logo.png"
            style="width: 80px"
            alt="logo"
            @click="$router.push('/')"
          />
        </div>
      </template>
      <template #item="{ item, props }">
        <RouterLink v-if="item.route" :to="item.route">
          <Button link class="align-items-center flex flex-row" v-bind="props.action">
            <i class="text" :class="item.icon" />
            <div class="text ml-2">{{ item.label }}</div>
          </Button>
        </RouterLink>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2 allitems">
          <Badge
            class="align-self-center mr-3"
            v-if="store.state.env == 'testnet-v1.0'"
            value="Testnet"
            severity="warn"
          ></Badge>
          <Badge
            class="align-self-center mr-3"
            v-else-if="store.state.env == 'mainnet-v1.0'"
            value="Mainnet"
            severity="success"
          ></Badge>
          <Badge
            class="align-self-center mr-3"
            v-else-if="store.state.env == 'sandnet-v1'"
            value="Sandbox"
            severity="warn"
          ></Badge>
          <Badge
            class="align-self-center mr-3"
            v-else
            :value="store.state.algodHost"
            severity="warn"
          ></Badge>
          <Badge class="align-self-center mr-3" value="Stable Beta" severity="secondary"></Badge>
          <Button
            class="Icon-button"
            icon="pi pi-user"
            severity="info"
            rounded
            outlined
            aria-label="User"
            @click="store.state.authComponent?.auth()"
            v-if="!store.state.authState.isAuthenticated"
          >
            <span class="pi pi-user"></span>
          </Button>
          <Button
            icon="pi pi-sign-out"
            severity="info"
            rounded
            outlined
            aria-label="User"
            @click="logout"
            v-if="store.state.authState.isAuthenticated"
          >
            <span class="pi pi-sign-out"></span>
          </Button>
        </div>
      </template>
    </Menubar>
  </header>
</template>
