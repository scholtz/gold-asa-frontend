import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from '../boxes/getBoxReferenceNFT'
interface clientBuyNftINput {
  appClient: AsaGoldSmartcontractClient
  ownerAddress: string
  nftAsset: number
}
const clientWithdrawNFTTxs = async (input: clientBuyNftINput) => {
  const { appClient, ownerAddress, nftAsset } = input
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset })

  var compose = appClient.compose().withdrawNft(
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
  const atc = await compose.atc()
  return atc.buildGroup().map((tx) => tx.txn)
}
export default clientWithdrawNFTTxs
