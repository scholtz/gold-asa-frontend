import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'
interface IClientChangePriceInput {
  appClient: AsaGoldSmartcontractClient
  nftAsset: number
  goldToken?: number | undefined
  goldTokenPrice?: number | undefined
  asa2?: number | undefined
  asa2Price?: number | undefined
  asa3?: number | undefined
  asa3Price?: number | undefined
  asa4?: number | undefined
  asa4Price?: number | undefined
  asa5?: number | undefined
  asa5Price?: number | undefined
}
const clientChangePrice = async (input: IClientChangePriceInput) => {
  const appRef = await input.appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT({ app: appRef.appId, nftAsset: input.nftAsset })
  await input.appClient.changeQuotation(
    {
      nftAsset: input.nftAsset,
      numbers: [
        input.goldTokenPrice ?? 0,
        input.goldToken ?? 0,
        input.asa2Price ?? 0,
        input.asa2 ?? 0,
        input.asa3Price ?? 0,
        input.asa3 ?? 0,
        input.asa4Price ?? 0,
        input.asa4 ?? 0,
        input.asa5Price ?? 0,
        input.asa5 ?? 0
      ]
    },
    {
      sendParams: {
        fee: algokit.microAlgos(1000)
      },
      boxes: [boxNFT],
      accounts: []
    }
  )
}
export default clientChangePrice
