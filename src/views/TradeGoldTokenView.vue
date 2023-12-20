<script setup lang="ts">
import Layout from "@/layouts/AuthLayout.vue";
import { FolksRouterClient, Network, SwapMode } from "@folks-router/js-sdk";
import type { SwapQuote } from "@folks-router/js-sdk";
import Panel from "primevue/panel";
import Image from "primevue/image";
import Button from "primevue/button";
import { useAppStore } from "@/stores/app";
import InputNumber from "primevue/inputnumber";
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { Buffer } from "buffer";
import Message from "primevue/message";
import getAsa from "@/scripts/algo/getAsa";
import algosdk from "algosdk";
import getAlgodClient from "@/scripts/algo/getAlgodClient";
import AlgorandAddress from "@/components/AlgorandAddress.vue";
const toast = useToast();

interface IState {
  quantity: number;
  quantityQuote: number;
  quoteUsdcGold: SwapQuote | null;
  quoteGoldUsdc: SwapQuote | null;
  quoteAlgoGold: SwapQuote | null;
  quoteGoldAlgo: SwapQuote | null;
  quoteBtcGold: SwapQuote | null;
  quoteGoldBtc: SwapQuote | null;
  quoteCustomGold: SwapQuote | null;
  quoteGoldCustom: SwapQuote | null;
  lastError: string;
  accountInformation: IAccountInfo | null;
  interval: NodeJS.Timeout | null;
}
interface IAccountInfo {
  address: string;
  amount: number | bigint;
  assets: IAssetInfo[];
}
interface IAssetInfo {
  amount: number;
  "asset-id": number;
  "is-frozen": boolean;
}
const defaultState: IState = {
  quantity: 0.1,
  quantityQuote: 0.1,
  quoteUsdcGold: null,
  quoteGoldUsdc: null,
  quoteAlgoGold: null,
  quoteGoldAlgo: null,
  quoteBtcGold: null,
  quoteGoldBtc: null,
  quoteCustomGold: null,
  quoteGoldCustom: null,
  lastError: "",
  accountInformation: null,
  interval: null,
};
const state = reactive(defaultState);
const refreshCount = ref(1);

const store = useAppStore();

function getFolksClient() {
  if (store.state.env == "mainnet-v1.0") {
    return new FolksRouterClient(Network.MAINNET);
  }
  if (store.state.env == "testnet-v1.0") {
    return new FolksRouterClient(Network.TESTNET);
  }
  return null;
}
async function fetchQuote(swapMode: SwapMode, fromAssetId: number, toAssetId: number) {
  try {
    const client = getFolksClient();
    const algodClient = getAlgodClient(store.state);
    const goldAsa = await getAsa({
      client: algodClient,
      assetId: store.state.tokens.gold,
    });
    state.quantityQuote = state.quantity;
    const amount: number | bigint = BigInt(
      state.quantityQuote * 10 ** goldAsa?.params?.decimals ?? 6
    );
    const feeBps: number | bigint = 10;
    const referrer: string = "AWALLETCPHQPJGCZ6AHLIFPHWBHUEHQ7VBYJVVGQRRY4MEIGWUBKCQYP4Y";
    const maxGroupSize: number = 15;
    return await client?.fetchSwapQuote(
      fromAssetId,
      toAssetId,
      amount,
      swapMode,
      maxGroupSize,
      feeBps,
      referrer
    );
  } catch (e) {
    console.error(`failed fetch ${fromAssetId} to ${toAssetId}`, e);
    return null;
  }
}
async function fetchQuotes() {
  state.quoteUsdcGold = null;
  state.quoteGoldUsdc = null;
  state.quoteUsdcGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.usdc,
    store.state.tokens.gold
  )) as SwapQuote;
  state.quoteGoldUsdc = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.usdc
  )) as SwapQuote;
  state.quoteAlgoGold = null;
  state.quoteGoldAlgo = null;
  state.quoteAlgoGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.algo,
    store.state.tokens.gold
  )) as SwapQuote;
  state.quoteGoldAlgo = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.algo
  )) as SwapQuote;
  state.quoteBtcGold = null;
  state.quoteGoldBtc = null;
  state.quoteBtcGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.btc,
    store.state.tokens.gold
  )) as SwapQuote;
  state.quoteGoldBtc = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.btc
  )) as SwapQuote;
  if (store.state.customToken) {
    state.quoteCustomGold = null;
    state.quoteGoldCustom = null;
    state.quoteCustomGold = (await fetchQuote(
      SwapMode.FIXED_OUTPUT,
      store.state.customToken,
      store.state.tokens.gold
    )) as SwapQuote;
    state.quoteGoldCustom = (await fetchQuote(
      SwapMode.FIXED_INPUT,
      store.state.tokens.gold,
      store.state.customToken
    )) as SwapQuote;
  }
  refreshCount.value++;
}
function format(number: number | undefined | bigint, assetId: number) {
  if (number === undefined) return "-";
  const asa = tokens.data[assetId];
  if (!asa || !asa.params || !asa.params.decimals) return number;
  return (Number(number) / 10 ** asa.params.decimals).toFixed(asa.params.decimals);
}
async function loadAccount() {
  if (!store.state.authState.isAuthenticated) return;
  if (!store.state.authState.account) return;

  const algodClient = getAlgodClient(store.state);
  const accountInfo = await algodClient
    .accountInformation(store.state.authState.account)
    .do();
  state.accountInformation = accountInfo as IAccountInfo;
  refreshCount.value++;
  console.log("accountInfo", state.accountInformation);
}

interface ITokens {
  [key: string]: Record<string, any>;
}
const tokensDefault: ITokens = { data: {} };
const tokens = reactive(tokensDefault);
async function loadTokens() {
  const algodClient = getAlgodClient(store.state);
  const gold = await getAsa({ client: algodClient, assetId: store.state.tokens.gold });
  console.log("gold", gold);
  tokens.data[store.state.tokens.gold] = gold;
  console.log("tokens.data[store.state.tokens.gold]", tokens);
  tokens.data[store.state.tokens.algo] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.algo,
  });
  tokens.data[store.state.tokens.usdc] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.usdc,
  });
  tokens.data[store.state.tokens.btc] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.btc,
  });
  refreshCount.value++;
}
onMounted(async () => {
  await fetchQuotes();
  await loadAccount();
  await loadTokens();

  state.interval = setInterval(async () => {
    await fetchQuotes();
    await loadAccount();
    console.log("log");
  }, 30000);
});
onBeforeUnmount(() => {
  if (state.interval) {
    console.log("clearing timer");
    clearTimeout(state.interval);
    state.interval = null;
  }
});
console.log("store", store);
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function executeQuote(quote: SwapQuote) {
  try {
    const folksRouterClient = getFolksClient();
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
    const slippage = Math.round(10); // 10 = 0.1%
    const folksTxns = await folksRouterClient?.prepareSwapTransactions(
      store.state.authState.account,
      slippage,
      quote
    );
    const unsignedTxns = folksTxns?.map((txn) =>
      algosdk.decodeUnsignedTransaction(Buffer.from(txn, "base64"))
    );
    if (!unsignedTxns) throw new Error("Did not receive any txs from folks router");
    const unsignedTxnsWithoutGroup = unsignedTxns.map((tx) => {
      tx.group = undefined;
      return tx;
    });
    const grouped = algosdk.assignGroupID(unsignedTxnsWithoutGroup);
    console.log(
      "tosign",
      grouped,
      grouped.map((tx) => tx.txID())
    );
    const groupedEncoded = grouped.map((tx) => tx.toByte());
    const txs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[];
    console.log(
      "txs",
      txs,
      txs.map((tx) => algosdk.decodeSignedTransaction(tx).txn.txID())
    );
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      );
    }
    txs.forEach((tx) => {
      const decoded = algosdk.decodeSignedTransaction(tx);
      const found = grouped.find((tx) => tx.txID() == decoded.txn.txID());
      if (!found) {
        throw new Error(
          `We received transaction we did not requested to be signed: ${decoded.txn.txID()}`
        );
      }
    });
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      );
    }
    const algodClient = getAlgodClient(store.state);
    const { txId } = await algodClient.sendRawTransaction(txs).do();
    toast.add({
      severity: "info",
      detail: "Transaction is being submitted to the network",
      life: 5000,
    });
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    toast.add({
      severity: "success",
      detail: "Transaction has been processed",
      life: 5000,
    });
  } catch (e: any) {
    state.lastError = e.message;
    toast.add({ severity: "error", detail: e.message, life: 5000 });
  }
  await delay(100);
  await fetchQuotes();
  await loadAccount();
}

async function optIn(assetId: number) {
  try {
    const algodClient = getAlgodClient(store.state);
    console.log("opting into asset " + assetId);
    const params = await algodClient.getTransactionParams().do();
    const txParams = {
      amount: 0,
      assetIndex: Number(assetId),
      from: store.state.authState.account,
      to: store.state.authState.account,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from(`asa.gold optin`)),
    };
    console.log("txParams", txParams);
    const tx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(txParams);
    const grouped = [tx];

    console.log("tosign", grouped);
    const groupedEncoded = grouped.map((tx) => tx.toByte());
    const txs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[];
    console.log("txs", txs);
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      );
    }
    txs.forEach((tx) => {
      const decoded = algosdk.decodeSignedTransaction(tx);
      const found = grouped.find((tx) => tx.txID() == decoded.txn.txID());
      if (!found) {
        throw new Error(
          `We received transaction we did not requested to be signed: ${decoded.txn.txID()}`
        );
      }
    });
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      );
    }
    const { txId } = await algodClient.sendRawTransaction(txs).do();
    toast.add({
      severity: "info",
      detail: "Transaction is being submitted to the network",
      life: 5000,
    });
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    toast.add({
      severity: "success",
      detail: "Transaction has been processed",
      life: 5000,
    });

    await loadAccount();
  } catch (e: any) {
    state.lastError = e.message;
    toast.add({ severity: "error", detail: e.message, life: 5000 });
  }
}
</script>
<template>
  <Layout :hideTopMenu="false" class="ChangeBackgroundcolor">
    <div class="bg-0-2-10 bg-d1-0-2-20 dextrading-background">
      <div class="title-0-2-11 title-d2-0-2-21">
        <div class="bigTitle-0-2-12 bigTitle-d3-0-2-22">
          Explore multi-chain transactions
        </div>
        <div class="subTitle-0-2-13 subTitle-d4-0-2-23">
          facilitated by Celer Inter-chain Messaging (IM) Framework
        </div>
        <div class="flex flex-row dextrading-inputstyle">
          <InputNumber
            class="flex-grow-1 mr-2"
            v-model="state.quantity"
            inputId="minmax-buttons"
            showButtons
            :min="0"
            :max="100"
            :step="0.1"
            :minFractionDigits="6"
            suffix=" g"
          />
          <Button class="hidden md:revert dextrading-button" @click="fetchQuotes"
            >Refresh quotes</Button
          >
        </div>
        <div class="mt-3">
          <Button class="md:hidden  dextrading-button" @click="fetchQuotes"
            >Refresh quotes</Button
          >
        </div>
      </div>
    </div>
    <Panel
      header="DEX TRADING"
      class="m-4 flex flex-grow-1 flex-column card-0-2-27"
      toggleableContent="text"
    >
      <div v-if="state.lastError">
        <Message severity="error" @close="state.lastError = ''">{{
          state.lastError
        }}</Message>
      </div>
      <table :class="refreshCount" id="tradingtable" class="text-center">
        <tr id="tradingtable-tr">
          <th class="text-center hidden md:revert">Your balance</th>
          <th class="text-center hidden md:revert">Action button</th>
          <th class="text-center hidden xl:revert">Token</th>
          <th class="hidden xl:revert"></th>
          <th class="text-center hidden lg:revert">Price</th>
          <th class="text-center hidden lg:revert">Price</th>
          <th class="hidden xl:revert"></th>
          <th class="text-center hidden xl:revert">Token</th>
          <th class="text-center hidden md:revert">Action button</th>
          <th class="text-center hidden md:revert">Your balance</th>
        </tr>
        <tr
          v-if="
            state.accountInformation &&
            !state.accountInformation.assets.find(
              (token) => token['asset-id'] == store.state.tokens.gold
            )
          "
        >
          <td colspan="10" class="text-center">
            <Button
              @click="optIn(store.state.tokens.gold)"
              :title="`Opt in to asset ${store.state.tokens.gold}`"
              >Open Gold account</Button
            >
          </td>
        </tr>
        <tr
          v-if="
            state.accountInformation &&
            !state.accountInformation.assets.find(
              (token) => token['asset-id'] == store.state.tokens.usdc
            )
          "
        >
          <td colspan="10" class="text-center">
            <Button @click="optIn(store.state.tokens.usdc)">Open USDC account</Button>
          </td>
        </tr>
        <tr v-else>
          <td class="text-center hidden md:revert">
            {{
              format(
                state.accountInformation?.assets?.find(
                  (token) => token["asset-id"] == store.state.tokens.usdc
                )?.amount,
                store.state.tokens.usdc
              )
            }}
          </td>
          <td class="text-center">
            <Button
              v-if="state.quoteUsdcGold"
              class="m-1 bid"
              @click="executeQuote(state.quoteUsdcGold)"
              >Buy {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteUsdcGold?.quoteAmount) / 10 ** 6 }} USDC</Button
            >
          </td>
          <td class="text-center hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.usdc.toString()"
              >USDC</span
            >
          </td>
          <td class="text-center hidden xl:revert">@</td>
          <td v-if="state.quoteUsdcGold?.quoteAmount" class="hidden lg:revert">
            {{
              (
                Number(state.quoteUsdcGold?.quoteAmount) /
                (state.quantityQuote * 10 ** 6)
              ).toFixed(4)
            }}
          </td>
          <td v-else class="hidden lg:revert">No quote</td>
          <td
            class="text-center hidden lg:revert"
            v-if="state.quoteGoldUsdc?.quoteAmount"
          >
            {{
              (
                Number(state.quoteGoldUsdc?.quoteAmount) /
                (state.quantityQuote * 10 ** 6)
              ).toFixed(4)
            }}
          </td>
          <td class="text-center hidden lg:revert" v-else>No quote</td>
          <td class="hidden xl:revert">@</td>
          <td class="hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.usdc.toString()"
              >USDC</span
            >
          </td>
          <td>
            <Button
              v-if="state.quoteGoldUsdc"
              class="m-1 offer"
              @click="executeQuote(state.quoteGoldUsdc)"
              >Sell {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteGoldUsdc?.quoteAmount) / 10 ** 6 }} USDC</Button
            >
          </td>
          <td class="hidden md:revert">
            {{
              format(
                state.accountInformation?.assets?.find(
                  (token) => token["asset-id"] == store.state.tokens.gold
                )?.amount,
                store.state.tokens.gold
              )
            }}
          </td>
        </tr>

        <tr>
          <td class="text-center hidden md:revert">
            {{ format(state.accountInformation?.amount, store.state.tokens.algo) }}
          </td>
          <td class="text-center">
            <Button
              v-if="state.quoteAlgoGold"
              class="m-1 bid"
              @click="executeQuote(state.quoteAlgoGold)"
              >Buy {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteAlgoGold?.quoteAmount) / 10 ** 6 }} Algo</Button
            >
          </td>
          <td class="text-center hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.algo.toString()"
              >Algo</span
            >
          </td>
          <td class="text-center hidden xl:revert">@</td>
          <td v-if="state.quoteAlgoGold?.quoteAmount" class="hidden lg:revert">
            {{
              (
                Number(state.quoteAlgoGold?.quoteAmount) /
                (state.quantityQuote * 10 ** 6)
              ).toFixed(4)
            }}
          </td>
          <td class="hidden lg:revert" v-else>No quote</td>
          <td
            class="text-center hidden lg:revert"
            v-if="state.quoteGoldAlgo?.quoteAmount"
          >
            {{
              (
                Number(state.quoteGoldAlgo?.quoteAmount) /
                (state.quantityQuote * 10 ** 6)
              ).toFixed(4)
            }}
          </td>
          <td class="text-center hidden lg:revert" v-else>No quote</td>
          <td class="hidden xl:revert">@</td>
          <td class="hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.algo.toString()"
              >Algo</span
            >
          </td>
          <td>
            <Button
              v-if="state.quoteGoldAlgo"
              class="m-1 offer"
              @click="executeQuote(state.quoteGoldAlgo)"
              >Sell {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteGoldAlgo?.quoteAmount) / 10 ** 6 }} Algo</Button
            >
          </td>
          <td class="hidden md:revert">
            {{
              format(
                state.accountInformation?.assets?.find(
                  (token) => token["asset-id"] == store.state.tokens.gold
                )?.amount,
                store.state.tokens.gold
              )
            }}
          </td>
        </tr>
        <tr
          v-if="
            state.accountInformation &&
            !state.accountInformation.assets.find(
              (token) => token['asset-id'] == store.state.tokens.btc
            )
          "
        >
          <td colspan="10" class="text-center">
            <Button @click="optIn(store.state.tokens.btc)">Open BTC account</Button>
          </td>
        </tr>
        <tr v-else>
          <td class="text-center hidden md:revert">
            {{
              format(
                state.accountInformation?.assets?.find(
                  (token) => token["asset-id"] == store.state.tokens.btc
                )?.amount,
                store.state.tokens.btc
              )
            }}
          </td>
          <td class="text-center">
            <Button
              v-if="state.quoteBtcGold"
              class="m-1 bid"
              @click="executeQuote(state.quoteBtcGold)"
              >Buy {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteBtcGold?.quoteAmount) / 10 ** 8 }} BTC</Button
            >
          </td>
          <td class="text-center hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.btc.toString()"
              >BTC</span
            >
          </td>
          <td class="text-center hidden xl:revert">@</td>
          <td class="hidden lg:revert" v-if="state.quoteBtcGold?.quoteAmount">
            {{
              (
                Number(state.quoteBtcGold?.quoteAmount) /
                (state.quantityQuote * 10 ** 8)
              ).toFixed(4)
            }}
          </td>
          <td class="hidden lg:revert" v-else>No quote</td>
          <td class="text-center hidden lg:revert" v-if="state.quoteGoldBtc?.quoteAmount">
            {{
              (
                Number(state.quoteGoldBtc?.quoteAmount) /
                (state.quantityQuote * 10 ** 8)
              ).toFixed(4)
            }}
          </td>
          <td class="text-center hidden lg:revert" v-else>No quote</td>
          <td class="hidden xl:revert">@</td>
          <td class="hidden xl:revert">
            <span :title="store.state.tokens.gold.toString()">Gold (g)</span>/<span
              :title="store.state.tokens.btc.toString()"
              >BTC</span
            >
          </td>
          <td>
            <Button
              v-if="state.quoteGoldBtc"
              class="m-1 offer"
              @click="executeQuote(state.quoteGoldBtc)"
              >Sell {{ state.quantityQuote }} grams of gold <br />for
              {{ Number(state.quoteGoldBtc?.quoteAmount) / 10 ** 8 }} BTC</Button
            >
          </td>
          <td class="hidden md:revert">
            {{
              format(
                state.accountInformation?.assets?.find(
                  (token) => token["asset-id"] == store.state.tokens.gold
                )?.amount,
                store.state.tokens.gold
              )
            }}
          </td>
        </tr>
      </table>
      <p class="bottom-data">
        <Image
          src="Haha.jpg"
          alt="Image"
          class="css-1ek128f"
          style="margin-top: 100px"
        />
        <p class="p-display">Blockchain DEX trading is using DEX aggregator</p>
        <p><a href="https://www.folksrouter.io" target="_blank">Folks router.</a></p>
        <span v-if="store.state.authState.account"
          >Your account is
          <AlgorandAddress :address="store.state.authState.account"></AlgorandAddress
          >.</span
        >
      </p>
    </Panel>
  </Layout>
</template>
<style>
#tradingtable tr {
  height: 3em;
}

@media screen and (min-width: 768px) {
  .md\:revert {
    display: revert !important;
  }
}
@media screen and (min-width: 992px) {
  .lg\:revert {
    display: revert !important;
  }
}
@media screen and (min-width: 1200px) {
  .xl\:revert {
    display: revert !important;
  }
}


</style>
