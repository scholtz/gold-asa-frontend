import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
interface IClientOptinAssetInput {
  appClient: AsaGoldSmartcontractClient
  assetIndex: number
}
const clientOptinAsset = async (input: IClientOptinAssetInput) => {
  // TODO .. fund account
  return await input.appClient.optinAsset(
    { nftAsset: input.assetIndex },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      }
    }
  )
}
export default clientOptinAsset
