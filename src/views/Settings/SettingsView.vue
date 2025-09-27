<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import { useAppStore, resetConfiguration, useMainnet, useTestnet, useSandnet } from '@/stores/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()
</script>

<template>
  <Layout :hideTopMenu="true">
    <MenuLevel2Settings />
    <Panel :header="t('settings.title')" class="m-4 flex flex-grow-1 flex-column" toggleableContent="text">
      <p class="m-0"></p>
      <div class="card">
        <!--
        <h4>Theme setup</h4>
        <div class="field grid">
          <label for="lastname4" class="col-12 mb-2 md:col-2 md:mb-0">Theme</label>
          <div class="col-12 md:col-10">
            <Button class="my-2" @click="store.state.theme = 'md-light-indigo'"
              >MD Light Indigo</Button
            >
            <Button class="m-2" @click="store.state.theme = 'md-dark-indigo'"
              >MD Dark Indigo</Button
            >
            <Button class="m-2" @click="store.state.theme = 'lara-light-indigo'"
              >Lara Light Indigo</Button
            >
            <Button class="m-2" @click="store.state.theme = 'lara-dark-indigo'"
              >Lara Dark Indigo</Button
            >
          </div>
        </div>
        -->
        <h4>Blockchain configuration</h4>
        <!--
        <div class="field grid">
          <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0">Network defaults</label>
          <div class="col-12 md:col-10">
            <Button @click="useMainnet" class="my-2 mr-2">Algorand Mainnet</Button>
            <Button @click="useTestnet" class="m-2">Algorand Testnet</Button>
            <Button @click="useSandnet" class="m-2">Algorand Sandbox</Button>
          </div>
        </div>-->
        <div class="field grid">
          <label for="algodHost" class="col-12 mb-2 md:col-2 md:mb-0">Blockchain endpoint</label>
          <div class="col-12 md:col-10">
            <input
              v-model="store.state.algodHost"
              id="algodHost"
              type="text"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="algodPort" class="col-12 mb-2 md:col-2 md:mb-0"
            >Blockchain endpoint port</label
          >
          <div class="col-12 md:col-10">
            <input
              v-model="store.state.algodPort"
              id="algodPort"
              type="text"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="algodToken" class="col-12 mb-2 md:col-2 md:mb-0"
            >Blockchain endpoint token</label
          >
          <div class="col-12 md:col-10">
            <input
              v-model="store.state.algodToken"
              id="algodToken"
              type="text"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
        </div>
        <div class="field grid">
          <label for="customToken" class="col-12 mb-2 md:col-2 md:mb-0">Custom swap token</label>
          <div class="col-12 md:col-10">
            <input
              v-model="store.state.customToken"
              id="customToken"
              type="text"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
        </div>

        <h4>Default configuration</h4>
        <div class="field grid">
          <label class="col-12 mb-2 md:col-2 md:mb-0">{{ t('settings.dangerZone') }}</label>
          <div class="col-12 md:col-10">
            <Button @click="resetConfiguration" class="my-2">{{ t('settings.resetConfiguration') }}</Button>
          </div>
        </div>
      </div>
    </Panel>
  </Layout>
</template>
