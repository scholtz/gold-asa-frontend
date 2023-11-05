import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
import getBoxReferenceReserves from './getBoxReferenceReserves'

const clientSellAssetWithDeposit = async (
  appClient: AsaGoldSmartcontractClient,
  nftOwnerAddress: string,
  vaultOwnerAddress: string,
  goldTokenAssetReserveAccount: string,
  nftAsset: number,
  goldToken: number,
  algod: algosdk.Algodv2
) => {
  const params = await algod.getTransactionParams().do()
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT(appRef.appId, nftAsset)
  var boxReserves = getBoxReferenceReserves(appRef.appId, goldToken)
  const depositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: nftOwnerAddress,
    amount: 1,
    assetIndex: nftAsset,
    to: appRef.appAddress,
    suggestedParams: { ...params, fee: 1000 }
  })
  await appClient.sellAssetWithDeposit(
    {
      nftDepositTx: depositTx,
      nftAsset: nftAsset,
      price: 101000,
      tokenAsset: goldToken,
      vaultOwnerAddress: vaultOwnerAddress,
      weight: 100000
    },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      },
      boxes: [boxNFT, boxReserves],
      accounts: [goldTokenAssetReserveAccount]
    }
  )
}
export default clientSellAssetWithDeposit
