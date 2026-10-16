<script setup lang="ts">
import Panel from '@/components/ui/UiPanel.vue'
import InputText from '@/components/ui/UiInputText.vue'
import Button from '@/components/ui/UiButton.vue'
import Checkbox from '@/components/ui/UiCheckbox.vue'
import { onMounted, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import Divider from '@/components/ui/UiDivider.vue'
import { useToast } from '@/components/ui/useToast'
import ProgressSpinner from '@/components/ui/UiSpinner.vue'

import { bffSendVerificationEmail, bffSendVerifyEmailCode } from '@/scripts/axios/BFF'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  <div class="section">
    <div class="container ev">
      <Panel header="Email validation">
        <div class="ev__body">
          <p v-if="!store.state.account?.email">
            In order to serve you best services under
            <a
              href="https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52020PC0593&from=EN"
              target="_blank"
              rel="noopener"
              >MiCA legal framework</a
            >, we need you to accept our terms and conditions and GDRP policy.
          </p>
          <p v-if="store.state.account?.email">
            Your verified email is <strong>{{ store.state.account.email }}</strong
            >.
            <span v-if="store.state.account?.marketingConsent">
              You have opted in to receive special offers and other marketing communication. You can
              opt out by filling the form below and uncheck special offers checkbox.</span
            ><span v-else>
              You have not opted in to receive special offers and other marketing communication. You
              can opt in by filling the form below and uncheck special offers checkbox.</span
            >
          </p>

          <div v-if="!route.params.code" class="ev__step">
            <div class="field">
              <label for="email">Email</label>
              <InputText
                id="email"
                v-model="status.email"
                type="email"
                placeholder="Input your email please"
              />
            </div>
            <p class="ev__legal">
              By verifying your email you accept the
              <a :href="`/terms/${status.terms}`" target="_blank" rel="noopener">terms and conditions</a>.
              {{ t('emailVerification.byVerifying') }}
              <a :href="`/gdpr/${status.gdpr}`" target="_blank" rel="noopener">{{ t('footer.gdprPolicy') }}</a>
              {{ t('emailVerification.ofOurService') }}
            </p>
            <div class="ev__check">
              <Checkbox inputId="hasMarketing" v-model="status.hasMarketing" :binary="true" />
              <label for="hasMarketing">
                I want to opt in/opt out to receive special offers and other marketing communication
              </label>
            </div>
            <div class="ev__actions">
              <Button @click="verify" :disabled="status.sendingEmail || status.emailSent">
                <ProgressSpinner
                  v-if="status.sendingEmail"
                  style="width: 1em; height: 1em"
                  strokeWidth="8"
                  animationDuration=".5s"
                  class="mx-1"
                />Verify
              </Button>
              <span v-if="status.emailSent" class="ev__note">Please check your mailbox</span>
            </div>
            <Divider />
          </div>

          <div class="ev__step">
            <div class="field">
              <label for="code">Verification code</label>
              <InputText
                id="code"
                v-model="status.code"
                type="code"
                placeholder="Your code from your email"
              />
            </div>
            <div class="ev__actions">
              <Button @click="finishVerify" :disabled="!status.code || status.sendingVerification">
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
            <p v-if="status.bffSendVerifyEmailCodeResult.success" class="ev__note ev__note--ok">
              Thank you for validating your email address
            </p>
            <p v-if="status.bffSendVerifyEmailCodeResult.transactionId" class="ev__note">
              We have funded you few algorand tokens so that you can opt in to gold asa.
              <a
                :href="`https://testnet.algoexplorer.io/tx/${status.bffSendVerifyEmailCodeResult.transactionId}`"
                target="_blank"
                rel="noopener"
                >Check the transaction</a
              >
            </p>
          </div>
        </div>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
.ev {
  max-width: 720px;
}
.ev__body,
.ev__step {
  display: grid;
  gap: 1.1rem;
}
.ev__body p {
  margin: 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
}
.ev__legal {
  font-size: 0.9rem;
  color: var(--muted);
}
.ev__check {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  font-size: 0.93rem;
}
.ev__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.ev__note {
  color: var(--ink-soft);
  font-size: 0.93rem;
}
.ev__note--ok {
  color: var(--success);
  font-weight: 600;
}
</style>
