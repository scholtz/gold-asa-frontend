import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import clientBuyNFTTxs from '../txs/clientBuyNFTTxs'

interface clientBuyNftINput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  buyerAddr: string
  assetBuy: number
  buyPrice: number
  sellerAddress: string
  feeCollectorAddress: string
  nftAsset: number
  goldToken: number
}
const clientBuyNFT = async (input: clientBuyNftINput) => {
  const txs = await clientBuyNFTTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientBuyNFT
