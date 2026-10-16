import type { IFetchQuoteInput, ISwapQuote, ISwapRouter } from './types'
import { SLIPPAGE_BPS } from './types'

/** Minimal surface of the Biatec Router REST API that this app needs. */
export interface IBiatecApi {
  /** Amount of `toAsset` received for selling `amount` of `fromAsset` (fixed input). */
  quote(fromAsset: number, toAsset: number, amount: number): Promise<number>
  /** Unsigned transactions (base64) for swapping `swapAmount` and receiving at least `receiveMinimum`. */
  routeTxs(input: {
    sender: string
    fromAsset: number
    toAsset: number
    swapAmount: number
    receiveMinimum: number
  }): Promise<string[]>
}

/** Accepted overshoot of a derived "buy" quote, relative to the wanted amount. */
const OVERSHOOT = 0.002
const MAX_ITERATIONS = 5

/**
 * The router only supports fixed input quotes. To price "buy exactly `target` of `toAsset`" we search the
 * input amount: start from the reverse quote (selling `target` back), pad it slightly, then rescale until
 * the output is at least `target` and within OVERSHOOT of it.
 * Returns null when the router has no liquidity or the target cannot be reached.
 */
export async function quoteFixedOutput(
  api: Pick<IBiatecApi, 'quote'>,
  fromAsset: number,
  toAsset: number,
  target: number
): Promise<{ input: number; output: number } | null> {
  if (!(target > 0)) return null
  const reverse = await api.quote(toAsset, fromAsset, target)
  if (!(reverse > 0)) return null

  let input = Math.ceil(reverse * 1.003)
  let best: { input: number; output: number } | null = null
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const output = await api.quote(fromAsset, toAsset, input)
    if (output >= target) {
      if (!best || input < best.input) best = { input, output }
      if (output <= target * (1 + OVERSHOOT)) return best
    }
    // scale towards the target; when we are short add a little extra so the next try overshoots
    const factor = output > 0 ? target / output : 2
    const next = Math.ceil(input * factor * (output >= target ? 1 : 1.0005))
    if (next === input) break
    input = next
  }
  return best
}

export const createBiatecRouter = (api: IBiatecApi): ISwapRouter => ({
  kind: 'biatec',
  async fetchQuote({
    mode,
    fromAsset,
    toAsset,
    amount
  }: IFetchQuoteInput): Promise<ISwapQuote | null> {
    if (mode === 'FIXED_INPUT') {
      const output = await api.quote(fromAsset, toAsset, amount)
      if (!(output > 0)) return null
      return {
        router: 'biatec',
        mode,
        fromAsset,
        toAsset,
        amount,
        quoteAmount: output,
        raw: { swapAmount: amount, expectedOutput: output }
      }
    }
    const found = await quoteFixedOutput(api, fromAsset, toAsset, amount)
    if (!found) return null
    return {
      router: 'biatec',
      mode,
      fromAsset,
      toAsset,
      amount,
      quoteAmount: found.input,
      raw: { swapAmount: found.input, expectedOutput: amount }
    }
  },
  async prepareTransactions(quote: ISwapQuote, sender: string): Promise<string[]> {
    const raw = quote.raw as { swapAmount: number; expectedOutput: number }
    const txs = await api.routeTxs({
      sender,
      fromAsset: quote.fromAsset,
      toAsset: quote.toAsset,
      swapAmount: raw.swapAmount,
      // protects the user: the swap fails on chain if the price moved more than the slippage
      receiveMinimum: Math.floor((raw.expectedOutput * (10000 - SLIPPAGE_BPS)) / 10000)
    })
    if (!txs.length) throw new Error('Biatec router did not return any transactions')
    return txs
  }
})
