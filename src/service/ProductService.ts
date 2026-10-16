import algosdk from 'algosdk2'

import type INFTDetail from '@/types/INFTDetail'

import { useAppStore } from '@/stores/app'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import type { ILoadResult } from '@/scripts/common/retryingLoad'
import type IEshopItem from '@/types/IEshopItem'

const CONCURRENCY = 5
const BOX_LIST_TIMEOUT_MS = 20_000
const ASSET_TIMEOUT_MS = 45_000

interface IInflight {
  key: string
  promise: Promise<ILoadResult<IEshopItem[]>>
}
let inflight: IInflight | undefined
// last successfully loaded details per app, used when a later attempt fails for a coin
let known: { key: string; details: Map<number, INFTDetail> } | undefined

// algod calls have no timeout; without it a hanging request would block the retry forever
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

const loadProducts = async (key: string): Promise<ILoadResult<IEshopItem[]>> => {
  const store = useAppStore()
  const client = getAlgodClient(store.state)
  const boxes = await withTimeout(
    client.getApplicationBoxes(store.state.appId).do(),
    BOX_LIST_TIMEOUT_MS
  )
  const assets: number[] = []
  for (const box of boxes.boxes) {
    try {
      assets.push(algosdk.decodeUint64(box.name.subarray(1), 'safe') as number)
    } catch (e: any) {
      // not an NFT box (e.g. added by a contract upgrade); it will not become one by retrying
      console.error(`Skipping box with unexpected name: ${e?.message ?? e}`)
    }
  }
  if (known?.key !== key) known = { key, details: new Map() }
  const loaded = known.details
  const details: INFTDetail[] = []
  let complete = true
  for (let i = 0; i < assets.length; i += CONCURRENCY) {
    const batch = assets.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map((asset) =>
        withTimeout(getARC0003Details({ assetId: asset, client }), ASSET_TIMEOUT_MS)
      )
    )
    for (const [index, result] of results.entries()) {
      const asset = batch[index]
      if (result.status === 'fulfilled') {
        if (result.value) {
          loaded.set(asset, result.value)
          details.push(result.value)
        }
        continue
      }
      complete = false
      console.error(`Unable to load asset ${asset}: ${result.reason?.message ?? result.reason}`)
      // keep showing what an earlier attempt loaded rather than dropping the coin
      const previous = loaded.get(asset)
      if (previous) details.push(previous)
    }
  }
  // nothing loaded although something failed: report a failure instead of an empty list
  if (!complete && !details.length) throw new Error('Unable to load any gold coin')
  return {
    data: details.map((d) => ({ asa: d.asa, nft: d.nft, state: d.state }) as IEshopItem),
    complete
  }
}

// every caller gets its own item and state objects, so one view changing an item's state cannot
// affect another (nft metadata is shared and treated as read-only)
const copy = (items: IEshopItem[]): IEshopItem[] =>
  items.map((item) => ({ ...item, state: { ...item.state } }))

export const ProductService = {
  /**
   * Loads the e-shop products. A single failing coin is skipped (or kept from an earlier attempt)
   * and `complete` is false so the caller can try again. Rejects when the box list cannot be
   * read or no coin could be loaded at all. Concurrent callers for the same app share one load.
   */
  async getProductsResult(): Promise<ILoadResult<IEshopItem[]>> {
    const store = useAppStore()
    const key = `${store.state.env}-${store.state.appId}-${store.state.algodHost}-${store.state.algodPort}`
    if (inflight?.key !== key) {
      const promise: Promise<ILoadResult<IEshopItem[]>> = loadProducts(key).finally(() => {
        if (inflight?.promise === promise) inflight = undefined
      })
      inflight = { key, promise }
    }
    const result = await inflight.promise
    return { data: copy(result.data), complete: result.complete }
  },

  filterSmall(items: IEshopItem[]) {
    return items
      .filter((asa) => (asa.state.state == 1 || asa.state.state == 3) && asa.state.quoteAsset1 > 0)
      .slice(0, 10)
  }
}
