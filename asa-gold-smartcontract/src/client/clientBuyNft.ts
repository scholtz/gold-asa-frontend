import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
import getBoxReferenceReserves from './getBoxReferenceReserves'
interface clientBuyNftINput {
  appClient: AsaGoldSmartcontractClient
  buyerAddr: string
  assetBuy: number
  buyPrice: number
  sellerAddress: string
  feeCollectorAddress: string
  nftAsset: number
  goldToken: number
  algod: algosdk.Algodv2
}
const clientBuyNft = async (data: clientBuyNftINput) => {
  const {
    appClient,
    buyerAddr,
    assetBuy,
    buyPrice,
    sellerAddress,
    feeCollectorAddress,
    nftAsset,
    goldToken,
    algod
  } = data

  const params = await algod.getTransactionParams().do()
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT(appRef.appId, nftAsset)
  var boxReserves = getBoxReferenceReserves(appRef.appId, goldToken)

  const purchaseAssetDepositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: buyerAddr,
    amount: buyPrice,
    assetIndex: assetBuy,
    to: appRef.appAddress,
    suggestedParams: { ...params, fee: 1000 }
  })
  const buyNFT = await appClient.buyNft(
    {
      purchaseAssetDepositTx: purchaseAssetDepositTx,
      nftAsset: nftAsset
    },
    {
      sendParams: {
        fee: algokit.microAlgos(3000)
      },
      boxes: [boxNFT, boxReserves],
      assets: [nftAsset, assetBuy],
      accounts: [appRef.appAddress, feeCollectorAddress, sellerAddress]
    }
  )
}
export default clientBuyNft
