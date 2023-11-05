import { AsaGoldSmartcontractClient } from '../contracts/clients/AsaGoldSmartcontractClient'
import { Algodv2 } from 'algosdk'
import { SendTransactionFrom } from '@algorandfoundation/algokit-utils/types/transaction'

const getClient = (
  appId: number | bigint,
  sender: SendTransactionFrom | undefined,
  algod: Algodv2
) => {
  return new AsaGoldSmartcontractClient(
    {
      sender: sender,
      resolveBy: 'id',
      id: appId
    },
    algod
  )
}
export default getClient
