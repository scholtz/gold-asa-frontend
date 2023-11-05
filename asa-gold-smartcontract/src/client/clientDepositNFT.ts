import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
import algosdk from 'algosdk'
interface clientBuyNftINput {
  appClient: AsaGoldSmartcontractClient
  ownerAddress: string
  sellerAddress: string
  nftAsset: number
  goldToken?: number | undefined
  goldTokenPrice?: number | undefined
  asa2?: number | undefined
  asa2Price?: number | undefined
  asa3?: number | undefined
  asa3Price?: number | undefined
  asa4?: number | undefined
  asa4Price?: number | undefined
  asa5?: number | undefined
  asa5Price?: number | undefined
  algod: algosdk.Algodv2
}
const clientDepositNFT = async (input: clientBuyNftINput) => {
  const { appClient, ownerAddress, sellerAddress, nftAsset } = input
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset })
  const params = await input.algod.getTransactionParams().do()
  const nftDepositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: ownerAddress,
    amount: 1,
    assetIndex: input.nftAsset,
    to: appRef.appAddress,
    suggestedParams: { ...params, fee: 1000 }
  })
  return await appClient.depositNft(
    {
      nftDepositTx: nftDepositTx,
      seller: sellerAddress,
      numbers: [
        input.goldTokenPrice ?? 0,
        input.goldToken ?? 0,
        input.asa2Price ?? 0,
        input.asa2 ?? 0,
        input.asa3Price ?? 0,
        input.asa3 ?? 0,
        input.asa4Price ?? 0,
        input.asa4 ?? 0,
        input.asa5Price ?? 0,
        input.asa5 ?? 0
      ]
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
export default clientDepositNFT
