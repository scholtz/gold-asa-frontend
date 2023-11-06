import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from '../boxes/getBoxReferenceNFT'
interface IClientChangePriceInput {
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
}
const clientSetParcelDeliveryTxs = async (input: IClientChangePriceInput) => {
  const appRef = await input.appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset: input.nftAsset })
  var compose = input.appClient.compose().setParcelDelivery(
    {
      nftAsset: input.nftAsset
    },
    {
      sendParams: {
        fee: algokit.microAlgos(1000)
      },
      boxes: [boxNFT],
      accounts: []
    }
  )
  const atc = await compose.atc()
  return atc.buildGroup().map((tx) => tx.txn)
}
export default clientSetParcelDeliveryTxs
