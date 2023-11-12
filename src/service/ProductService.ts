import algosdk from 'algosdk'

import type INFTDetail from '@/types/INFTDetail'

interface IAsset2NFTDetail {
  [asa: number]: INFTDetail
}

import { useAppStore } from '@/stores/app'
import getAlgodClient from '@/scripts/algo/getAlgodClient'
import getARC0003Details from '@/scripts/algo/getARC0003Details'
import type IEshopItem from '@/types/IEshopItem'
export const ProductService = {
  async getProductsData() {
    const store = useAppStore()
    const client = getAlgodClient(store.state)
    const boxes = await client.getApplicationBoxes(store.state.appId).do()
    const assets = boxes.boxes.map((n) => algosdk.decodeUint64(n.name.subarray(1), 'safe'))
    const details: IAsset2NFTDetail = {}
    for (const asset of assets) {
      const detail = await getARC0003Details({ assetId: asset, client })
      if (detail) {
        details[asset] = detail
      }
    }
    console.log('details', details)
    return Object.values(details).map((d: INFTDetail) => {
      const ret: IEshopItem = {
        asa: d.asa,
        nft: d.nft,
        state: d.state
      }
      return ret
    })
  },

  async getAllProducts() {
    return Promise.resolve(await this.getProductsData())
  },
  async getProductsSmall() {
    return Promise.resolve(
      (await this.getProductsData())
        .filter(
          (asa) => (asa.state.state == 1 || asa.state.state == 3) && asa.state.quoteAsset1 > 0
        )
        .slice(0, 10)
    )
  }
}
