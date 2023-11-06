import algosdk from 'algosdk'
import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import clientSellAssetWithDepositTxs from '../txs/clientSellAssetWithDepositTxs'
interface IClientSellAssetWithDepositInput {
  algod: algosdk.Algodv2
  account: algosdk.Account
  appClient: AsaGoldSmartcontractClient
  nftOwnerAddress: string
  vaultOwnerAddress: string
  goldTokenAssetReserveAccount: string
  nftAsset: number
  goldToken: number
}
const clientSellAssetWithDeposit = async (input: IClientSellAssetWithDepositInput) => {
  const txs = await clientSellAssetWithDepositTxs(input)
  return await input.algod.sendRawTransaction(txs.map((tx) => tx.signTxn(input.account.sk))).do()
}
export default clientSellAssetWithDeposit
