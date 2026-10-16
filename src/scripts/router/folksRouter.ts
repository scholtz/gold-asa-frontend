import { FolksRouterClient, Network, SwapMode as FolksSwapMode } from '@folks-router/js-sdk'
import type { SwapQuote } from '@folks-router/js-sdk'
import type { IFetchQuoteInput, ISwapQuote, ISwapRouter } from './types'
import { SLIPPAGE_BPS } from './types'

const FEE_BPS = 10
const REFERRER = 'AWALLETCPHQPJGCZ6AHLIFPHWBHUEHQ7VBYJVVGQRRY4MEIGWUBKCQYP4Y'
const MAX_GROUP_SIZE = 15

const cache = new Map<string, ISwapRouter>()

export const createFolksRouter = (env: string): ISwapRouter => {
  const cached = cache.get(env)
  if (cached) return cached
  const router = buildFolksRouter(env)
  cache.set(env, router)
  return router
}

const buildFolksRouter = (env: string): ISwapRouter => {
  const network =
    env === 'mainnet-v1.0' ? Network.MAINNET : env === 'testnet-v1.0' ? Network.TESTNET : null
  const client = network === null ? null : new FolksRouterClient(network)

  return {
    kind: 'folks',
    async fetchQuote(input: IFetchQuoteInput): Promise<ISwapQuote | null> {
      if (!client) return null
      const mode =
        input.mode === 'FIXED_INPUT' ? FolksSwapMode.FIXED_INPUT : FolksSwapMode.FIXED_OUTPUT
      const quote = await client.fetchSwapQuote(
        input.fromAsset,
        input.toAsset,
        BigInt(input.amount),
        mode,
        MAX_GROUP_SIZE,
        FEE_BPS,
        REFERRER
      )
      if (!quote) return null
      return {
        router: 'folks',
        mode: input.mode,
        fromAsset: input.fromAsset,
        toAsset: input.toAsset,
        amount: input.amount,
        quoteAmount: Number(quote.quoteAmount),
        raw: quote
      }
    },
    async prepareTransactions(quote: ISwapQuote, sender: string): Promise<string[]> {
      if (!client) throw new Error('Folks router is not available on this network')
      const txns = await client.prepareSwapTransactions(
        sender,
        SLIPPAGE_BPS,
        quote.raw as SwapQuote
      )
      if (!txns?.length) throw new Error('Did not receive any txs from folks router')
      return txns
    }
  }
}
