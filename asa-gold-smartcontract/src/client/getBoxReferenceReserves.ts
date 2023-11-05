import algosdk from 'algosdk'

const getBoxReferenceReserves = (app: number | bigint, goldToken: number) => {
  var box: algosdk.BoxReference = {
    appIndex: Number(app),
    name: new Uint8Array(Buffer.concat([Buffer.from('r'), algosdk.bigIntToBytes(goldToken, 8)])) // data box
  }
  return box
}
export default getBoxReferenceReserves
