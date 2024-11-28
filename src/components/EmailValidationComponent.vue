<script setup lang="ts">
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { onMounted, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import Divider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'
import ProgressSpinner from 'primevue/progressspinner'

import { bffSendVerificationEmail, bffSendVerifyEmailCode } from '@/scripts/axios/BFF'
import { useRoute } from 'vue-router'
const toast = useToast()
const store = useAppStore()
const status = reactive({
  email: '',
  terms: '2023-11-12',
  gdpr: '2023-12-26',
  hasMarketing: false,
  sendingEmail: false,
  emailSent: false,
  sendingVerification: false,
  code: '',
  bffSendVerifyEmailCodeResult: { success: false, transactionId: null }
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
async function authRequired() {
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
  if (!store.state.authState?.arc14Header) return
}
async function verify() {
  await authRequired()
  if (!store.state.authState?.arc14Header) return
  status.sendingEmail = true
  try {
    const email = await bffSendVerificationEmail(
      store.state.authState?.arc14Header,
      status.email,
      status.terms,
      status.gdpr,
      status.hasMarketing
    )
    status.emailSent = true
    console.log('email', email)
  } catch (err: any) {
    console.error('err.bffSendVerificationEmail', err)
    if (err?.response?.data?.title) {
      toast.add({
        severity: 'error',
        detail: err.response.data.title,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        detail: 'Error occured:' + err.message,
        life: 5000
      })
    }
  }
  status.sendingEmail = false
}

async function finishVerify() {
  await authRequired()
  if (!store.state.authState?.arc14Header) return
  status.sendingVerification = true
  try {
    const bffSendVerifyEmailCodeResult = await bffSendVerifyEmailCode(
      store.state.authState?.arc14Header,
      status.code
    )
    status.bffSendVerifyEmailCodeResult = bffSendVerifyEmailCodeResult
    console.log('bffSendVerifyEmailCodeResult', bffSendVerifyEmailCodeResult)
  } catch (err: any) {
    console.error('err.bffSendVerificationEmail', err)
    if (err?.response?.data?.title) {
      toast.add({
        severity: 'error',
        detail: err.response.data.title,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        detail: 'Error occured:' + err.message,
        life: 5000
      })
    }
  }
  status.sendingVerification = false
  store.state.reloadAccount()
}
const route = useRoute()
onMounted(async () => {
  console.log('route.params', route.params)
  if (route.params.code) {
    const codeString = route.params.code as string
    status.code = codeString
  }
})
</script>

<template>
  <Panel
    header="Email validation"
    class="m-4 flex flex-grow-1 flex-column"
    toggleableContent="text"
  >
    <p v-if="!store.state.account?.email">
      In order to serve you best services under
      <a
        href="https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52020PC0593&from=EN"
        target="_blank"
        >MiCA legal framework</a
      >, we need you to accept our terms and conditions and GDRP policy.
    </p>
    <p v-if="store.state.account?.email">
      Your verified email is {{ store.state.account.email }}.
      <span v-if="store.state.account?.marketingConsent">
        You have opted in to receive special offers and other marketing communication. You can opt
        out by filling the form below and uncheck special offers checkbox.</span
      ><span v-else>
        You have not opted in to receive special offers and other marketing communication. You can
        opt in by filling the form below and uncheck special offers checkbox.</span
      >
    </p>
    <div v-if="!route.params.code">
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
          By verifying your email you accept the
          <a :href="`/terms/${status.terms}`" target="_blank"> terms and conditions</a>.
        </div>

        <div class="col-12 md:col-10 md:col-offset-2">
          By verifying your email you accept the
          <a :href="`/gdpr/${status.gdpr}`" target="_blank"> GDPR policy</a> of our service.
        </div>
      </div>
      <div class="field grid">
        <div class="col-12 md:col-10 md:col-offset-2">
          <Checkbox inputId="hasMarketing" v-model="status.hasMarketing" :binary="true" />
          <label for="hasMarketing" class="ml-2">
            I want to opt in/opt out to receive special offers and other marketing communication
          </label>
        </div>
      </div>
      <div class="field grid">
        <div class="col-12 md:col-10 md:col-offset-2">
          <Button class="my-2" @click="verify" :disabled="status.sendingEmail || status.emailSent"
            ><ProgressSpinner
              v-if="status.sendingEmail"
              style="width: 1em; height: 1em"
              strokeWidth="8"
              animationDuration=".5s"
              class="mx-1"
            />Verify
          </Button>
        </div>
        <div v-if="status.emailSent" class="col-12 md:col-10 md:col-offset-2">
          Please check your mailbox
        </div>
      </div>
      <Divider />
    </div>
    <div class="field grid">
      <label for="code" class="col-12 mb-2 md:col-2 md:mb-0">Verification code</label>
      <InputText
        id="code"
        v-model="status.code"
        type="code"
        placeholder="Your code from your email"
        class="m-1"
      />
    </div>
    <div class="field grid">
      <div class="col-12 md:col-10 md:col-offset-2">
        <Button
          class="my-2"
          @click="finishVerify"
          :disabled="!status.code || status.sendingVerification"
        >
          <ProgressSpinner
            v-if="status.sendingVerification"
            style="width: 1em; height: 1em"
            strokeWidth="8"
            animationDuration=".5s"
            class="mx-1"
          />
          Finish verification
        </Button>
      </div>
      <div
        v-if="status.bffSendVerifyEmailCodeResult.success"
        class="col-12 md:col-10 md:col-offset-2"
      >
        Thank you for validating your email address
      </div>
      <div
        v-if="status.bffSendVerifyEmailCodeResult.transactionId"
        class="col-12 md:col-10 md:col-offset-2"
      >
        We have funded you few algorand tokens so that you can opt in to gold asa.
        <a
          :href="`https://testnet.algoexplorer.io/tx/${status.bffSendVerifyEmailCodeResult.transactionId}`"
          target="_blank"
          >Check the transaction</a
        >
      </div>
    </div>
  </Panel>
</template>
