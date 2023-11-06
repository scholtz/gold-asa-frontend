import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import algosdk from 'algosdk'
import clientWithdrawNFTTxs from '../txs/clientWithdrawNFTTxs'
interface clientBuyNftINput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  ownerAddress: string
  nftAsset: number
}
const clientWithdrawNFT = async (input: clientBuyNftINput) => {
  const txs = await clientWithdrawNFTTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientWithdrawNFT
