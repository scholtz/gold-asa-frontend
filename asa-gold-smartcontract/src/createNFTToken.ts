import algosdk, { Algodv2 } from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'
import { Buffer } from 'buffer'
interface ICreateNFTTokenInput {
  account: algosdk.Account
  algod: Algodv2
  integrity: Buffer
  ipfs: string
}

const createNFTToken = async (input: ICreateNFTTokenInput) => {
  const params = await input.algod.getTransactionParams().do()
  const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: input.account.addr,
    reserve: input.account.addr,
    decimals: 0,
    defaultFrozen: false,
    total: 1,
    assetName: 'GoldCoin',
    assetURL: `ipfs://${input.ipfs}#arc3`,
    assetMetadataHash: new Uint8Array(input.integrity),
    manager: input.account.addr,
    unitName: 'GoldCoin',
    suggestedParams: params
  })

  const tx = await input.algod.sendRawTransaction(goldTokenTx.signTxn(input.account.sk)).do()
  const tx2 = await algokit.waitForConfirmation(tx.txId, 3, input.algod)
  const goldToken = Number(tx2.assetIndex)
  return goldToken
}
export default createNFTToken
