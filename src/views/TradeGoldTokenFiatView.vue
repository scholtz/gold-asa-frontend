<script setup lang="ts">
import Layout from "@/layouts/AuthLayout.vue";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { useAppStore } from "@/stores/app";
import { useToast } from "primevue/usetoast";
import Image from "primevue/image";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
const toast = useToast();
const store = useAppStore();
import { computed, reactive, ref, watch } from "vue";
import delay from "@/scripts/common/delay";
import { bffConfirmRFQ, bffRFQ } from "@/scripts/axios/BFF";

interface IRFQ {
  rfqId: string;
  quote: number;
  iban: string;
  bic: string;
  clientId: string;
}

const state = reactive({
  amount: 10,
  currencies: ["EUR", "CZK"],
  currency: "EUR",
  waitingPayment: false,
  waitingPayment2: false,
});
const previewselected = ref("EUR");

function isSelected(data) {
  if (data === null) {
    state.currency = previewselected.value;
  } else {
    previewselected.value = data;
    state.currency = data;
  }
}
const rfq = ref<IRFQ>();

const min = computed(() => {
  return state.currency == "EUR" ? 10 : 200;
});

async function getRFQ() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: "info",
        detail: "Please authenticate first",
        life: 5000,
      });
      await delay(1000);
      store.state.authComponent?.auth();
      return;
    }
    const val = await bffRFQ(
      state.amount,
      state.currency,
      store.state.authState.arc14Header
    );
    if (!val || val.quote == 0) {
      toast.add({
        severity: "error",
        detail: "No quote available at the moment, please try again later",
        life: 5000,
      });
    } else {
      rfq.value = val;
    }
  } catch (err: any) {
    console.error("err.storeProfile", err);
    if (err?.response?.data?.title) {
      toast.add({
        severity: "error",
        detail: err.response.data.title,
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        detail: "Error occured:" + err.message,
        life: 5000,
      });
    }
  }
}

async function confirmRFQ() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: "info",
        detail: "Please authenticate first",
        life: 5000,
      });
      await delay(1000);
      store.state.authComponent?.auth();
      return;
    }
    if (!rfq.value) return;
    await bffConfirmRFQ(rfq.value.rfqId, store.state.authState.arc14Header);
    state.waitingPayment = true;
  } catch (err: any) {
    console.error("err.storeProfile", err);
    if (err?.response?.data?.title) {
      toast.add({
        severity: "error",
        detail: err.response.data.title,
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        detail: "Error occured:" + err.message,
        life: 5000,
      });
    }
  }
}
async function transferIncomming() {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: "info",
        detail: "Please authenticate first",
        life: 5000,
      });
      await delay(1000);
      store.state.authComponent?.auth();
      return;
    }
    if (!rfq.value) return;

    state.waitingPayment2 = true;
  } catch (err: any) {
    console.error("err.storeProfile", err);
    if (err?.response?.data?.title) {
      toast.add({
        severity: "error",
        detail: err.response.data.title,
        life: 5000,
      });
    } else {
      toast.add({
        severity: "error",
        detail: "Error occured:" + err.message,
        life: 5000,
      });
    }
  }
}
</script>
<template>
  <Layout :hideTopMenu="false">
    <div class="buy-seller-with-eur w-full" style="margin-top: 110px; position: relative">
      <Image class="buy-sell w-full"   src="./bygoldimage.jpg" alt="Image" />
      <div
        v-if="!rfq"
        class="surface-card p-4 shadow-2 border-round w-full text-center lg:w-6 digital_gold_silver_calculator mt-4"
        style="position: absolute; top: 0; right: 100px"
      >
        <div class="text-center mt-1 mb-2">
          <span
            class="text-600 font-medium line-height-3"
            style="color: #d4aa00 !important ; font-size: 30px"
            >PAYMENT</span
          >
        </div>
        <div class="text-center">
          <span class="text-600 font-medium line-height-3"
            >Buy gold with bank transfer</span
          >
          <div class="text-900 text-3xl font-medium text-center mt-3 mb-3">
            <SelectButton
              v-model="state.currency"
              :options="state.currencies"
              @click="isSelected(state.currency)"
              aria-labelledby="basic"
            />
          </div>
        </div>
        <div class="your_topup_price">
          <div class="inputstyle">
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
        <Button
          @click="getRFQ"
          label="Info"
          class="mt-3 text-right"
          severity="info"
          rounded
          >Get RFQ</Button
        >
      </div>
      <div
        class="surface-card p-4 shadow-2 border-round w-full text-center lg:w-6 digital_gold_silver_calculator mt-3"
        style="position: absolute; top: 0; right: 10px"
        v-else-if="state.waitingPayment"
      >
        <p>Please do bank transfer to account {{ rfq.iban }}/{{ rfq.bic }}</p>
        <p>As reference use {{ rfq.rfqId }}/{{ rfq.clientId }}</p>
        <Button @click="transferIncomming" v-if="state.waitingPayment2"
          >I have made a transfer</Button
        >
        <ProgressSpinner
          v-else
          style="width: 1em; height: 1em"
          strokeWidth="8"
          animationDuration=".5s"
          class="mx-1"
        />
      </div>
      <div
        class="surface-card p-4 shadow-2 border-round w-full text-center lg:w-6 digital_gold_silver_calculator mt-3"
        style="position: absolute; top: 0; right: 100px"
        v-else
      >
        <p>Quote is {{ rfq.quote }}</p>
        <Button @click="confirmRFQ"
          >I Confirm I want to buy Gold coin for specified quote</Button
        >
      </div>
    </div>
    <div class="surface-section  surface-section-buy px-4 py-8 md:px-6 lg:px-8" style="margin-top:-10px">
      <div class="text-700 text-center">
        <div class="text-900 font-bold text-2xl mb-5 buy-title">LEARN HOW TO BUY ASA REAL GOLD</div>
        <div class="text-700 text-1xl mb-5 tab-panel">
          <p>
            First create Request for quote (RFQ) by specifying how much fiat you want to
            use and the currency. If you agree with the quote, confirm the request and
            execute bank transfer. Make sure you provide in the reference your RFQ id and
            your client id. With SEPA instant payments the process should take only few
            minutes to process, however if banks will process it using SEPA standard
            method it may take up to 2 business days to commit. We guarantee you the RFQ
            price 30 minutes from the request. Any time later the amount might differ
            according to current market conditions at the time of receiving your money.
          </p>
          <p>For recurring payments make sure you reference your client id.</p>
          <p>
            Minimum RFQ amount is 10 EUR or 200 CZK, maximum depends on current
            availability of unused gold tokens.
          </p>
          <p>
            RFQ process requires authenticated user, with validated email and profile. It
            is criminal offense according to 297/2008 Z. z. not to provide full and
            correct information when trading on this platform.
          </p>
        </div>
      </div>
    </div>
  </Layout>
</template>
