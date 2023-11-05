<script setup lang="ts">
import { bffAccount } from '@/scripts/axios/BFF'
import { useAppStore } from '@/stores/app'
import { onMounted, reactive, watch } from 'vue'
import EmailValidationComponent from '@/components/EmailValidationComponent.vue'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
const store = useAppStore()

async function getAccount() {
  if (store.state.authState?.arc14Header) {
    const account = await bffAccount(store.state.authState?.arc14Header)
    store.state.account = account
    console.log('loaded account', account)
    status.loadingState = false
  }
}
const status = reactive({
  loadingState: false
})

watch(store.state.authState, async () => {
  if (store.state.authState?.arc14Header) {
    if (!store.state.account) {
      status.loadingState = true
      await getAccount()
    }
  } else {
    store.state.account = null
  }
})
async function reloadAccount(): Promise<void> {
  console.log('reload account component')
  await getAccount()
}
onMounted(async () => {
  store.state.reloadAccount = reloadAccount
  if (!store.state.account?.termsAndConditions) {
    status.loadingState = true
    await getAccount()
  }
})
</script>

<template>
  <div class="flex-grow-1">
    <div v-if="store.state.authState?.account">
      <div v-if="status.loadingState">
        <Message
          >We are loading your account information
          <ProgressSpinner
            style="width: 1em; height: 1em"
            strokeWidth="8"
            animationDuration=".5s"
            class="mx-1"
          />
        </Message>
      </div>
      <div v-else-if="!store.state.account?.email">
        <EmailValidationComponent />
      </div>
      <slot v-else></slot>
    </div>
    <slot v-else></slot>
  </div>
</template>
