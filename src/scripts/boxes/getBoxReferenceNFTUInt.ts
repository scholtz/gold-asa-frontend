import algosdk from 'algosdk2'

interface IGetBoxReferenceNFTInput {
  nftAsset: number
}
import { Buffer } from 'buffer'
const getBoxReferenceNFTUInt = (input: IGetBoxReferenceNFTInput) => {
  return Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(input.nftAsset, 8)])
}
export default getBoxReferenceNFTUInt
