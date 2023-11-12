interface ICache {
  time: string
  asset: Record<string, any>
}
interface IInput {
  assetId: number
}
const getAsaFromCache = (input: IInput): Record<string, any> | undefined => {
  const { assetId } = input
  if (assetId == 0) {
    // algo
    return {
      index: 0,
      params: {
        name: 'Algo',
        decimals: 6,
        total: 10_000_000_000_000_000,
        'unit-name': 'Algo',
        'default-frozen': false
      }
    }
  }
  const cacheKey = `asset-${assetId}`
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      const cacheObj = JSON.parse(cache) as ICache
      const compareTime = new Date()
      const cacheTime = new Date(cacheObj.time)
      compareTime.setDate(new Date().getDate() - 1)
      if (cacheTime > compareTime) {
        //console.log('cacheObj.asset', cacheObj.asset)
        return cacheObj.asset
      }
    } catch (e: any) {
      console.log(`Error deserializing asset ${assetId}: ${e.message}`, e)
    }
  }
  return undefined
}
export default getAsaFromCache
