<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import Divider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const store = useAppStore()
const status = reactive({
  email: ''
})
if (store.state.authState?.arc76email) {
  status.email = store.state.authState?.arc76email
}

watch(store.state.authState, async () => {
  if (store.state.authState?.arc76email) {
    status.email = store.state.authState?.arc76email
  }
})

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function verify() {
  if (!store.state.authState.isAuthenticated) {
    toast.add({
      severity: 'info',
      detail: 'Please authenticate first',
      life: 5000
    })
    await delay(1000)
    store.state.authComponent?.auth(status.email)
    return
  }
}
</script>

<template>
  <Layout>
    <MenuLevel2Settings />
    <Panel
      header="Email validation"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <div class="field grid">
        <label for="email" class="col-12 mb-2 md:col-2 md:mb-0">Email</label>
        <InputText
          id="email"
          v-model="status.email"
          type="email"
          placeholder="Input your email please"
          class="m-1"
        />
      </div>
      <div class="field grid">
        <div class="col-12 md:col-10 md:col-offset-2">
          <Button class="m-0" @click="verify">Verify</Button>
        </div>
      </div>
      <Divider />
    </Panel>
  </Layout>
</template>
