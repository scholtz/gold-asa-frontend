<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiIcon from '@/components/ui/UiIcon.vue'

const route = useRoute()
const { t } = useI18n()

const tabs = computed(() => [
  { label: t('navigation.home'), icon: 'home', route: '/' },
  { label: t('settings.title'), icon: 'cog', route: '/settings' },
  { label: t('settings.emailVerification'), icon: 'mail', route: '/email-validation' },
  { label: t('profile.title'), icon: 'user', route: '/user-profile' }
])
</script>

<template>
  <div class="subnav">
    <nav class="container subnav__bar" aria-label="Settings">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.route"
        :to="tab.route"
        class="subnav__tab"
        :class="{ 'is-active': route.path === tab.route }"
      >
        <UiIcon :name="tab.icon" />
        <span>{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.subnav {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.subnav__bar {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
}
.subnav__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.95rem 1rem;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}
.subnav__tab:hover {
  color: var(--ink);
  text-decoration: none;
}
.subnav__tab.is-active {
  color: var(--gold-700);
  border-bottom-color: var(--gold-500);
}
</style>
