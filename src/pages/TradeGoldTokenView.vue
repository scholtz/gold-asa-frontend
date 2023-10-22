<script setup lang="ts">
import { FolksRouterClient, Network, SwapMode } from '@folks-router/js-sdk'
import type { SwapQuote } from '@folks-router/js-sdk'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import { useAppStore } from '@/stores/app'
import InputNumber from 'primevue/inputnumber'
import { onMounted, reactive } from 'vue'

interface IState {
  quantity: number
  quoteUsdcGold: SwapQuote | null
  quoteGoldUsdc: SwapQuote | null
  quoteAlgoGold: SwapQuote | null
  quoteGoldAlgo: SwapQuote | null
  quoteBtcGold: SwapQuote | null
  quoteGoldBtc: SwapQuote | null
}
const defaultState: IState = {
  quantity: 1,
  quoteUsdcGold: null,
  quoteGoldUsdc: null,
  quoteAlgoGold: null,
  quoteGoldAlgo: null,
  quoteBtcGold: null,
  quoteGoldBtc: null
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
}
onMounted(async () => {
  await fetchQuotes()
})
console.log('store', store)
</script>
<template>
  <Panel
    header="Trade gold"
    class="m-4 flex flex-grow-1 flex-column"
    title="title"
    toggleableContent="text"
  >
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

    <div class="grid">
      <div class="col-12 md:col-6 text-right" v-if="state.quoteUsdcGold">
        <div class="flex flex-row align-items-center align-self-center">
          <div class="flex-grow-1"></div>
          <Button class="m-1">Buy gold</Button>
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
          <Button class="m-1">Sell gold</Button>
          <div class="flex-grow-1"></div>
        </div>
      </div>

      <div class="col-12 md:col-6" v-if="state.quoteAlgoGold">
        <div class="flex flex-row align-items-center align-self-center">
          <div class="flex-grow-1"></div>
          <Button class="m-1">Buy gold</Button>
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
          <Button class="m-1">Sell gold</Button>
          <div class="flex-grow-1"></div>
        </div>
      </div>

      <div class="col-12 md:col-6" v-if="state.quoteBtcGold">
        <div class="flex flex-row align-items-center align-self-center">
          <div class="flex-grow-1"></div>
          <Button class="m-1">Buy gold</Button>
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
          <Button class="m-1">Sell gold</Button>
          <div class="flex-grow-1"></div>
        </div>
      </div>
    </div>
  </Panel>
</template>
