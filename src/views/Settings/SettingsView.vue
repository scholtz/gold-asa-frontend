<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from '@/components/ui/UiPanel.vue'
import Button from '@/components/ui/UiButton.vue'
import InputText from '@/components/ui/UiInputText.vue'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import { useAppStore, resetConfiguration, useMainnet, useTestnet, useSandnet } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()
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
              <input id="customToken" type="text" class="ui-input" v-model="store.state.customToken" />
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
