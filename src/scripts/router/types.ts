export type RouterKind = 'biatec' | 'folks'

export type SwapMode = 'FIXED_INPUT' | 'FIXED_OUTPUT'

/**
 * Router independent swap quote.
 *
 * `quoteAmount` is always the amount of the asset on the side that is *not* fixed:
 * - FIXED_INPUT: `amount` of `fromAsset` is sold, `quoteAmount` of `toAsset` is received
 * - FIXED_OUTPUT: `amount` of `toAsset` is bought, `quoteAmount` of `fromAsset` has to be paid
 * All amounts are in base units.
 */
export interface ISwapQuote {
  router: RouterKind
  mode: SwapMode
  fromAsset: number
  toAsset: number
  amount: number
  quoteAmount: number
  /** router specific payload needed to build the transactions */
  raw?: unknown
}

export interface IFetchQuoteInput {
  mode: SwapMode
  fromAsset: number
  toAsset: number
  /** amount of the fixed side in base units */
  amount: number
}

export interface ISwapRouter {
  readonly kind: RouterKind
  fetchQuote(input: IFetchQuoteInput): Promise<ISwapQuote | null>
  /** Unsigned transactions (base64 msgpack) that execute the quote */
  prepareTransactions(quote: ISwapQuote, sender: string): Promise<string[]>
}

/** Slippage used when executing, in basis points (10 = 0.1%). */
export const SLIPPAGE_BPS = 10
