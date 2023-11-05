import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
interface clientBuyNftINput {
  appClient: AsaGoldSmartcontractClient
  ownerAddress: string
  nftAsset: number
}
const clientWithdrawNFT = async (data: clientBuyNftINput) => {
  const { appClient, ownerAddress, nftAsset } = data
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset })

  return await appClient.withdrawNft(
    {
      nftAsset: nftAsset
    },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      },
      assets: [nftAsset],
      accounts: [ownerAddress],
      boxes: [boxNFT]
    }
  )
}
export default clientWithdrawNFT
