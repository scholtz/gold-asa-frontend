import algosdk from 'algosdk2'

import type INFTDetail from '@/types/INFTDetail'

import { useAppStore } from '@/stores/app'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import type { ILoadResult } from '@/scripts/common/retryingLoad'
import type IEshopItem from '@/types/IEshopItem'

const CONCURRENCY = 5
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
  return {
    data: details.map((d) => ({ asa: d.asa, nft: d.nft, state: d.state }) as IEshopItem),
    complete
  }
}

export const ProductService = {
  /**
   * Loads the e-shop products. Never rejects for a single failing coin: those are skipped and
   * `complete` is false so the caller can try again. Rejects when the box list itself cannot be
   * read. Concurrent callers share one load.
   */
  getProductsResult(): Promise<ILoadResult<IEshopItem[]>> {
    if (!inflight) {
      inflight = loadProducts().finally(() => {
        inflight = undefined
      })
    }
    return inflight
  },

  async getAllProducts() {
    return (await this.getProductsResult()).data
  },

  filterSmall(items: IEshopItem[]) {
    return items
      .filter((asa) => (asa.state.state == 1 || asa.state.state == 3) && asa.state.quoteAsset1 > 0)
      .slice(0, 10)
  },

  async getProductsSmall() {
    return this.filterSmall(await this.getAllProducts())
  }
}
