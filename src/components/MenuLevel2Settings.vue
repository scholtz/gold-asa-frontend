<script setup lang="ts">
import { ref } from 'vue'

import Menubar from 'primevue/menubar'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

const tabMenuItems = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  {
    label: 'Settings',
    icon: 'pi pi-fw pi-cog',
    route: '/settings'
  },
  {
    label: 'Email verification',
    icon: 'pi pi-fw pi-envelope',
    route: '/email-validation'
  },
  {
    label: 'User profile',
    icon: 'pi pi-fw pi-user',
    route: '/user-profile'
  }
])
const active = ref(-1)

active.value = tabMenuItems.value.findIndex((e) => e.route == router.currentRoute.value.path)

const dynamicClass = ref(false)
</script>

<template>
  <header :class="[dynamicClass === true ? 'rn-header stick' : '']">
    <Menubar v-model:activeIndex="active" :model="tabMenuItems">
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
    </Menubar>
  </header>
</template>
