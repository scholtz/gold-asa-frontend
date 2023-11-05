import algosdk, { Algodv2 } from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

const createGoldToken = async (accountDeployGoldToken: algosdk.Account, algod: Algodv2) => {
  const params = await algod.getTransactionParams().do()
  const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: accountDeployGoldToken.addr,
    reserve: accountDeployGoldToken.addr,
    decimals: 6,
    defaultFrozen: false,
    total: 1_000_000_000_000_000,
    assetName: 'GOLD',
    assetURL: 'https://asa.gold/reserve/' + accountDeployGoldToken.addr,
    manager: accountDeployGoldToken.addr,
    unitName: 'GOLD',
    suggestedParams: params
  })

  const tx = await algod.sendRawTransaction(goldTokenTx.signTxn(accountDeployGoldToken.sk)).do()
  const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
  const goldToken = Number(tx2.assetIndex)
  return goldToken
}
export default createGoldToken
