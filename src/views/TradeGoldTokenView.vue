<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import {
  getSwapRouter,
  effectiveRouterKind,
  routerLabel,
  routerUrl,
  biatecSupportsEnv
} from '@/scripts/router'
import type { ISwapQuote, SwapMode } from '@/scripts/router'
import Button from '@/components/ui/UiButton.vue'
import { useAppStore } from '@/stores/app'
import InputNumber from '@/components/ui/UiInputNumber.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import UiTag from '@/components/ui/UiTag.vue'
import { useToast } from '@/components/ui/useToast'
import { Buffer } from 'buffer'
import SelectButton from '@/components/ui/UiSelectButton.vue'
import Message from '@/components/ui/UiMessage.vue'
import getAsa from '@/scripts/algo/getAsa'
import algosdk from 'algosdk2'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import AlgorandAddress from '@/components/AlgorandAddress.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const toast = useToast()

interface IState {
  quantity: number
  quantityQuote: number
  quoteUsdcGold: ISwapQuote | null
  quoteGoldUsdc: ISwapQuote | null
  quoteEurGold: ISwapQuote | null
  quoteGoldEur: ISwapQuote | null
  quoteAlgoGold: ISwapQuote | null
  quoteGoldAlgo: ISwapQuote | null
  quoteBtcGold: ISwapQuote | null
  quoteGoldBtc: ISwapQuote | null
  quoteCustomGold: ISwapQuote | null
  quoteGoldCustom: ISwapQuote | null
  lastError: string
  accountInformation: IAccountInfo | null
  interval: NodeJS.Timeout | null
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
  quantity: 0.1,
  quantityQuote: 0.1,
  quoteUsdcGold: null,
  quoteGoldUsdc: null,
  quoteEurGold: null,
  quoteGoldEur: null,
  quoteAlgoGold: null,
  quoteGoldAlgo: null,
  quoteBtcGold: null,
  quoteGoldBtc: null,
  quoteCustomGold: null,
  quoteGoldCustom: null,
  lastError: '',
  accountInformation: null,
  interval: null
}
const state = reactive(defaultState)
const refreshCount = ref(1)
/** restarts the 30 s countdown bar; only changes when a refresh finishes */
const countdownKey = ref(0)
const loading = ref(false)
const lastUpdatedAt = ref<Date | null>(null)
const lastUpdated = computed(() =>
  lastUpdatedAt.value ? lastUpdatedAt.value.toLocaleTimeString(locale.value) : ''
)
const quickAmounts = [0.1, 0.5, 1, 5]

const store = useAppStore()

const routerOptions = [
  { name: 'Biatec Router', value: 'biatec' },
  { name: 'Folks Router', value: 'folks' }
]
function chooseRouter(value: unknown) {
  if (value === 'biatec' || value === 'folks') store.state.router = value
}
const routerKind = computed(() => effectiveRouterKind(store.state.router, store.state.env))
const routerName = computed(() => routerLabel(routerKind.value))
const routerFallback = computed(
  () => store.state.router === 'biatec' && routerKind.value === 'folks'
)

type QuoteResult = Pick<
  IState,
  | 'quantityQuote'
  | 'quoteUsdcGold'
  | 'quoteGoldUsdc'
  | 'quoteEurGold'
  | 'quoteGoldEur'
  | 'quoteAlgoGold'
  | 'quoteGoldAlgo'
  | 'quoteBtcGold'
  | 'quoteGoldBtc'
  | 'quoteCustomGold'
  | 'quoteGoldCustom'
>

const emptyQuotes = (): QuoteResult => ({
  quantityQuote: state.quantityQuote,
  quoteUsdcGold: null,
  quoteGoldUsdc: null,
  quoteEurGold: null,
  quoteGoldEur: null,
  quoteAlgoGold: null,
  quoteGoldAlgo: null,
  quoteBtcGold: null,
  quoteGoldBtc: null,
  quoteCustomGold: null,
  quoteGoldCustom: null
})

/** Fetches all quotes for the current amount; returns null when a newer refresh superseded this one. */
async function loadQuotes(isStale: () => boolean): Promise<QuoteResult | null> {
  if (!(state.quantity > 0)) throw new Error(t('trading.enterAmount'))
  const router = getSwapRouter()
  const goldAsa = await getAsa({
    client: getAlgodClient(store.state),
    assetId: store.state.tokens.gold
  })
  const gold = store.state.tokens.gold
  const quantity = state.quantity
  const amount = Math.round(quantity * 10 ** (goldAsa?.params?.decimals ?? 6))

  const quote = async (mode: SwapMode, fromAsset: number, toAsset: number) => {
    try {
      return await router.fetchQuote({ mode, fromAsset, toAsset, amount })
    } catch (e: any) {
      console.error(`failed fetch ${fromAsset} to ${toAsset}`, e)
      return null
    }
  }

  const result = emptyQuotes()
  result.quantityQuote = quantity
  const pairs: [number, 'Eur' | 'Usdc' | 'Algo' | 'Btc' | 'Custom'][] = [
    [store.state.tokens.eur, 'Eur'],
    [store.state.tokens.usdc, 'Usdc'],
    [store.state.tokens.algo, 'Algo'],
    [store.state.tokens.btc, 'Btc']
  ]
  if (store.state.customToken) pairs.push([store.state.customToken, 'Custom'])
  // all pairs in parallel: a refresh must finish well within the 30s refresh interval
  await Promise.all(
    pairs.flatMap(([asset, name]) => [
      quote('FIXED_OUTPUT', asset, gold).then((q) => {
        result[`quote${name}Gold` as keyof QuoteResult] = q as never
      }),
      quote('FIXED_INPUT', gold, asset).then((q) => {
        result[`quoteGold${name}` as keyof QuoteResult] = q as never
      })
    ])
  )
  if (isStale()) return null
  return result
}

let quoteRun = 0
/** amount of the quote request that is currently running (null when idle) */
let requestedQuantity: number | null = null
let unmounted = false
let quantityTimer: ReturnType<typeof setTimeout> | undefined

/** next automatic refresh 30 s after the last one finished, so the countdown bar is always in sync */
function scheduleNext() {
  if (unmounted) return
  if (state.interval) clearTimeout(state.interval)
  state.interval = setTimeout(async () => {
    try {
      await fetchQuotes()
      await loadAccount()
    } catch (e: any) {
      console.error('automatic refresh failed', e)
    }
  }, 30000)
}
async function fetchQuotes() {
  const run = ++quoteRun
  requestedQuantity = state.quantity
  loading.value = true
  try {
    const result = await loadQuotes(() => run !== quoteRun)
    if (!result) return
    Object.assign(state, result)
    const any = Object.entries(result).some(([key, value]) => key !== 'quantityQuote' && value)
    state.lastError = any ? '' : t('trading.noQuotesReturned', { router: routerName.value })
    lastUpdatedAt.value = any ? new Date() : null
  } catch (e: any) {
    if (run !== quoteRun) return
    Object.assign(state, emptyQuotes())
    state.quantityQuote = state.quantity // nothing is shown for it, so it must not block trading after a retry
    lastUpdatedAt.value = null
    state.lastError = e.message
  } finally {
    // only the newest run owns the flag; an older run must not re-enable the interval refresh early
    if (run === quoteRun) {
      requestedQuantity = null
      loading.value = false
      countdownKey.value++
      refreshCount.value++
      scheduleNext()
    }
  }
}
function format(number: number | undefined | bigint, assetId: number) {
  if (number === undefined) return '-'
  const asa = tokens.data[assetId]
  if (!asa || !asa.params || !asa.params.decimals) return number
  return (Number(number) / 10 ** asa.params.decimals).toFixed(asa.params.decimals)
}
async function loadAccount() {
  if (!store.state.authState.isAuthenticated) return
  if (!store.state.authState.account) return

  const algodClient = getAlgodClient(store.state)
  const accountInfo = await algodClient.accountInformation(store.state.authState.account).do()
  state.accountInformation = accountInfo as IAccountInfo
  refreshCount.value++
  console.log('accountInfo', state.accountInformation)
}

interface ITokens {
  [key: string]: Record<string, any>
}
const tokensDefault: ITokens = { data: {} }
const tokens = reactive(tokensDefault)
async function loadTokens() {
  const algodClient = getAlgodClient(store.state)
  const ids = [
    store.state.tokens.gold,
    store.state.tokens.algo,
    store.state.tokens.usdc,
    store.state.tokens.btc,
    store.state.tokens.eur
  ]
  if (store.state.customToken) ids.push(store.state.customToken)
  await Promise.all(
    ids.map(async (assetId) => {
      try {
        tokens.data[assetId] = await getAsa({ client: algodClient, assetId })
      } catch (e: any) {
        console.error(`failed to load asset ${assetId}`, e)
      }
    })
  )
  refreshCount.value++
}
watch(
  () => [
    store.state.router,
    store.state.env,
    store.state.routerHost,
    store.state.algodHost,
    store.state.algodPort
  ],
  () => fetchQuotes()
)
onMounted(async () => {
  await fetchQuotes()
  // independent: a failing account lookup must not keep the asset names/decimals from loading
  await loadTokens().catch((e) => console.error('failed to load tokens', e))
  await loadAccount().catch((e) => console.error('failed to load account', e))
})
watch(
  () => store.state.customToken,
  async () => {
    await loadTokens()
    fetchQuotes()
  }
)
onBeforeUnmount(() => {
  unmounted = true
  quoteRun++ // drop results of a refresh that is still running
  if (state.interval) {
    clearTimeout(state.interval)
    state.interval = null
  }
  if (quantityTimer) clearTimeout(quantityTimer)
})
console.log('store', store)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function executeQuote(quote: ISwapQuote) {
  try {
    if (!store.state.authState.isAuthenticated) {
      toast.add({
        severity: 'info',
        detail: t('trading.authenticateFirst'),
        life: 5000
      })
      await delay(1000)
      store.state.authComponent?.auth()
      return
    }
    if (state.quantity !== state.quantityQuote) {
      throw new Error(t('trading.amountChanged'))
    }
    if (quote.router !== routerKind.value) {
      throw new Error(t('trading.quotesOutdated'))
    }
    const routerTxns = await getSwapRouter().prepareTransactions(
      quote,
      store.state.authState.account
    )
    const unsignedTxns = routerTxns.map((txn) =>
      algosdk.decodeUnsignedTransaction(Buffer.from(txn, 'base64'))
    )
    if (!unsignedTxns.length) throw new Error(`Did not receive any txs from ${routerName.value}`)
    const unsignedTxnsWithoutGroup = unsignedTxns.map((tx) => {
      tx.group = undefined
      return tx
    })
    const grouped = algosdk.assignGroupID(unsignedTxnsWithoutGroup)
    console.log(
      'tosign',
      grouped,
      grouped.map((tx) => tx.txID())
    )
    const groupedEncoded = grouped.map((tx) => tx.toByte())
    const txs = (await store.state.authComponent!.sign(groupedEncoded)) as Uint8Array[]
    console.log(
      'txs',
      txs,
      txs.map((tx) => algosdk.decodeSignedTransaction(tx).txn.txID())
    )
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
    const algodClient = getAlgodClient(store.state)
    const { txId } = await algodClient.sendRawTransaction(txs).do()
    toast.add({
      severity: 'info',
      detail: t('trading.txSubmitting'),
      life: 5000
    })
    await algosdk.waitForConfirmation(algodClient, txId, 4)
    toast.add({
      severity: 'success',
      detail: t('trading.txProcessed'),
      life: 5000
    })
  } catch (e: any) {
    state.lastError = e.message
    toast.add({ severity: 'error', detail: e.message, life: 5000 })
  }
  await delay(100)
  await fetchQuotes()
  await loadAccount()
}

async function optIn(assetId: number) {
  try {
    const algodClient = getAlgodClient(store.state)
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
    const txs = (await store.state.authComponent!.sign(groupedEncoded)) as Uint8Array[]
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
      detail: t('trading.txSubmitting'),
      life: 5000
    })
    await algosdk.waitForConfirmation(algodClient, txId, 4)
    toast.add({
      severity: 'success',
      detail: t('trading.txProcessed'),
      life: 5000
    })

    await loadAccount()
  } catch (e: any) {
    state.lastError = e.message
    toast.add({ severity: 'error', detail: e.message, life: 5000 })
  }
}

interface IPairRow {
  key: string
  unit: string
  assetId: number
  decimals: number
  optInLabel?: string
  buy: ISwapQuote | null
  sell: ISwapQuote | null
}
function buildRows(): IPairRow[] {
  const custom = store.state.customToken
  const customAsa = custom ? tokens.data[custom] : undefined
  return [
    {
      key: 'eur',
      unit: 'EURs',
      assetId: store.state.tokens.eur,
      decimals: 6,
      optInLabel: t('trading.openEurAccount'),
      buy: state.quoteEurGold,
      sell: state.quoteGoldEur
    },
    {
      key: 'usdc',
      unit: 'USDC',
      assetId: store.state.tokens.usdc,
      decimals: 6,
      optInLabel: t('trading.openUsdcAccount'),
      buy: state.quoteUsdcGold,
      sell: state.quoteGoldUsdc
    },
    {
      key: 'algo',
      unit: 'Algo',
      assetId: store.state.tokens.algo,
      decimals: 6,
      buy: state.quoteAlgoGold,
      sell: state.quoteGoldAlgo
    },
    {
      key: 'btc',
      unit: 'BTC',
      assetId: store.state.tokens.btc,
      decimals: 8,
      optInLabel: t('trading.openBtcAccount'),
      buy: state.quoteBtcGold,
      sell: state.quoteGoldBtc
    },
    ...(custom
      ? [
          {
            key: 'custom',
            unit: String(customAsa?.params?.['unit-name'] ?? `#${custom}`),
            assetId: custom,
            decimals: Number(customAsa?.params?.decimals ?? 6),
            buy: state.quoteCustomGold,
            sell: state.quoteGoldCustom
          }
        ]
      : [])
  ]
}
const rows = computed(() => buildRows())
function hasAsset(assetId: number) {
  return !!state.accountInformation?.assets.find((token) => token['asset-id'] == assetId)
}
function needsOptIn(assetId: number) {
  return !!state.accountInformation && !hasAsset(assetId)
}
function balanceOf(row: IPairRow) {
  if (row.key === 'algo') return format(state.accountInformation?.amount, row.assetId)
  return format(
    state.accountInformation?.assets?.find((token) => token['asset-id'] == row.assetId)?.amount,
    row.assetId
  )
}
function goldBalance() {
  return format(
    state.accountInformation?.assets?.find((token) => token['asset-id'] == store.state.tokens.gold)
      ?.amount,
    store.state.tokens.gold
  )
}
function totalAmount(quote: ISwapQuote | null, row: IPairRow) {
  const total = Number(quote?.quoteAmount) / 10 ** row.decimals
  // exact amount that is signed (trailing zeros trimmed down to 2 decimals)
  const maxDigits = Math.min(row.decimals, 8)
  return total.toLocaleString(locale.value, {
    minimumFractionDigits: Math.min(2, maxDigits),
    maximumFractionDigits: maxDigits,
    useGrouping: false
  })
}

/** asset logos from Biatec Scan; the logos are the same on every network, so mainnet asset ids are used */
const LOGO_ASSETS: Record<string, number> = {
  eur: 227855942,
  usdc: 31566704,
  algo: 0,
  btc: 1058926737
}
const failedLogos = reactive(new Set<string>())
function logoUrl(row: IPairRow): string | null {
  if (failedLogos.has(row.key)) return null
  const id = row.key === 'custom' ? row.assetId : LOGO_ASSETS[row.key]
  return id === undefined ? null : `https://api.algorand.scan.biatec.io/api/asset/image/${id}`
}

function setQuantity(amount: number) {
  state.quantity = amount
}
/** the quotes on screen were requested for another amount than the one in the input */
const quantityStale = computed(() => state.quantity !== state.quantityQuote)
watch(
  () => state.quantity,
  () => {
    // reprice shortly after the user stopped changing the amount
    if (quantityTimer) clearTimeout(quantityTimer)
    quantityTimer = setTimeout(() => {
      if (unmounted || state.quantity === state.quantityQuote) return
      if (requestedQuantity === state.quantity) return // that amount is already being priced
      fetchQuotes()
    }, 500)
  }
)
/** price of 1 gram in the quote asset */
function pricePerGram(quote: ISwapQuote | null, row: IPairRow): number | null {
  if (!quote?.quoteAmount || !state.quantityQuote) return null
  return Number(quote.quoteAmount) / (state.quantityQuote * 10 ** row.decimals)
}
/** more decimals for small prices (BTC) */
function formatPricePerGram(price: number | null): string {
  if (price === null || !Number.isFinite(price)) return ''
  const decimals = price >= 100 ? 2 : price >= 1 ? 4 : 8
  return price.toLocaleString(locale.value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}
function hasPrice(quote: ISwapQuote | null, row: IPairRow): quote is ISwapQuote {
  return pricePerGram(quote, row) !== null
}
function priceText(quote: ISwapQuote | null, row: IPairRow) {
  return formatPricePerGram(pricePerGram(quote, row))
}
function midPrice(row: IPairRow) {
  const buy = pricePerGram(row.buy, row)
  const sell = pricePerGram(row.sell, row)
  // a one-sided market has no reference price
  if (buy === null || sell === null) return ''
  return formatPricePerGram((buy + sell) / 2)
}
/** relative difference between buy and sell price, null without a two-sided market */
function spreadValue(row: IPairRow): number | null {
  const buy = pricePerGram(row.buy, row)
  const sell = pricePerGram(row.sell, row)
  if (buy === null || sell === null || buy <= 0) return null
  return ((buy - sell) / buy) * 100
}
function spreadText(row: IPairRow) {
  const spread = spreadValue(row)
  return spread === null
    ? '-'
    : `${spread.toLocaleString(locale.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
}
/** buy price below sell price: quotes disagree, flag it */
function spreadNegative(row: IPairRow) {
  return (spreadValue(row) ?? 0) < 0
}
</script>
<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero trade-hero">
      <div class="container trade-hero__inner">
        <div>
          <h1>{{ t('trading.exploreDecentralizedTrading') }}</h1>
          <p>{{ t('trading.facilitatedBy', { router: routerName }) }}</p>
        </div>
        <ul class="ticker" :aria-label="t('trading.referencePrices')">
          <li v-for="row in rows" :key="row.key" class="ticker__item">
            <span class="ticker__pair">{{ t('trading.goldGram') }} / {{ row.unit }}</span>
            <span class="ticker__price">{{ midPrice(row) || '-' }}</span>
          </li>
        </ul>
      </div>
    </header>

    <section class="section trade-section">
      <div class="container trade">
        <!-- order settings -->
        <aside class="ticket" :aria-label="t('trading.tradeSettings')">
          <h2 class="ticket__title">{{ t('trading.order') }}</h2>

          <div class="ticket__field">
            <label for="minmax-buttons" class="ticket__label">{{
              t('trading.amountOfGold')
            }}</label>
            <InputNumber
              class="ticket__input"
              v-model="state.quantity"
              id="minmax-buttons"
              showButtons
              :min="0"
              :max="100"
              :step="0.1"
              :minFractionDigits="6"
              suffix=" g"
            />
            <div class="chips" role="group" :aria-label="t('trading.quickAmounts')">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="chip"
                :class="{ 'is-active': state.quantity === amount }"
                @click="setQuantity(amount)"
              >
                {{ amount }} g
              </button>
            </div>
          </div>

          <div class="ticket__field">
            <span id="router-label" class="ticket__label">{{ t('trading.swapRouter') }}</span>
            <SelectButton
              :modelValue="routerKind"
              :disabled="!biatecSupportsEnv(store.state.env)"
              @update:modelValue="chooseRouter"
              data-testid="router-select"
              :options="routerOptions"
              optionLabel="name"
              optionValue="value"
              aria-labelledby="router-label"
            />
          </div>

          <Button
            class="ticket__refresh"
            severity="secondary"
            :loading="loading"
            @click="fetchQuotes()"
            >{{ t('trading.refreshQuotes') }}</Button
          >

          <dl v-if="store.state.authState.isAuthenticated" class="balances">
            <div class="balances__row">
              <dt>{{ t('trading.goldBalance') }}</dt>
              <dd>{{ goldBalance() }} g</dd>
            </div>
            <div v-for="row in rows" :key="row.key" class="balances__row">
              <dt>{{ row.unit }}</dt>
              <dd>{{ balanceOf(row) }}</dd>
            </div>
          </dl>
          <p v-else class="ticket__hint">{{ t('trading.loginToTrade') }}</p>
        </aside>

        <!-- market -->
        <div class="market">
          <div class="market__head">
            <div class="market__title">
              <span class="live-dot" :class="{ 'is-loading': loading }" aria-hidden="true"></span>
              <h2>{{ t('trading.dexTrading') }}</h2>
              <UiTag severity="contrast" rounded>{{ routerName }}</UiTag>
            </div>
            <div class="market__meta">
              <span v-if="lastUpdated">{{ t('trading.updated', { time: lastUpdated }) }}</span>
              <span v-else>{{ t('trading.loadingPrices') }}</span>
              <span class="market__qty">{{
                t('trading.forAmount', { amount: state.quantityQuote })
              }}</span>
            </div>
          </div>
          <div class="live" aria-hidden="true">
            <span :key="countdownKey"></span>
          </div>

          <div class="market__notices">
            <Message v-if="routerFallback" severity="info">{{
              t('trading.biatecUnavailable')
            }}</Message>
            <Message
              v-if="state.lastError"
              severity="error"
              closable
              @close="state.lastError = ''"
              >{{ state.lastError }}</Message
            >
          </div>

          <div class="market__scroll">
            <table :class="refreshCount" id="tradingtable" class="mkt">
              <thead>
                <tr id="tradingtable-tr">
                  <th class="mkt__pair">{{ t('trading.pair') }}</th>
                  <th class="num">{{ t('trading.sellPrice') }}</th>
                  <th class="num">{{ t('trading.buyPrice') }}</th>
                  <th class="num mkt__spread">{{ t('trading.spread') }}</th>
                  <th class="mkt__actions">{{ t('trading.trade') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="needsOptIn(store.state.tokens.gold)" class="mkt__optin">
                  <td colspan="5">
                    <Button
                      severity="secondary"
                      size="small"
                      @click="optIn(store.state.tokens.gold)"
                      :title="t('trading.optInAsset', { id: store.state.tokens.gold })"
                      >{{ t('trading.openGoldAccount') }}</Button
                    >
                  </td>
                </tr>
                <template v-for="row in rows" :key="row.key">
                  <tr v-if="row.optInLabel && needsOptIn(row.assetId)" class="mkt__optin">
                    <td colspan="5">
                      <Button severity="secondary" size="small" @click="optIn(row.assetId)">{{
                        row.optInLabel
                      }}</Button>
                    </td>
                  </tr>
                  <tr v-else>
                    <td class="mkt__pair" :data-label="t('trading.pair')">
                      <span class="coin" :class="`coin--${row.key}`" aria-hidden="true">
                        <img
                          v-if="logoUrl(row)"
                          :src="logoUrl(row) as string"
                          alt=""
                          width="32"
                          height="32"
                          loading="lazy"
                          @error="failedLogos.add(row.key)"
                        />
                        <template v-else>{{ row.unit.charAt(0) }}</template>
                      </span>
                      <strong class="mkt__name"
                        ><span :title="String(store.state.tokens.gold)">{{
                          t('trading.goldGram')
                        }}</span>
                        / <span :title="String(row.assetId)">{{ row.unit }}</span></strong
                      >
                    </td>
                    <td class="num mkt__sell" :data-label="t('trading.sellPrice')">
                      <template v-if="priceText(row.sell, row)">{{
                        priceText(row.sell, row)
                      }}</template>
                      <span v-else class="no-quote" :class="{ 'is-loading': loading }">{{
                        t('trading.noQuote')
                      }}</span>
                    </td>
                    <td class="num mkt__buy" :data-label="t('trading.buyPrice')">
                      <template v-if="priceText(row.buy, row)">{{
                        priceText(row.buy, row)
                      }}</template>
                      <span v-else class="no-quote" :class="{ 'is-loading': loading }">{{
                        t('trading.noQuote')
                      }}</span>
                    </td>
                    <td
                      class="num mkt__spread"
                      :class="{ 'is-inverted': spreadNegative(row) }"
                      :data-label="t('trading.spread')"
                      :title="spreadNegative(row) ? t('trading.spreadInverted') : undefined"
                    >
                      {{ spreadText(row) }}
                    </td>
                    <td class="mkt__actions">
                      <button
                        v-if="hasPrice(row.buy, row)"
                        type="button"
                        class="act act--buy"
                        :disabled="quantityStale"
                        :aria-label="
                          t('trading.buyLabel', {
                            amount: state.quantityQuote,
                            total: totalAmount(row.buy, row),
                            unit: row.unit
                          })
                        "
                        @click="executeQuote(row.buy)"
                      >
                        <span class="act__verb">{{ t('trading.buy') }}</span>
                        <span class="act__sub">{{ totalAmount(row.buy, row) }} {{ row.unit }}</span>
                      </button>
                      <span v-else class="act act--off">{{ t('trading.buy') }}</span>
                      <button
                        v-if="hasPrice(row.sell, row)"
                        type="button"
                        class="act act--sell"
                        :disabled="quantityStale"
                        :aria-label="
                          t('trading.sellLabel', {
                            amount: state.quantityQuote,
                            total: totalAmount(row.sell, row),
                            unit: row.unit
                          })
                        "
                        @click="executeQuote(row.sell)"
                      >
                        <span class="act__verb">{{ t('trading.sell') }}</span>
                        <span class="act__sub"
                          >{{ totalAmount(row.sell, row) }} {{ row.unit }}</span
                        >
                      </button>
                      <span v-else class="act act--off">{{ t('trading.sell') }}</span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <p class="note">
            <i18n-t keypath="trading.note" tag="span">
              <template #router>
                <a :href="routerUrl(routerKind)" target="_blank" rel="noopener">{{ routerName }}</a>
              </template>
            </i18n-t>
            <span v-if="store.state.authState.account">
              {{ t('trading.yourAccountIs') }}
              <AlgorandAddress :address="store.state.authState.account"></AlgorandAddress>.
            </span>
          </p>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
/* ---- hero with price ticker ---- */
.trade-hero {
  padding: 2rem 0 1.75rem;
}
.trade-hero__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}
.trade-hero h1 {
  font-size: clamp(1.7rem, 3vw, 2.4rem);
  margin-bottom: 0.3rem;
}
.ticker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ticker__item {
  display: flex;
  flex-direction: column;
  min-width: 7.5rem;
  padding: 0.5rem 0.85rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
}
.ticker__pair {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--on-dark-muted);
}
.ticker__price {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--gold-300);
  font-variant-numeric: tabular-nums;
}

/* ---- layout ---- */
.trade-section {
  padding-top: 2rem;
}
.trade {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
  align-items: start;
}
@media (min-width: 992px) {
  .trade {
    grid-template-columns: minmax(0, 1fr) 19rem;
    grid-template-areas: 'market ticket';
  }
  .market {
    grid-area: market;
  }
  .ticket {
    grid-area: ticket;
    position: sticky;
    top: calc(var(--header-height) + 1rem);
  }
}

/* ---- order ticket (light card) ---- */
.ticket {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.ticket__title {
  margin: 0;
  font-size: 1.15rem;
}
.ticket__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.ticket__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.ticket__input {
  width: 100%;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  padding: 0.25rem 0.7rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
  background: var(--surface-alt);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
}
.chip:hover,
.chip.is-active {
  color: var(--gold-700);
  background: var(--gold-50);
  border-color: var(--gold-500);
}
.ticket__refresh {
  width: 100%;
}
.ticket__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}
.balances {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding-top: 0.9rem;
  border-top: 1px solid var(--line);
  font-size: 0.9rem;
}
.balances__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.balances dt {
  color: var(--muted);
}
.balances dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---- market (dark trading panel) ---- */
.market {
  container: market / inline-size;
  min-width: 0;
  color: var(--on-dark);
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.market__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}
.market__title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.market__title h2 {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--on-dark);
}
.market__meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--on-dark-muted);
}
.market__qty {
  color: var(--gold-300);
  font-weight: 600;
}
.live-dot {
  width: 0.6rem;
  height: 0.6rem;
  background: var(--trade-up);
  border-radius: 50%;
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--trade-up) 60%, transparent);
  animation: pulse 2s infinite;
}
.live-dot.is-loading {
  background: var(--gold-500);
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 0.5rem color-mix(in srgb, var(--trade-up) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--trade-up) 0%, transparent);
  }
}
/* countdown to the next automatic refresh (30 s) */
.live {
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
}
.live span {
  display: block;
  height: 100%;
  background: var(--gold-500);
  transform-origin: left;
  animation: countdown 30s linear forwards;
}
@keyframes countdown {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
.market__notices:not(:empty) {
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.25rem 0;
}
.market__scroll {
  overflow-x: auto;
}

.mkt {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.mkt th,
.mkt td {
  padding: 0.85rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.mkt thead th {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--on-dark-muted);
  white-space: nowrap;
}
.mkt th:first-child,
.mkt td:first-child {
  padding-left: 1.25rem;
}
.mkt th:last-child,
.mkt td:last-child {
  padding-right: 1.25rem;
}
.mkt tbody tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}
.mkt .num {
  text-align: right;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 0.98rem;
  white-space: nowrap;
}
.mkt thead .num {
  font-family: var(--font-sans);
  font-size: 0.7rem;
}
.mkt__sell {
  color: var(--trade-sell-text);
}
.mkt__buy {
  color: var(--trade-buy-text);
}
.mkt__spread {
  color: var(--on-dark-muted);
  font-size: 0.85rem;
}
.mkt__spread.is-inverted {
  color: var(--gold-300);
}
.mkt__pair {
  white-space: nowrap;
}
.coin {
  display: inline-grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  margin-right: 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--on-accent);
  vertical-align: middle;
  background: var(--coin-default);
  border-radius: 50%;
}
.coin img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.coin--eur {
  background: var(--coin-eur);
}
.coin--usdc {
  background: var(--coin-usdc);
}
.coin--algo {
  background: var(--coin-algo);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.coin--btc {
  background: var(--coin-btc);
}
.mkt__actions {
  text-align: right;
}
.mkt td.mkt__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.act {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 6.6rem;
  padding: 0.4rem 0.7rem;
  font: inherit;
  line-height: 1.2;
  color: var(--on-accent);
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.05s ease;
}
.act:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.act:active:not(:disabled) {
  transform: translateY(1px);
}
.act__verb {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.act__sub {
  max-width: none;
  overflow: hidden;
  font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 0.68rem;
  opacity: 0.92;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.act--buy {
  background: var(--trade-buy);
}
.act--buy:hover {
  background: var(--trade-buy-hover);
}
.act--sell {
  background: var(--trade-sell);
}
.act--sell:hover {
  background: var(--trade-sell-hover);
}
.act--off {
  justify-content: center;
  color: var(--on-dark-muted);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
  cursor: default;
}
.no-quote {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--on-dark-muted);
}
.no-quote.is-loading {
  display: inline-block;
  width: 4.5rem;
  height: 0.9rem;
  overflow: hidden;
  color: transparent;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(255, 255, 255, 0.06) 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.3s ease-in-out infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
.mkt__optin td {
  background: rgba(201, 162, 39, 0.08);
}

.note {
  margin: 0;
  padding: 1rem 1.25rem 1.25rem;
  font-size: 0.82rem;
  color: var(--on-dark-muted);
}
.note a {
  color: var(--gold-300);
}

/* ---- narrow market panel: drop the spread column ---- */
@container market (max-width: 839px) {
  .mkt th.mkt__spread,
  .mkt td.mkt__spread {
    display: none;
  }
}

/* ---- small panel (phones, tablets): each pair becomes a card ---- */
@container market (max-width: 719px) {
  .market__head {
    padding: 0.9rem 1rem;
  }
  .market__scroll {
    overflow: visible;
  }
  .mkt thead {
    display: none;
  }
  .mkt,
  .mkt tbody {
    display: block;
  }
  .mkt tbody {
    display: grid;
    gap: 0.75rem;
    padding: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  }
  .mkt tr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'pair spread'
      'sell buy'
      'actions actions';
    gap: 0.6rem;
    padding: 0.9rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius);
  }
  .mkt th,
  .mkt td,
  .mkt th:first-child,
  .mkt td:first-child,
  .mkt th:last-child,
  .mkt td:last-child {
    padding: 0;
    border: 0;
  }
  .mkt tbody tr:hover td {
    background: transparent;
  }
  .mkt td.mkt__pair {
    grid-area: pair;
    display: flex;
    align-items: center;
  }
  .mkt td.mkt__spread,
  .mkt th.mkt__spread {
    display: block;
    grid-area: spread;
    align-self: center;
    text-align: right;
  }
  .mkt td.mkt__spread::before {
    content: 'Spread ';
    font-family: var(--font-sans);
  }
  .mkt td.mkt__sell {
    grid-area: sell;
  }
  .mkt td.mkt__buy {
    grid-area: buy;
  }
  .mkt td.mkt__sell,
  .mkt td.mkt__buy {
    padding: 0.55rem 0.7rem;
    font-size: 1.1rem;
    text-align: left;
    background: rgba(0, 0, 0, 0.22);
    border-radius: var(--radius-sm);
  }
  .mkt td.mkt__sell::before,
  .mkt td.mkt__buy::before {
    display: block;
    margin-bottom: 0.1rem;
    content: attr(data-label);
    font-family: var(--font-sans);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--on-dark-muted);
  }
  .mkt td.mkt__actions {
    grid-area: actions;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .mkt__actions .act {
    min-height: 2.9rem;
    justify-content: center;
  }
  .mkt__optin {
    display: block;
  }
  .mkt tr.mkt__optin {
    display: block;
  }
  .mkt tr.mkt__optin td {
    background: transparent;
  }
  .note {
    padding: 0.9rem 1rem 1.1rem;
  }
}

@media (max-width: 575px) {
  .trade-hero h1 {
    font-size: 1.6rem;
  }
  .ticker {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
  }
  .ticker__item {
    min-width: 0;
  }
  .trade-section {
    padding-top: 1.25rem;
  }
  .market__meta {
    width: 100%;
    justify-content: space-between;
  }
}
@media (prefers-reduced-motion: reduce) {
  .live span,
  .live-dot,
  .no-quote.is-loading {
    animation: none;
  }
}
</style>
