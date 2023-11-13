<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useAppStore } from '@/stores/app'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const store = useAppStore()
import { computed, reactive, watch } from 'vue'
import delay from '@/scripts/common/delay'

const state = reactive({
  amount: 10,
  currencies: ['EUR', 'CZK'],
  currency: 'EUR'
})

const min = computed(() => {
  return state.currency == 'EUR' ? 10 : 200
})

async function getRFQ() {
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
}
</script>
<template>
  <Layout :hideTopMenu="false">
    <Panel
      header="Buy gold with bank transfer"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field grid">
            <label for="currency" class="col-12 mb-2 md:col-4 md:mb-0">Currency</label>
            <div class="col-12 md:col-8">
              <Dropdown
                id="currency"
                type="text"
                class="w-full"
                v-model="state.currency"
                :options="state.currencies"
              />
            </div>
          </div>
          <div class="field grid">
            <label for="amount" class="col-12 mb-2 md:col-4 md:mb-0">Amount</label>
            <div class="col-12 md:col-8">
              <InputNumber
                id="amount"
                v-model="state.amount"
                :min="min"
                :step="0.01"
                :suffix="` ${state.currency}`"
                class="w-full"
              ></InputNumber>
            </div>
          </div>
          <div class="field grid">
            <label for="firstname" class="col-12 mb-2 md:col-4 md:mb-0"></label>
            <div class="col-12 md:col-8">
              <Button @click="getRFQ">Get RFQ</Button>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <p>
            First create Request for quote (RFQ) by specifying how much fiat you want to use and the
            currency. If you agree with the quote, confirm the request and execute bank transfer.
            Make sure you provide in the reference your RFQ id and your client id. With SEPA instant
            payments the process should take only few minutes to process, however if banks will
            process it using SEPA standard method it may take up to 2 business days to commit. We
            guarantee you the RFQ price 30 minutes from the request. Any time later the amount might
            differ according to current market conditions at the time of receiving your money.
          </p>
          <p>For recurring payments make sure you reference your client id.</p>
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
    </Panel>
  </Layout>
</template>
