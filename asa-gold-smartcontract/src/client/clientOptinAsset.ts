import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import clientOptinAssetTxs from '../txs/clientOptinAssetTxs'
interface IClientOptinAssetInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  assetIndex: number
}
const clientOptinAsset = async (input: IClientOptinAssetInput) => {
  const txs = await clientOptinAssetTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientOptinAsset
