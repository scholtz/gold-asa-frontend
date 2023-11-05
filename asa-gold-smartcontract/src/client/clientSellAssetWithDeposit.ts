import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
import getBoxReferenceReserves from './getBoxReferenceReserves'
interface IClientSellAssetWithDepositInput {
  appClient: AsaGoldSmartcontractClient
  nftOwnerAddress: string
  vaultOwnerAddress: string
  goldTokenAssetReserveAccount: string
  nftAsset: number
  goldToken: number
  algod: algosdk.Algodv2
}
const clientSellAssetWithDeposit = async (input: IClientSellAssetWithDepositInput) => {
  const params = await input.algod.getTransactionParams().do()
  const appRef = await input.appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset: input.nftAsset })
  var boxReserves = getBoxReferenceReserves({ app: appRef.appId, goldToken: input.goldToken })
  const depositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: input.nftOwnerAddress,
    amount: 1,
    assetIndex: input.nftAsset,
    to: appRef.appAddress,
    suggestedParams: { ...params, fee: 1000 }
  })
  await input.appClient.sellAssetWithDeposit(
    {
      nftDepositTx: depositTx,
      nftAsset: input.nftAsset,
      price: 101000,
      tokenAsset: input.goldToken,
      vaultOwnerAddress: input.vaultOwnerAddress,
      weight: 100000
    },
    {
      sendParams: {
        fee: algokit.microAlgos(2000)
      },
      boxes: [boxNFT, boxReserves],
      accounts: [input.goldTokenAssetReserveAccount]
    }
  )
}
export default clientSellAssetWithDeposit
