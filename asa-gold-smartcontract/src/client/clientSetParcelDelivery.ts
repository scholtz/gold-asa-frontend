import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
interface IClientChangePriceInput {
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
}
const clientSetParcelDelivery = async (input: IClientChangePriceInput) => {
  const appRef = await input.appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset: input.nftAsset })
  await input.appClient.setParcelDelivery(
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
}
export default clientSetParcelDelivery
