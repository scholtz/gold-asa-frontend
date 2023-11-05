import algosdk, { Algodv2 } from 'algosdk'
import doAssetTransfer from './doAssetTransfer'

const optInToAsset = (account: algosdk.Account, assetIndex: number, algod: Algodv2) => {
  return doAssetTransfer(account, account.addr, assetIndex, 0, algod)
}
export default optInToAsset
