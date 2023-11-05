import { AsaGoldSmartcontractClient } from '../contracts/clients/AsaGoldSmartcontractClient'
import { Algodv2 } from 'algosdk'
import { SendTransactionFrom } from '@algorandfoundation/algokit-utils/types/transaction'

interface IGetClientInput {
  appId: number | bigint
  sender: SendTransactionFrom | undefined
  algod: Algodv2
}

const getClient = (input: IGetClientInput) => {
  return new AsaGoldSmartcontractClient(
    {
      sender: input.sender,
      resolveBy: 'id',
      id: input.appId
    },
    input.algod
  )
}
export default getClient
