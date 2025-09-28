<script setup lang="ts">
import { ref, computed } from 'vue'

import Menubar from 'primevue/menubar'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const tabMenuItems = computed(() => [
  {
    label: t('navigation.home'),
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  {
    label: t('settings.title'),
    icon: 'pi pi-fw pi-cog',
    route: '/settings'
  },
  {
    label: t('settings.emailVerification'),
    icon: 'pi pi-fw pi-envelope',
    route: '/email-validation'
  },
  {
    label: t('profile.title'),
    icon: 'pi pi-fw pi-user',
    route: '/user-profile'
  }
])
const active = ref(-1)

active.value = tabMenuItems.value.findIndex((e) => e.route == router.currentRoute.value.path)
</script>

<template>
  <header>
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
