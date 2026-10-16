import { describe, expect, it, vi } from 'vitest'
import { createBiatecRouter, quoteFixedOutput } from '../biatecRouter'
import type { IBiatecApi } from '../biatecRouter'
import { DEFAULT_ROUTER, effectiveRouterKind } from '../routerKinds'

/** constant product pool: sells `from` for `to` with a 0.3% fee */
const pool = (reserveFrom: number, reserveTo: number) =>
  vi.fn(async (_from: number, _to: number, amount: number) =>
    Math.floor((reserveTo * amount * 0.997) / (reserveFrom + amount * 0.997))
  )

describe('effectiveRouterKind', () => {
  it('defaults to biatec', () => {
    expect(DEFAULT_ROUTER).toBe('biatec')
  })
  it('uses biatec only on mainnet', () => {
    expect(effectiveRouterKind('biatec', 'mainnet-v1.0')).toBe('biatec')
    expect(effectiveRouterKind('biatec', 'testnet-v1.0')).toBe('folks')
    expect(effectiveRouterKind('biatec', 'sandnet-v1')).toBe('folks')
  })
  it('respects an explicit folks choice', () => {
    expect(effectiveRouterKind('folks', 'mainnet-v1.0')).toBe('folks')
  })
})

describe('quoteFixedOutput', () => {
  it('finds an input that yields at least the target within the overshoot', async () => {
    const quote = pool(5_000_000_000, 1_000_000_000)
    const target = 20_000_000
    const result = await quoteFixedOutput({ quote }, 1, 2, target)
    expect(result).not.toBeNull()
    expect(result!.output).toBeGreaterThanOrEqual(target)
    expect(result!.output).toBeLessThanOrEqual(target * 1.002)
    // consistent with the pool: paying result.input gives result.output
    expect(await quote(1, 2, result!.input)).toBe(result!.output)
  })

  it('returns null without liquidity', async () => {
    expect(await quoteFixedOutput({ quote: async () => 0 }, 1, 2, 1000)).toBeNull()
  })

  it('returns null for a non positive target', async () => {
    expect(await quoteFixedOutput({ quote: async () => 5 }, 1, 2, 0)).toBeNull()
  })

  it('returns null when the pool is too shallow for the target', async () => {
    // selling back works, but buying never yields more than 500_000
    const quote = vi.fn(async (from: number, _to: number, amount: number) =>
      from === 1 ? Math.min(500_000, amount) : amount
    )
    expect(await quoteFixedOutput({ quote }, 1, 2, 1_000_000)).toBeNull()
  })
})

describe('createBiatecRouter', () => {
  const api = (): IBiatecApi & { routeTxs: ReturnType<typeof vi.fn> } => ({
    quote: pool(1_000_000_000, 1_000_000_000),
    routeTxs: vi.fn(async () => ['dHg='])
  })

  it('quotes fixed input directly', async () => {
    const router = createBiatecRouter(api())
    const quote = await router.fetchQuote({
      mode: 'FIXED_INPUT',
      fromAsset: 1,
      toAsset: 2,
      amount: 1_000_000
    })
    expect(quote?.router).toBe('biatec')
    expect(quote?.quoteAmount).toBeGreaterThan(0)
    expect(quote?.amount).toBe(1_000_000)
  })

  it('returns null when the router has no route', async () => {
    const router = createBiatecRouter({ quote: async () => 0, routeTxs: async () => [] })
    expect(
      await router.fetchQuote({ mode: 'FIXED_INPUT', fromAsset: 1, toAsset: 2, amount: 10 })
    ).toBeNull()
    expect(
      await router.fetchQuote({ mode: 'FIXED_OUTPUT', fromAsset: 1, toAsset: 2, amount: 10 })
    ).toBeNull()
  })

  it('executes a fixed output quote with slippage protection', async () => {
    const mock = api()
    const router = createBiatecRouter(mock)
    const quote = await router.fetchQuote({
      mode: 'FIXED_OUTPUT',
      fromAsset: 1,
      toAsset: 2,
      amount: 1_000_000
    })
    expect(quote).not.toBeNull()
    const txs = await router.prepareTransactions(quote!, 'SENDER')
    expect(txs).toEqual(['dHg='])
    const call = mock.routeTxs.mock.calls[0][0]
    expect(call).toMatchObject({
      sender: 'SENDER',
      fromAsset: 1,
      toAsset: 2,
      swapAmount: quote!.quoteAmount
    })
    // at most 0.1% below the wanted amount
    expect(call.receiveMinimum).toBe(Math.floor(1_000_000 * 0.999))
  })

  it('throws when the router returns no transactions', async () => {
    const router = createBiatecRouter({ quote: async () => 10, routeTxs: async () => [] })
    const quote = await router.fetchQuote({
      mode: 'FIXED_INPUT',
      fromAsset: 1,
      toAsset: 2,
      amount: 10
    })
    await expect(router.prepareTransactions(quote!, 'S')).rejects.toThrow()
  })
})
