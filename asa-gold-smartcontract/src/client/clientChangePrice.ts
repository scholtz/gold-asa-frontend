import { AsaGoldSmartcontractClient } from '../../contracts/clients/AsaGoldSmartcontractClient'
import * as algokit from '@algorandfoundation/algokit-utils'
import getBoxReferenceNFT from './getBoxReferenceNFT'

const clientChangePrice = async (
  appClient: AsaGoldSmartcontractClient,
  nftAsset: number,
  goldToken: number,
  goldTokenPrice: number,
  asa2: number = 0,
  asa2Price: number = 0,
  asa3: number = 0,
  asa3Price: number = 0,
  asa4: number = 0,
  asa4Price: number = 0,
  asa5: number = 0,
  asa5Price: number = 0
) => {
  const appRef = await appClient.appClient.getAppReference()
  var boxNFT = getBoxReferenceNFT(appRef.appId, nftAsset)
  await appClient.changeQuotation(
    {
      nftAsset: nftAsset,
      numbers: [
        goldTokenPrice,
        goldToken,
        asa2Price,
        asa2,
        asa3Price,
        asa3,
        asa4Price,
        asa4,
        asa5Price,
        asa5
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
