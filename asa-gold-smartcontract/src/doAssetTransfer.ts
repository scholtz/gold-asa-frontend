import algosdk, { Algodv2 } from 'algosdk'
interface IDoAssetTransferInput {
  from: algosdk.Account
  to: string
  assetIndex: number
  amount: number
  algod: Algodv2
}
const doAssetTransfer = async (input: IDoAssetTransferInput) => {
  const params = await input.algod.getTransactionParams().do()
  const signed = algosdk
    .makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: input.from.addr,
      to: input.to,
      amount: input.amount,
      assetIndex: input.assetIndex,
      suggestedParams: { ...params }
    })
    .signTxn(input.from.sk)
  return await input.algod.sendRawTransaction(signed).do()
}
export default doAssetTransfer
