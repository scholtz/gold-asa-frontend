import type { Transaction } from 'algosdk'
import { type TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'

const signer = async (txnGroup: Transaction[], indexesToSign: number[]): Promise<Uint8Array[]> => {
  console.log('tx to be signed', txnGroup, indexesToSign)
  return [new Uint8Array()]
}
interface IInput {
  addr: string
}
const getTransactionSignerAccount = (input: IInput) => {
  const sender = { addr: input.addr, signer } as TransactionSignerAccount
  return sender
}
export default getTransactionSignerAccount
