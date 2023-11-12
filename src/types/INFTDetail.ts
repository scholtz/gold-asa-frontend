import type { AsaData } from './ASAData'
import type INFT from './INFT'

export default interface INFTDetail {
  asa: number
  ipfsUrl: string
  nft: INFT
  state: AsaData
}
