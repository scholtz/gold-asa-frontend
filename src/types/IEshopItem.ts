import type { AsaData } from './ASAData'
import type INFT from './INFT'

export default interface IEshopItem {
  asa: number
  nft: INFT
  state: AsaData
}
