import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import algosdk from 'algosdk'
import clientSetParcelDeliveryTxs from '../txs/clientSetParcelDeliveryTxs'
interface IClientChangePriceInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
}
const clientSetParcelDelivery = async (input: IClientChangePriceInput) => {
  const txs = await clientSetParcelDeliveryTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientSetParcelDelivery
