import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import clientChangeQuotationTxs from '../txs/clientChangeQuotationTxs'
import algosdk from 'algosdk'
interface IClientChangePriceInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
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
const clientChangeQuotation = async (input: IClientChangePriceInput) => {
  const txs = await clientChangeQuotationTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientChangeQuotation
