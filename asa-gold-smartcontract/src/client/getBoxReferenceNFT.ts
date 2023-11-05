import algosdk from 'algosdk'

const getBoxReferenceNFT = (app: number | bigint, nftAsset: number) => {
  var box: algosdk.BoxReference = {
    appIndex: Number(app),
    name: new Uint8Array(Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(nftAsset, 8)])) // data box
  }
  return box
}
export default getBoxReferenceNFT
