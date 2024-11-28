import { Buffer } from 'buffer'

interface IInput {
  index: number
  boxName: Uint8Array
}
const removeBoxCache = (input: IInput): boolean => {
  const { index, boxName } = input
  const cacheKey = `box-${index}-${Buffer.from(boxName).toString('hex')}`
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      localStorage.removeItem(cacheKey)
      return true
    } catch (e: any) {
      console.log(`Error deserializing ${cacheKey}: ${e.message}`, e)
    }
  }

  return false
}
export default removeBoxCache
