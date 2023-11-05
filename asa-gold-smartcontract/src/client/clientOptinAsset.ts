import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'

const clientOptinAsset = async (appClient: AsaGoldSmartcontractClient, assetIndex: number) => {
  // TODO .. fund account
  await appClient.optinAsset(
    { nftAsset: assetIndex },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      }
    }
  )
}
export default clientOptinAsset
