<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import InputNumber from '@/components/ui/UiInputNumber.vue'
import Button from '@/components/ui/UiButton.vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/components/ui/useToast'
import SelectButton from '@/components/ui/UiSelectButton.vue'
import ProgressSpinner from '@/components/ui/UiSpinner.vue'
const toast = useToast()
const store = useAppStore()
import { computed, reactive, ref } from 'vue'
import delay from '@/scripts/common/delay'
import { bffConfirmRFQ, bffRFQ } from '@/scripts/axios/BFF'

interface IRFQ {
  rfqId: string
  quote: number
  iban: string
  bic: string
  clientId: string
}

const state = reactive({
  amount: 10,
  currencies: ['EUR', 'CZK'],
  currency: 'EUR',
  waitingPayment: false,
  waitingPayment2: false
})
const previewselected = ref('EUR')

function isSelected(data: string | null) {
  if (data === null) {
    state.currency = previewselected.value
  } else {
    previewselected.value = data
    state.currency = data
  }
}
const rfq = ref<IRFQ>()

const min = computed(() => {
  return state.currency == 'EUR' ? 10 : 200
})

async function getRFQ() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: 'info',
        detail: 'Please authenticate first',
        life: 5000
      })
      await delay(1000)
      store.state.authComponent?.auth()
      return
    }
    const val = await bffRFQ(state.amount, state.currency, store.state.authState.arc14Header)
    if (!val || val.quote == 0) {
      toast.add({
        severity: 'error',
        detail: 'No quote available at the moment, please try again later',
        life: 5000
      })
    } else {
      rfq.value = val
    }
  } catch (err: any) {
    console.error('err.storeProfile', err)
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
}

async function confirmRFQ() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: 'info',
        detail: 'Please authenticate first',
        life: 5000
      })
      await delay(1000)
      store.state.authComponent?.auth()
      return
    }
    if (!rfq.value) return
    await bffConfirmRFQ(rfq.value.rfqId, store.state.authState.arc14Header)
    state.waitingPayment = true
  } catch (err: any) {
    console.error('err.storeProfile', err)
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
}
async function transferIncomming() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: 'info',
        detail: 'Please authenticate first',
        life: 5000
      })
      await delay(1000)
      store.state.authComponent?.auth()
      return
    }
    if (!rfq.value) return

    state.waitingPayment2 = true
  } catch (err: any) {
    console.error('err.storeProfile', err)
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
}
</script>
<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>Buy gold with bank transfer</h1>
        <p>Request a quote in EUR or CZK and settle by SEPA transfer.</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="rfq-card" aria-live="polite">
          <template v-if="!rfq">
            <p class="eyebrow">Payment</p>
            <h2 class="rfq-card__title">Request a quote</h2>
            <div class="rfq-card__field">
              <span id="currency-label" class="rfq-card__label">Currency</span>
              <SelectButton
                v-model="state.currency"
                :options="state.currencies"
                @click="isSelected(state.currency)"
                aria-labelledby="currency-label"
              />
            </div>
            <div class="rfq-card__field">
              <label for="amount" class="rfq-card__label">Amount</label>
              <InputNumber
                id="amount"
                v-model="state.amount"
                :min="min"
                :step="0.01"
                :suffix="` ${state.currency}`"
                class="w-full"
              ></InputNumber>
              <small class="rfq-card__hint">Minimum {{ min }} {{ state.currency }}</small>
            </div>
            <Button class="rfq-card__cta" size="large" @click="getRFQ">Get RFQ</Button>
          </template>

          <template v-else-if="state.waitingPayment">
            <p class="eyebrow">Step 2</p>
            <h2 class="rfq-card__title">Make the bank transfer</h2>
            <dl class="rfq-card__details">
              <div>
                <dt>Account (IBAN / BIC)</dt>
                <dd>{{ rfq.iban }}/{{ rfq.bic }}</dd>
              </div>
              <div>
                <dt>Reference (RFQ id / client id)</dt>
                <dd>{{ rfq.rfqId }}/{{ rfq.clientId }}</dd>
              </div>
            </dl>
            <Button v-if="state.waitingPayment2" class="rfq-card__cta" @click="transferIncomming"
              >I have made a transfer</Button
            >
            <div v-else class="rfq-card__waiting">
              <ProgressSpinner
                style="width: 1.25em; height: 1.25em"
                strokeWidth="8"
                animationDuration=".5s"
              />
            </div>
          </template>

          <template v-else>
            <p class="eyebrow">Step 1</p>
            <h2 class="rfq-card__title">Your quote</h2>
            <p class="rfq-card__quote">{{ rfq.quote }}</p>
            <Button class="rfq-card__cta" @click="confirmRFQ"
              >I Confirm I want to buy Gold coin for specified quote</Button
            >
          </template>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="prose">
          <h2>Learn how to buy ASA real gold</h2>
          <p>
            First create Request for quote (RFQ) by specifying how much fiat you want to use and the
            currency. If you agree with the quote, confirm the request and execute bank transfer.
            Make sure you provide in the reference your RFQ id and your client id. With SEPA instant
            payments the process should take only few minutes to process, however if banks will
            process it using SEPA standard method it may take up to 2 business days to commit. We
            guarantee you the RFQ price 30 minutes from the request. Any time later the amount might
            differ according to current market conditions at the time of receiving your money.
          </p>
          <p>For <b>recurring payments</b> make sure you reference your client id.</p>
          <p>
            Minimum RFQ amount is 10 EUR or 200 CZK, maximum depends on current availability of
            unused gold tokens.
          </p>
          <p>
            RFQ process requires authenticated user, with validated email and profile. It is
            criminal offense according to 297/2008 Z. z. not to provide full and correct information
            when trading on this platform.
          </p>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.rfq-card {
  max-width: 30rem;
  margin: 0 auto;
  padding: 2rem 1.75rem;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-top: 3px solid var(--gold-500);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.rfq-card__title {
  margin: 0 0 1.5rem;
  font-size: 1.6rem;
}
.rfq-card__field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.rfq-card__field :deep(.ui-number) {
  width: 100%;
}
.rfq-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.rfq-card__hint {
  color: var(--muted);
}
.rfq-card__cta {
  width: 100%;
  margin-top: 0.5rem;
}
.rfq-card__quote {
  margin: 0 0 1.25rem;
  font-family: var(--font-display);
  font-size: 2.25rem;
  color: var(--gold-700);
}
.rfq-card__details {
  margin: 0 0 1.5rem;
  text-align: left;
}
.rfq-card__details div {
  padding: 0.85rem 1rem;
  margin-bottom: 0.6rem;
  background: var(--surface-alt);
  border-radius: var(--radius);
}
.rfq-card__details dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.rfq-card__details dd {
  margin: 0.2rem 0 0;
  font-weight: 600;
  word-break: break-all;
}
.rfq-card__waiting {
  display: flex;
  justify-content: center;
  color: var(--gold-600);
}
</style>
