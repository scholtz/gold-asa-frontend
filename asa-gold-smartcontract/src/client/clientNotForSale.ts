import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import clientNotForSaleTxs from '../txs/clientNotForSaleTxs'
interface IClientChangePriceInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
}
const clientNotForSale = async (input: IClientChangePriceInput) => {
  const txs = await clientNotForSaleTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientNotForSale
