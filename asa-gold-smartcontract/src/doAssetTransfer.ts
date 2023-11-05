import algosdk, { Algodv2 } from 'algosdk'

const doAssetTransfer = async (
  from: algosdk.Account,
  to: string,
  assetIndex: number,
  amount: number,
  algod: Algodv2
) => {
  const params = await algod.getTransactionParams().do()
  const signed = algosdk
    .makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: from.addr,
      to: to,
      amount: amount,
      assetIndex: assetIndex,
      suggestedParams: { ...params }
    })
    .signTxn(from.sk)
  return await algod.sendRawTransaction(signed).do()
}
export default doAssetTransfer
