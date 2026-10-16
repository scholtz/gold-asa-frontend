<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { getSwapRouter, effectiveRouterKind, routerLabel, routerUrl } from '@/scripts/router'
import type { ISwapQuote, SwapMode } from '@/scripts/router'
import Panel from '@/components/ui/UiPanel.vue'
import Button from '@/components/ui/UiButton.vue'
import { useAppStore } from '@/stores/app'
import InputNumber from '@/components/ui/UiInputNumber.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from '@/components/ui/useToast'
import { Buffer } from 'buffer'
import SelectButton from '@/components/ui/UiSelectButton.vue'
import Message from '@/components/ui/UiMessage.vue'
import getAsa from '@/scripts/algo/getAsa'
import algosdk from 'algosdk2'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import AlgorandAddress from '@/components/AlgorandAddress.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  if (!(state.quantity > 0)) throw new Error('Enter an amount of gold greater than zero')
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
let refreshing = false
async function fetchQuotes() {
  const run = ++quoteRun
  refreshing = true
  try {
    const result = await loadQuotes(() => run !== quoteRun)
    if (!result) return
    Object.assign(state, result)
    const any = Object.entries(result).some(([key, value]) => key !== 'quantityQuote' && value)
    state.lastError = any ? '' : `No quotes were returned by ${routerName.value} right now.`
  } catch (e: any) {
    if (run !== quoteRun) return
    Object.assign(state, emptyQuotes())
    state.lastError = e.message
  } finally {
    // only the newest run owns the flag; an older run must not re-enable the interval refresh early
    if (run === quoteRun) {
      refreshing = false
      refreshCount.value++
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
  const gold = await getAsa({ client: algodClient, assetId: store.state.tokens.gold })
  console.log('gold', gold)
  tokens.data[store.state.tokens.gold] = gold
  console.log('tokens.data[store.state.tokens.gold]', tokens)
  tokens.data[store.state.tokens.algo] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.algo
  })
  tokens.data[store.state.tokens.usdc] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.usdc
  })
  tokens.data[store.state.tokens.btc] = await getAsa({
    client: algodClient,
    assetId: store.state.tokens.btc
  })
  refreshCount.value++
}
watch(
  () => [store.state.router, store.state.env, store.state.routerHost],
  () => fetchQuotes()
)
let unmounted = false
onMounted(async () => {
  await fetchQuotes()
  await loadAccount()
  await loadTokens()
  if (unmounted) return

  state.interval = setInterval(async () => {
    // do not pile up refreshes when the previous one is still running
    if (refreshing) return
    await fetchQuotes()
    await loadAccount()
    console.log('log')
  }, 30000)
})
onBeforeUnmount(() => {
  unmounted = true
  quoteRun++ // drop results of a refresh that is still running
  if (state.interval) {
    console.log('clearing timer')
    clearInterval(state.interval)
    state.interval = null
  }
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
        detail: 'Please authenticate first',
        life: 5000
      })
      await delay(1000)
      store.state.authComponent?.auth()
      return
    }
    if (quote.router !== routerKind.value) {
      throw new Error('The quotes are outdated (router changed), please refresh and try again')
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

interface IPairRow {
  key: string
  unit: string
  assetId: number
  decimals: number
  optInLabel?: string
  buy: ISwapQuote | null
  sell: ISwapQuote | null
}
function pairRows(): IPairRow[] {
  return [
    {
      key: 'eur',
      unit: 'EURs',
      assetId: store.state.tokens.eur,
      decimals: 6,
      optInLabel: 'Open Stasis EUR account',
      buy: state.quoteEurGold,
      sell: state.quoteGoldEur
    },
    {
      key: 'usdc',
      unit: 'USDC',
      assetId: store.state.tokens.usdc,
      decimals: 6,
      optInLabel: 'Open USDC account',
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
      optInLabel: 'Open BTC account',
      buy: state.quoteBtcGold,
      sell: state.quoteGoldBtc
    }
  ]
}
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
function unitPrice(quote: ISwapQuote | null, row: IPairRow) {
  if (!quote?.quoteAmount) return ''
  if (!state.quantityQuote) return ''
  return (Number(quote.quoteAmount) / (state.quantityQuote * 10 ** row.decimals)).toFixed(4)
}
function totalAmount(quote: ISwapQuote | null, row: IPairRow) {
  return Number(quote?.quoteAmount) / 10 ** row.decimals
}
</script>
<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('trading.exploreDecentralizedTrading') }}</h1>
        <p>Facilitated by Algorand blockchain and the {{ routerName }} DEX aggregator.</p>
      </div>
    </header>

    <section class="section">
      <div class="container stack">
        <div class="toolbar">
          <div class="toolbar__field">
            <label for="minmax-buttons" class="toolbar__label">Amount of gold</label>
            <InputNumber
              class="toolbar__input"
              v-model="state.quantity"
              id="minmax-buttons"
              showButtons
              :min="0"
              :max="100"
              :step="0.1"
              :minFractionDigits="6"
              suffix=" g"
            />
          </div>
          <div class="toolbar__field toolbar__field--router">
            <span id="router-label" class="toolbar__label">Swap router</span>
            <SelectButton
              :modelValue="routerKind"
              :disabled="store.state.env !== 'mainnet-v1.0'"
              @update:modelValue="chooseRouter"
              data-testid="router-select"
              :options="routerOptions"
              optionLabel="name"
              optionValue="value"
              aria-labelledby="router-label"
            />
          </div>
          <Button class="toolbar__btn" severity="secondary" @click="fetchQuotes()"
            >Refresh quotes</Button
          >
        </div>

        <Panel :header="t('trading.dexTrading')">
          <Message v-if="routerFallback" class="trading-error" severity="info">
            Biatec Router is available on Algorand mainnet only. Using Folks Router on this network.
          </Message>
          <Message
            v-if="state.lastError"
            class="trading-error"
            severity="error"
            closable
            @close="state.lastError = ''"
            >{{ state.lastError }}</Message
          >

          <div class="table-wrap trading">
            <table :class="refreshCount" id="tradingtable" class="table">
              <thead>
                <tr id="tradingtable-tr">
                  <th v-if="store.state.authState.isAuthenticated" class="num col-balance">
                    Your balance
                  </th>
                  <th class="col-action">Buy gold</th>
                  <th class="col-pair">Pair</th>
                  <th class="num col-price">Buy price</th>
                  <th class="num col-price">Sell price</th>
                  <th class="col-action">Sell gold</th>
                  <th v-if="store.state.authState.isAuthenticated" class="num col-balance">
                    Gold balance
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="needsOptIn(store.state.tokens.gold)">
                  <td colspan="7" class="optin">
                    <Button
                      severity="secondary"
                      @click="optIn(store.state.tokens.gold)"
                      :title="`Opt in to asset ${store.state.tokens.gold}`"
                      >Open Gold account</Button
                    >
                  </td>
                </tr>
                <template v-for="row in pairRows()" :key="row.key">
                  <tr v-if="row.optInLabel && needsOptIn(row.assetId)">
                    <td colspan="7" class="optin">
                      <Button severity="secondary" @click="optIn(row.assetId)">{{
                        row.optInLabel
                      }}</Button>
                    </td>
                  </tr>
                  <tr v-else>
                    <td v-if="store.state.authState.isAuthenticated" class="num col-balance">
                      {{ balanceOf(row) }}
                    </td>
                    <td class="col-action">
                      <Button
                        v-if="row.buy"
                        class="trade-btn"
                        severity="success"
                        @click="executeQuote(row.buy)"
                        >Buy {{ state.quantityQuote }} grams of gold <br />for
                        {{ totalAmount(row.buy, row) }} {{ row.unit }}</Button
                      >
                      <span v-else class="no-quote">No quote</span>
                    </td>
                    <td class="col-pair">
                      <span :title="String(store.state.tokens.gold)">Gold (g)</span> /
                      <span :title="String(row.assetId)">{{ row.unit }}</span>
                    </td>
                    <td class="num col-price">{{ unitPrice(row.buy, row) || 'No quote' }}</td>
                    <td class="num col-price">{{ unitPrice(row.sell, row) || 'No quote' }}</td>
                    <td class="col-action">
                      <Button
                        v-if="row.sell"
                        class="trade-btn"
                        severity="danger"
                        outlined
                        @click="executeQuote(row.sell)"
                        >Sell {{ state.quantityQuote }} grams of gold <br />for
                        {{ totalAmount(row.sell, row) }} {{ row.unit }}</Button
                      >
                      <span v-else class="no-quote">No quote</span>
                    </td>
                    <td v-if="store.state.authState.isAuthenticated" class="num col-balance">
                      {{ goldBalance() }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </Panel>

        <p class="note">
          Blockchain DEX trading is using DEX aggregator
          <a :href="routerUrl(routerKind)" target="_blank" rel="noopener">{{ routerName }}.</a>
          <span v-if="store.state.authState.account">
            Your account is
            <AlgorandAddress :address="store.state.authState.account"></AlgorandAddress>.
          </span>
        </p>
      </div>
    </section>
  </Layout>
</template>
<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1 1 14rem;
  max-width: 24rem;
}
.toolbar__label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.toolbar__input {
  width: 100%;
}
.trading-error {
  margin-bottom: 1rem;
}
.trading-login {
  margin-left: 0.75rem;
}
.trading {
  box-shadow: none;
}
.trading :deep(.table td) {
  padding: 0.75rem 0.9rem;
}
.col-action {
  text-align: center;
}
.col-pair {
  font-size: 0.85rem;
  font-weight: 500;
}
.trade-btn {
  width: 100%;
  min-width: 0;
  padding-inline: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.35;
  text-align: center;
}
.no-quote {
  color: var(--muted);
  font-size: 0.9rem;
}
.optin {
  text-align: center;
  background: var(--gold-50);
}
.note {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  color: var(--muted);
}
.col-balance,
.col-price {
  display: none;
}
@media (min-width: 576px) {
  .col-price {
    display: table-cell;
  }
}
@media (min-width: 992px) {
  .col-balance {
    display: table-cell;
  }
}
</style>
