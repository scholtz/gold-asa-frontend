<script setup lang="ts">
import { ref } from 'vue'

import TabMenu from 'primevue/tabmenu'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

const tabMenuItems = ref([
  {
    label: 'Blockchain trading',
    icon: 'pi pi-fw pi-home',
    route: '/trade-gold'
  },
  {
    label: 'Fiat payment',
    icon: 'pi pi-fw pi-home',
    route: '/buy-gold-with-eur'
  },
  {
    label: 'Transactions',
    icon: 'pi pi-fw pi-home',
    route: '/my-gold-transactions'
  }
])
const active = ref(-1)

active.value = tabMenuItems.value.findIndex((e) => e.route == router.currentRoute.value.path)
</script>

<template>
  <TabMenu v-model:activeIndex="active" :model="tabMenuItems">
    <template #item="{ label, item, props }">
      <RouterLink v-if="item.route" v-slot="routerProps" :to="item.route" custom>
        <a
          :href="routerProps.href"
          v-bind="props.action"
          @click="($event) => routerProps.navigate($event)"
        >
          <span v-bind="props.icon" />
          <span v-bind="props.label">{{ label }}</span>
        </a>
      </RouterLink>
    </template>
  </TabMenu>
</template>
