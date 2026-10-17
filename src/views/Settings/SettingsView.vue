<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from '@/components/ui/UiPanel.vue'
import Button from '@/components/ui/UiButton.vue'
import InputText from '@/components/ui/UiInputText.vue'
import SelectButton from '@/components/ui/UiSelectButton.vue'
import { defaultRouterHost, effectiveRouterKind, safeRouterHost } from '@/scripts/router'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import { useAppStore, resetConfiguration, useMainnet, useTestnet, useSandnet } from '@/stores/app'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()

/** a typed endpoint that is not used (not https) */
const routerHostInvalid = computed(() => {
  const host = store.state.routerHost?.trim()
  if (!host) return false
  const used = safeRouterHost(host, store.state.env)
  return used !== host.replace(/\/+$/, '') && used === defaultRouterHost(store.state.env)
})

const routerOptions = [
  { name: 'Biatec Router (default)', value: 'biatec' },
  { name: 'Folks Router', value: 'folks' }
]
</script>

<template>
  <Layout :hideTopMenu="true">
    <MenuLevel2Settings />
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('settings.title') }}</h1>
      </div>
    </header>
    <div class="section">
      <div class="container settings">
        <Panel header="Blockchain configuration">
          <div class="form-grid">
            <div class="field">
              <label for="algodHost">Blockchain endpoint</label>
              <InputText id="algodHost" type="text" v-model="store.state.algodHost" />
            </div>
            <div class="field">
              <label for="algodPort">Blockchain endpoint port</label>
              <input id="algodPort" type="text" class="ui-input" v-model="store.state.algodPort" />
            </div>
            <div class="field">
              <label for="algodToken">Blockchain endpoint token</label>
              <InputText id="algodToken" type="text" v-model="store.state.algodToken" />
            </div>
            <div class="field">
              <label for="customToken">Custom swap token</label>
              <input
                id="customToken"
                type="text"
                class="ui-input"
                v-model="store.state.customToken"
              />
            </div>
          </div>
        </Panel>
        <Panel :header="t('settings.tradingPanel')">
          <div class="form-grid">
            <div class="field">
              <span id="routerLabel" class="field__label">{{ t('trading.swapRouter') }}</span>
              <SelectButton
                v-model="store.state.router"
                :options="routerOptions"
                optionLabel="name"
                optionValue="value"
                aria-labelledby="routerLabel"
              />
              <p class="hint">{{ t('settings.routerHint') }}</p>
              <p
                v-if="
                  store.state.router === 'biatec' &&
                  effectiveRouterKind('biatec', store.state.env) !== 'biatec'
                "
                class="hint"
              >
                {{ t('settings.routerFallbackHint', { env: store.state.env }) }}
              </p>
            </div>
            <div v-if="store.state.router === 'biatec'" class="field">
              <label for="routerHost">{{ t('settings.routerEndpoint') }}</label>
              <InputText
                id="routerHost"
                type="text"
                v-model="store.state.routerHost"
                :placeholder="defaultRouterHost(store.state.env)"
              />
              <p v-if="routerHostInvalid" class="hint">
                {{ t('settings.routerEndpointInvalid') }}
              </p>
            </div>
          </div>
        </Panel>
        <Panel header="Default configuration">
          <div class="danger">
            <strong>{{ t('settings.dangerZone') }}</strong>
            <Button severity="danger" outlined @click="resetConfiguration">{{
              t('settings.resetConfiguration')
            }}</Button>
          </div>
        </Panel>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.settings {
  display: grid;
  gap: 1.5rem;
  max-width: 880px;
}
.form-grid {
  display: grid;
  gap: 1.1rem 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}
.field label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
}
.field__label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
}
.hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}
.danger {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}
@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
