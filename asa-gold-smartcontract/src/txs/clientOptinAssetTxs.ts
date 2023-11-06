import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
interface IClientOptinAssetInput {
  appClient: AsaGoldSmartcontractClient
  assetIndex: number
}
const clientOptinAssetTxs = async (input: IClientOptinAssetInput) => {
  // TODO .. fund account
  var compose = input.appClient.compose().optinAsset(
    { nftAsset: input.assetIndex },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      }
    }
  )
  const atc = await compose.atc()
  return atc.buildGroup().map((tx) => tx.txn)
}
export default clientOptinAssetTxs
