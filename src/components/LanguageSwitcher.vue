<template>
  <Dropdown
    v-model="selectedLocale"
    :options="localeOptions"
    optionLabel="name"
    optionValue="value"
    placeholder="Language"
    @change="changeLocale"
    class="language-switcher"
  >
    <template #value="slotProps">
      <div class="flex align-items-center" v-if="slotProps.value">
        <span>{{ getLocaleName(slotProps.value) }}</span>
      </div>
    </template>
    <template #option="slotProps">
      <div class="flex align-items-center">
        <span>{{ slotProps.option.name }}</span>
      </div>
    </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dropdown from 'primevue/dropdown'
import { getCurrentLocale, setLocale, LOCALE_NAMES, SUPPORTED_LOCALES } from '@/i18n'

const selectedLocale = ref('')

const localeOptions = SUPPORTED_LOCALES.map(locale => ({
  value: locale,
  name: LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES]
}))

function getLocaleName(locale: string): string {
  return LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES] || locale
}

function changeLocale() {
  setLocale(selectedLocale.value)
}

onMounted(() => {
  selectedLocale.value = getCurrentLocale()
})
</script>

<style scoped>
.language-switcher {
  min-width: 120px;
}
</style>