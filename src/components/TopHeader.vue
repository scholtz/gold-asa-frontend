<script setup lang="ts">
import { RouterLink } from 'vue-router'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { ref } from 'vue'

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  {
    label: 'Trade gold token',
    icon: 'pi pi-fw pi-money-bill',
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
  },
  {
    label: 'About ASA.Gold',
    icon: 'pi pi-fw pi-users',
    route: '/about-asa-gold'
  },
  {
    label: 'Contact us',
    icon: 'pi pi-fw pi-send',
    route: '/contact-us'
  }
])
</script>

<template>
  <header>
    <div class="flex flex-row">
      <span class="logo m-4">ASA - Real gold</span>
      <div class="flex-grow-1"></div>
      <Badge value="IN DEVELOPMENT" severity="danger" class="align-self-center m-4"></Badge>
      <Button
        severity="link"
        class="flex flex-column align-content-center align-items-center align-self-center my-4 p-2 w-4rem"
        @click="$router.push('/settings')"
      >
        <span class="pi pi-cog"></span>
        <div class="m-1">Settings</div>
      </Button>
      <Button
        severity="link"
        class="flex flex-column align-content-center align-items-center align-self-center m-4 p-2 w-4rem"
        @click="$router.push('/auth')"
      >
        <span class="pi pi-user"></span>
        <div class="m-1">Login</div>
      </Button>
    </div>
    <Menubar :model="items">
      <template #item="{ label, item, props }">
        <RouterLink v-if="item.route" v-slot="routerProps" :to="item.route">
          <a :href="routerProps.href" v-bind="props.action">
            <span v-bind="props.icon" />
            <span v-bind="props.label">{{ label }}</span>
          </a>
        </RouterLink>
      </template>
      <template #end>
        <InputText placeholder="Search" type="text" />
      </template>
    </Menubar>
  </header>
</template>
