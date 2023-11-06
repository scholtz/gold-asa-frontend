import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import algosdk from 'algosdk'
import clientDepositNFTTxs from '../txs/clientDepositNFTTxs'
interface clientBuyNftINput {
  algod: algosdk.Algodv2
  account: algosdk.Account
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
}
const clientDepositNFT = async (input: clientBuyNftINput) => {
  const txs = await clientDepositNFTTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientDepositNFT
