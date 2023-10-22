<script setup lang="ts">
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import { useAppStore, resetConfiguration, useMainnet, useTestnet } from '@/stores/app'

const store = useAppStore()
console.log('store', store)
</script>
<template>
  <Panel
    header="Settings"
    class="m-4 flex flex-grow-1 flex-column"
    title="title"
    toggleableContent="text"
  >
    <p class="m-0"></p>
    <div class="card">
      <h4>Theme setup</h4>
      <div class="field grid">
        <label for="lastname4" class="col-12 mb-2 md:col-2 md:mb-0">Theme</label>
        <div class="col-12 md:col-10">
          <Button class="my-2" @click="store.state.theme = 'md-light-indigo'"
            >MD Light Indigo</Button
          >
          <Button class="m-2" @click="store.state.theme = 'md-dark-indigo'">MD Dark Indigo</Button>
          <Button class="m-2" @click="store.state.theme = 'lara-light-indigo'"
            >Lara Light Indigo</Button
          >
          <Button class="m-2" @click="store.state.theme = 'lara-dark-indigo'"
            >Lara Dark Indigo</Button
          >
        </div>
      </div>
      <h4>Blockchain configuration</h4>
      <div class="field grid">
        <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0">Network defaults</label>
        <div class="col-12 md:col-10">
          <Button @click="useMainnet" class="my-2 mr-2">Algorand Mainnet</Button>
          <Button @click="useTestnet" class="m-2">Algorand Testnet</Button>
        </div>
      </div>
      <div class="field grid">
        <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0">Blockchain endpoint</label>
        <div class="col-12 md:col-10">
          <input
            v-model="store.state.algodHost"
            id="algodnode"
            type="text"
            class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
          />
        </div>
      </div>
      <div class="field grid">
        <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0">Blockchain endpoint port</label>
        <div class="col-12 md:col-10">
          <input
            v-model="store.state.algodPort"
            id="algodnode"
            type="text"
            class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
          />
        </div>
      </div>
      <div class="field grid">
        <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0"
          >Blockchain endpoint token</label
        >
        <div class="col-12 md:col-10">
          <input
            v-model="store.state.algodToken"
            id="algodnode"
            type="text"
            class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
          />
        </div>
      </div>
      <div class="field grid">
        <label for="algodnode" class="col-12 mb-2 md:col-2 md:mb-0">Custom swap token</label>
        <div class="col-12 md:col-10">
          <input
            v-model="store.state.customToken"
            id="algodnode"
            type="text"
            class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
          />
        </div>
      </div>

      <h4>Default configuration</h4>
      <div class="field grid">
        <label class="col-12 mb-2 md:col-2 md:mb-0">Danger zone</label>
        <div class="col-12 md:col-10">
          <Button @click="resetConfiguration" class="my-2">Reset configuration</Button>
        </div>
      </div>
    </div>
  </Panel>
</template>
