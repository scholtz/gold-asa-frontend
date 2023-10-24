<script setup lang="ts">
import { FolksRouterClient, Network, SwapMode } from '@folks-router/js-sdk'
import type { SwapQuote } from '@folks-router/js-sdk'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import { useAppStore } from '@/stores/app'
import InputNumber from 'primevue/inputnumber'
import { onMounted, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Buffer } from 'buffer'
import TabMenuTradeToken from '@/components/TabMenuTradeToken.vue'
import router from '@/router'
import Message from 'primevue/message'

import algosdk from 'algosdk'
const toast = useToast()

interface IState {
  quantity: number
  quoteUsdcGold: SwapQuote | null
  quoteGoldUsdc: SwapQuote | null
  quoteAlgoGold: SwapQuote | null
  quoteGoldAlgo: SwapQuote | null
  quoteBtcGold: SwapQuote | null
  quoteGoldBtc: SwapQuote | null
  quoteCustomGold: SwapQuote | null
  quoteGoldCustom: SwapQuote | null
  lastError: string
  accountInformation: IAccountInfo | null
}
interface IAccountInfo {
  address: string
  amount: number | bigint
  assets: IAssetInfo[]
}
interface IAssetInfo {
  amount: number
  'asset-id': number
  'is-frozen': boolean
}
const defaultState: IState = {
  quantity: 1,
  quoteUsdcGold: null,
  quoteGoldUsdc: null,
  quoteAlgoGold: null,
  quoteGoldAlgo: null,
  quoteBtcGold: null,
  quoteGoldBtc: null,
  quoteCustomGold: null,
  quoteGoldCustom: null,
  lastError: '',
  accountInformation: null
}
const state = reactive(defaultState)

const store = useAppStore()

function getFolksClient() {
  if (store.state.env == 'mainnet-v1.0') {
    return new FolksRouterClient(Network.MAINNET)
  }
  if (store.state.env == 'testnet-v1.0') {
    return new FolksRouterClient(Network.TESTNET)
  }
  return null
}
async function fetchQuote(swapMode: SwapMode, fromAssetId: number, toAssetId: number) {
  try {
    const client = getFolksClient()
    const amount: number | bigint = BigInt(state.quantity * 10 ** 6)
    const feeBps: number | bigint = 10
    const referrer: string = 'AWALLETCPHQPJGCZ6AHLIFPHWBHUEHQ7VBYJVVGQRRY4MEIGWUBKCQYP4Y'
    const maxGroupSize: number = 15
    return await client?.fetchSwapQuote(
      fromAssetId,
      toAssetId,
      amount,
      swapMode,
      maxGroupSize,
      feeBps,
      referrer
    )
  } catch (e) {
    console.error(`failed fetch ${fromAssetId} to ${toAssetId}`, e)
    return null
  }
}
async function fetchQuotes() {
  state.quoteUsdcGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.usdc,
    store.state.tokens.gold
  )) as SwapQuote
  state.quoteGoldUsdc = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.usdc
  )) as SwapQuote
  state.quoteAlgoGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.algo,
    store.state.tokens.gold
  )) as SwapQuote
  state.quoteGoldAlgo = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.algo
  )) as SwapQuote
  state.quoteBtcGold = (await fetchQuote(
    SwapMode.FIXED_OUTPUT,
    store.state.tokens.btc,
    store.state.tokens.gold
  )) as SwapQuote
  state.quoteGoldBtc = (await fetchQuote(
    SwapMode.FIXED_INPUT,
    store.state.tokens.gold,
    store.state.tokens.btc
  )) as SwapQuote
  if (store.state.customToken) {
    state.quoteBtcGold = (await fetchQuote(
      SwapMode.FIXED_OUTPUT,
      store.state.customToken,
      store.state.tokens.gold
    )) as SwapQuote
    state.quoteGoldBtc = (await fetchQuote(
      SwapMode.FIXED_INPUT,
      store.state.tokens.gold,
      store.state.customToken
    )) as SwapQuote
  }
}

async function loadAccount() {
  if (!store.state.authState.isAuthenticated) return
  if (!store.state.authState.account) return

  var algodClient = new algosdk.Algodv2(
    store.state.algodToken,
    store.state.algodHost,
    store.state.algodPort
  )

  const accountInfo = await algodClient.accountInformation(store.state.authState.account).do()
  state.accountInformation = accountInfo as IAccountInfo
  console.log('accountInfo', state.accountInformation)
}

onMounted(async () => {
  await fetchQuotes()
  await loadAccount()
})
console.log('store', store)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function executeQuote(quote: SwapQuote) {
  try {
    const folksRouterClient = getFolksClient()
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: 'info',
        detail: 'Please authenticate first',
        life: 5000
      })
      await delay(1000)
      router.push('/auth/trade-gold/')
      return
    }
    const slippage = Math.round(10) // 10 = 0.1%
    const folksTxns = await folksRouterClient?.prepareSwapTransactions(
      store.state.authState.account,
      slippage,
      quote
    )
    const unsignedTxns = folksTxns?.map((txn) =>
      algosdk.decodeUnsignedTransaction(Buffer.from(txn, 'base64'))
    )
    if (!unsignedTxns) throw new Error('Did not receive any txs from folks router')
    const grouped = algosdk.assignGroupID(unsignedTxns)
    console.log('tosign', grouped)
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const txs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    console.log('txs', txs)
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      )
    }
    txs.forEach((tx) => {
      const decoded = algosdk.decodeSignedTransaction(tx)
      const found = grouped.find((tx) => tx.txID() == decoded.txn.txID())
      if (!found) {
        throw new Error(
          `We received transaction we did not requested to be signed: ${decoded.txn.txID()}`
        )
      }
    })
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      )
    }
    var algodClient = new algosdk.Algodv2(
      store.state.algodToken,
      store.state.algodHost,
      store.state.algodPort
    )
    const { txId } = await algodClient.sendRawTransaction(txs).do()
    toast.add({
      severity: 'info',
      detail: 'Transaction is being submitted to the network',
      life: 5000
    })
    await algosdk.waitForConfirmation(algodClient, txId, 4)
    toast.add({
      severity: 'success',
      detail: 'Transaction has been processed',
      life: 5000
    })
  } catch (e: any) {
    state.lastError = e.message
    toast.add({ severity: 'error', detail: e.message, life: 5000 })
  }
}

async function optIn(assetId: number) {
  try {
    var algodClient = new algosdk.Algodv2(
      store.state.algodToken,
      store.state.algodHost,
      store.state.algodPort
    )
    console.log('opting into asset ' + assetId)
    const params = await algodClient.getTransactionParams().do()
    const txParams = {
      amount: 0,
      assetIndex: Number(assetId),
      from: store.state.authState.account,
      to: store.state.authState.account,
      suggestedParams: params,
      note: new Uint8Array(Buffer.from(`asa.gold optin`))
    }
    console.log('txParams', txParams)
    const tx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(txParams)
    const grouped = [tx]

    console.log('tosign', grouped)
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const txs = (await store.state.authComponent.sign(groupedEncoded)) as Uint8Array[]
    console.log('txs', txs)
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      )
    }
    txs.forEach((tx) => {
      const decoded = algosdk.decodeSignedTransaction(tx)
      const found = grouped.find((tx) => tx.txID() == decoded.txn.txID())
      if (!found) {
        throw new Error(
          `We received transaction we did not requested to be signed: ${decoded.txn.txID()}`
        )
      }
    })
    if (txs.length != grouped.length) {
      throw new Error(
        `Signing did not return same number of transactions. To be signed was ${grouped.length}, signed: ${txs.length}`
      )
    }
    const { txId } = await algodClient.sendRawTransaction(txs).do()
    toast.add({
      severity: 'info',
      detail: 'Transaction is being submitted to the network',
      life: 5000
    })
    await algosdk.waitForConfirmation(algodClient, txId, 4)
    toast.add({
      severity: 'success',
      detail: 'Transaction has been processed',
      life: 5000
    })

    await loadAccount()
  } catch (e: any) {
    state.lastError = e.message
    toast.add({ severity: 'error', detail: e.message, life: 5000 })
  }
}
</script>
<template>
  <TabMenuTradeToken />
  <Panel header="Trade gold" class="m-4 flex flex-grow-1 flex-column" toggleableContent="text">
    <h4>
      Blockchain trade - using DEX aggregator
      <a href="https://www.folksrouter.io" target="_blank">Folks router</a>
    </h4>
    <div class="flex flex-row">
      <InputNumber
        class="flex-grow-1 mr-2"
        v-model="state.quantity"
        inputId="stacked-buttons"
        showButtons
        :min="0"
        :max="100"
        :step="0.0001"
        :minFractionDigits="6"
        suffix=" g"
      />
      <Button @click="fetchQuotes">Refresh quotes</Button>
    </div>
    <div v-if="state.lastError">
      <Message severity="error" @close="state.lastError = ''">{{ state.lastError }}</Message>
    </div>
    <div class="grid">
      <div
        v-if="
          state.accountInformation &&
          !state.accountInformation.assets.find(
            (token) => token['asset-id'] == store.state.tokens.usdc
          )
        "
        class="col-12 align-items-center align-self-center text-center m-1"
      >
        <Button @click="optIn(store.state.tokens.usdc)">Open USDC account</Button>
      </div>
      <div v-else>
        <div class="col-12 md:col-6 text-right" v-if="state.quoteUsdcGold">
          <div class="flex flex-row align-items-center align-self-center">
            <div class="flex-grow-1"></div>
            <Button class="m-1" @click="executeQuote(state.quoteUsdcGold)">Buy gold</Button>
            <div class="currency m-1">USDC</div>
            <div class="m-1">@</div>
            <div class="m-1">
              {{ Number(state.quoteUsdcGold?.quoteAmount) / (state.quantity * 10 ** 6) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6" v-if="state.quoteGoldUsdc">
          <div class="flex flex-row align-items-center align-self-center">
            <span>{{ Number(state.quoteGoldUsdc?.quoteAmount) / (state.quantity * 10 ** 6) }}</span>
            <div class="m-1">@</div>
            <div class="currency m-1">USDC</div>
            <Button class="m-1" @click="executeQuote(state.quoteGoldUsdc)">Sell gold</Button>
            <div class="flex-grow-1"></div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6" v-if="state.quoteAlgoGold">
        <div class="flex flex-row align-items-center align-self-center">
          <div class="flex-grow-1"></div>
          <Button class="m-1" @click="executeQuote(state.quoteAlgoGold)">Buy gold</Button>
          <div class="currency m-1">Algo</div>
          <div class="m-1">@</div>
          <div class="m-1">
            {{ Number(state.quoteAlgoGold?.quoteAmount) / (state.quantity * 10 ** 6) }}
          </div>
        </div>
      </div>
      <div class="col-12 md:col-6" v-if="state.quoteGoldAlgo">
        <div class="flex flex-row align-items-center align-self-center">
          <span>{{ Number(state.quoteGoldAlgo?.quoteAmount) / (state.quantity * 10 ** 6) }}</span>
          <div class="m-1">@</div>
          <div class="currency m-1">Algo</div>
          <Button class="m-1" @click="executeQuote(state.quoteGoldAlgo)">Sell gold</Button>
          <div class="flex-grow-1"></div>
        </div>
      </div>

      <div
        v-if="
          state.accountInformation &&
          !state.accountInformation.assets.find(
            (token) => token['asset-id'] == store.state.tokens.btc
          )
        "
        class="col-12 align-items-center align-self-center text-center m-1"
      >
        <Button @click="optIn(store.state.tokens.btc)">Open BTC account</Button>
      </div>
      <div v-else>
        <div class="col-12 md:col-6" v-if="state.quoteBtcGold">
          <div class="flex flex-row align-items-center align-self-center">
            <div class="flex-grow-1"></div>
            <Button class="m-1" @click="executeQuote(state.quoteBtcGold)">Buy gold</Button>
            <div class="currency m-1">BTC</div>
            <div class="m-1">@</div>
            <div class="m-1">
              {{ Number(state.quoteBtcGold?.quoteAmount) / (state.quantity * 10 ** 6) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6" v-if="state.quoteGoldBtc">
          <div class="flex flex-row align-items-center align-self-center">
            <span>{{ Number(state.quoteGoldBtc?.quoteAmount) / (state.quantity * 10 ** 6) }}</span>
            <div class="m-1">@</div>
            <div class="currency m-1">BTC</div>
            <Button class="m-1" @click="executeQuote(state.quoteGoldBtc)">Sell gold</Button>
            <div class="flex-grow-1"></div>
          </div>
        </div>
      </div>

      <div
        v-if="
          store.state.customToken &&
          state.accountInformation &&
          !state.accountInformation.assets.find(
            (token) => token['asset-id'] == store.state.customToken
          )
        "
        class="col-12 align-items-center align-self-center text-center m-1"
      >
        <Button @click="optIn(store.state.customToken)"
          >Open {{ store.state.customToken }} account</Button
        >
      </div>
      <div v-else>
        <div class="col-12 md:col-6" v-if="state.quoteCustomGold">
          <div class="flex flex-row align-items-center align-self-center">
            <div class="flex-grow-1"></div>
            <Button class="m-1" @click="executeQuote(state.quoteCustomGold)">Buy gold</Button>
            <div class="currency m-1">{{ store.state.customToken }}</div>
            <div class="m-1">@</div>
            <div class="m-1">
              {{ Number(state.quoteCustomGold?.quoteAmount) / (state.quantity * 10 ** 6) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6" v-if="state.quoteGoldCustom">
          <div class="flex flex-row align-items-center align-self-center">
            <span>{{
              Number(state.quoteGoldCustom?.quoteAmount) / (state.quantity * 10 ** 6)
            }}</span>
            <div class="m-1">@</div>
            <div class="currency m-1">{{ store.state.customToken }}</div>
            <Button class="m-1" @click="executeQuote(state.quoteGoldCustom)">Sell gold</Button>
            <div class="flex-grow-1"></div>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>
