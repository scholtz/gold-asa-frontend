import algosdk from 'algosdk'

interface IGetBoxReferenceNFTInput {
  app: number | bigint
  nftAsset: number
}
import { Buffer } from 'buffer'
const getBoxReferenceNFT = (input: IGetBoxReferenceNFTInput) => {
  var box: algosdk.BoxReference = {
    appIndex: Number(input.app),
    name: new Uint8Array(
      Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(input.nftAsset, 8)])
    ) // data box
  }
  return box
}
export default getBoxReferenceNFT
