import type algosdk from 'algosdk'
import { Buffer } from 'buffer'

interface ICache {
  time: string
  data: algosdk.modelsv2.Box
}
interface IInput {
  client: algosdk.Algodv2
  index: number
  boxName: Uint8Array
}
const getBoxFromCache = async (input: IInput): Promise<algosdk.modelsv2.Box> => {
  const { client, index, boxName } = input
  const cacheKey = `box-${index}-${Buffer.from(boxName).toString('hex')}`
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      const cacheObj = JSON.parse(cache) as ICache
      const compareTime = new Date()
      const cacheTime = new Date(cacheObj.time)
      compareTime.setDate(new Date().getDate() - 1)
      if (cacheTime > compareTime) {
        cacheObj.data.name = new Uint8Array(Buffer.from(Object.values(cacheObj.data.name)))
        cacheObj.data.value = new Uint8Array(Buffer.from(Object.values(cacheObj.data.value)))

        return cacheObj.data
      }
    } catch (e: any) {
      console.log(`Error deserializing ${cacheKey}: ${e.message}`, e)
    }
  }
  const box = await client.getApplicationBoxByName(index, boxName).do()

  const cacheValue: ICache = { time: new Date().toISOString(), data: box }
  localStorage.setItem(cacheKey, JSON.stringify(cacheValue))
  return box
}
export default getBoxFromCache
