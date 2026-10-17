import { beforeEach, describe, expect, it, vi } from 'vitest'
import algosdk from 'algosdk2'

const state = { env: 'testnet-v1.0', appId: 1, algodHost: 'h', algodPort: 1, algodToken: '' }
const getApplicationBoxes = vi.fn()
const getARC0003Details = vi.fn()

vi.mock('@/stores/app', () => ({ useAppStore: () => ({ state }) }))
vi.mock('@/scripts/algo/getAlgodClient', () => ({
  default: () => ({ getApplicationBoxes })
}))
vi.mock('@/scripts/algo/getARC0003Details', () => ({ default: (i: any) => getARC0003Details(i) }))

import { ProductService } from '../ProductService'

const boxesOf = (...assets: number[]) => ({
  do: async () => ({
    boxes: assets.map((a) => ({
      name: new Uint8Array([0, ...algosdk.encodeUint64(a)])
    }))
  })
})
const detail = (asa: number) => ({ asa, nft: { id: asa }, state: { state: 1, quoteAsset1: 1 } })

describe('ProductService.getProductsResult', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getApplicationBoxes.mockReset()
    getARC0003Details.mockReset()
    state.appId++ // each test gets its own cache key
  })

  it('returns complete data when every coin loads, skipping non-coins', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10, 11, 12))
    getARC0003Details.mockImplementation(async ({ assetId }) =>
      assetId === 11 ? null : detail(assetId)
    )
    const r = await ProductService.getProductsResult()
    expect(r.complete).toBe(true)
    expect(r.data.map((d) => d.asa)).toEqual([10, 12])
  })

  it('returns partial data marked incomplete when one coin fails', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10, 11))
    getARC0003Details.mockImplementation(async ({ assetId }) => {
      if (assetId === 11) throw new Error('ipfs down')
      return detail(assetId)
    })
    const r = await ProductService.getProductsResult()
    expect(r.complete).toBe(false)
    expect(r.data.map((d) => d.asa)).toEqual([10])
  })

  it('rejects when every coin fails', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10, 11))
    getARC0003Details.mockRejectedValue(new Error('ipfs down'))
    await expect(ProductService.getProductsResult()).rejects.toThrow()
  })

  it('rejects when the box list cannot be read', async () => {
    getApplicationBoxes.mockReturnValue({ do: async () => Promise.reject(new Error('algod')) })
    await expect(ProductService.getProductsResult()).rejects.toThrow('algod')
  })

  it('keeps a coin from an earlier attempt when a later attempt fails for it', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10, 11))
    getARC0003Details.mockImplementation(async ({ assetId }) => detail(assetId))
    await ProductService.getProductsResult()
    getARC0003Details.mockImplementation(async ({ assetId }) => {
      if (assetId === 11) throw new Error('algod')
      return detail(assetId)
    })
    const r = await ProductService.getProductsResult()
    expect(r.complete).toBe(false)
    expect(r.data.map((d) => d.asa)).toEqual([10, 11])
  })

  it('shares one load between concurrent callers but gives each its own objects', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10))
    getARC0003Details.mockImplementation(async ({ assetId }) => detail(assetId))
    const [a, b] = await Promise.all([
      ProductService.getProductsResult(),
      ProductService.getProductsResult()
    ])
    expect(getApplicationBoxes).toHaveBeenCalledTimes(1)
    expect(a.data[0]).not.toBe(b.data[0])
    expect(a.data[0].state).not.toBe(b.data[0].state)
  })

  it('does not share a load across different apps', async () => {
    getApplicationBoxes.mockReturnValue(boxesOf(10))
    getARC0003Details.mockImplementation(async ({ assetId }) => detail(assetId))
    const first = ProductService.getProductsResult()
    state.appId++
    const second = ProductService.getProductsResult()
    await Promise.all([first, second])
    expect(getApplicationBoxes).toHaveBeenCalledTimes(2)
  })
})
