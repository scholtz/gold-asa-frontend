import algosdk, { Algodv2 } from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

const createNFTToken = async (account: algosdk.Account, algod: Algodv2) => {
  const params = await algod.getTransactionParams().do()
  const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: account.addr,
    reserve: account.addr,
    decimals: 0,
    defaultFrozen: false,
    total: 1,
    assetName: 'GoldCoin',
    assetURL: 'https://asa.gold',
    manager: account.addr,
    unitName: 'GoldCoin',
    suggestedParams: params
  })

  const tx = await algod.sendRawTransaction(goldTokenTx.signTxn(account.sk)).do()
  const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
  const goldToken = Number(tx2.assetIndex)
  return goldToken
}
export default createNFTToken
