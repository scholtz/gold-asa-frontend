import algosdk from 'algosdk2'

import type INFTDetail from '@/types/INFTDetail'

import { useAppStore } from '@/stores/app'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import type { ILoadResult } from '@/scripts/common/retryingLoad'
import type IEshopItem from '@/types/IEshopItem'

const CONCURRENCY = 5
const LOAD_TIMEOUT_MS = 60_000
let inflight: Promise<ILoadResult<IEshopItem[]>> | undefined

const loadProducts = async (): Promise<ILoadResult<IEshopItem[]>> => {
  const store = useAppStore()
  const client = getAlgodClient(store.state)
  const boxes = await client.getApplicationBoxes(store.state.appId).do()
  const assets = boxes.boxes.map((n) => algosdk.decodeUint64(n.name.subarray(1), 'safe'))
  const details: INFTDetail[] = []
  let complete = true
  for (let i = 0; i < assets.length; i += CONCURRENCY) {
    const results = await Promise.allSettled(
      assets.slice(i, i + CONCURRENCY).map((asset) => getARC0003Details({ assetId: asset, client }))
    )
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        complete = false
        console.error(
          `Unable to load asset ${assets[i + index]}: ${result.reason?.message ?? result.reason}`
        )
      } else if (result.value) {
        details.push(result.value)
      }
    }
  }
  // nothing loaded although something failed: report a failure instead of an empty list
  if (!complete && !details.length) throw new Error('Unable to load any gold coin')
  return {
    data: details.map((d) => ({ asa: d.asa, nft: d.nft, state: d.state }) as IEshopItem),
    complete
  }
}

// algod calls have no timeout; without it a hanging request would block the retry forever
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Loading timed out after ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

// every caller gets its own objects, so one view changing an item cannot affect another
const clone = (items: IEshopItem[]): IEshopItem[] => structuredClone(items)

export const ProductService = {
  /**
   * Loads the e-shop products. A single failing coin is skipped and `complete` is false so the
   * caller can try again. Rejects when the box list cannot be read, the load times out, or no coin
   * could be loaded at all. Concurrent callers share one load.
   */
  async getProductsResult(): Promise<ILoadResult<IEshopItem[]>> {
    if (!inflight) {
      inflight = withTimeout(loadProducts(), LOAD_TIMEOUT_MS).finally(() => {
        inflight = undefined
      })
    }
    const result = await inflight
    return { data: clone(result.data), complete: result.complete }
  },

  filterSmall(items: IEshopItem[]) {
    return items
      .filter((asa) => (asa.state.state == 1 || asa.state.state == 3) && asa.state.quoteAsset1 > 0)
      .slice(0, 10)
  }
}
