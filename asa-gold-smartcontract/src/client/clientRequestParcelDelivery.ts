import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import algosdk from 'algosdk'
import clientRequestParcelDeliveryTxs from '../txs/clientRequestParcelDeliveryTxs'
interface IClientChangePriceInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
}
const clientRequestParcelDelivery = async (input: IClientChangePriceInput) => {
  const txs = await clientRequestParcelDeliveryTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientRequestParcelDelivery
