import algosdk, { Algodv2 } from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'
interface ICreateGoldTokenInput {
  accountDeployGoldToken: algosdk.Account
  algod: Algodv2
}
const createGoldToken = async (input: ICreateGoldTokenInput) => {
  const params = await input.algod.getTransactionParams().do()
  const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: input.accountDeployGoldToken.addr,
    reserve: input.accountDeployGoldToken.addr,
    decimals: 6,
    defaultFrozen: false,
    total: 1_000_000_000_000_000,
    assetName: 'GOLD',
    assetURL: 'https://asa.gold/reserve/' + input.accountDeployGoldToken.addr,
    manager: input.accountDeployGoldToken.addr,
    unitName: 'GOLD',
    suggestedParams: params
  })

  const tx = await input.algod
    .sendRawTransaction(goldTokenTx.signTxn(input.accountDeployGoldToken.sk))
    .do()
  const tx2 = await algokit.waitForConfirmation(tx.txId, 3, input.algod)
  const goldToken = Number(tx2.assetIndex)
  return goldToken
}
export default createGoldToken
