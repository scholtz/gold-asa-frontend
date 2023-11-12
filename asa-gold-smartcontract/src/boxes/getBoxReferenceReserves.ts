import algosdk from 'algosdk'
interface IGetBoxReferenceReservesInput {
  app: number | bigint
  goldToken: number
}
import { Buffer } from 'buffer'
const getBoxReferenceReserves = (input: IGetBoxReferenceReservesInput) => {
  var box: algosdk.BoxReference = {
    appIndex: Number(input.app),
    name: new Uint8Array(
      Buffer.concat([Buffer.from('r'), algosdk.bigIntToBytes(input.goldToken, 8)])
    ) // data box
  }
  return box
}
export default getBoxReferenceReserves
