import type algosdk from 'algosdk'
interface ICache {
  time: Date
  asset: Record<string, any>
}
const getAsa = async (
  client: algosdk.Algodv2,
  assetId: number
): Promise<Record<string, any> | undefined> => {
  console.log('client', client)
  if (!client) return undefined
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
      compareTime.setDate(new Date().getDate() + 1)
      if (cacheObj.time > compareTime) {
        //console.log('cacheObj.asset', cacheObj.asset)
        return cacheObj.asset
      }
    } catch (e: any) {
      console.log(`Error deserializing asset ${assetId}: ${e.message}`, e)
    }
  }
  const asset = await client.getAssetByID(assetId).do()
  //console.log('asset', asset)
  if (asset.params) {
    const cacheValue: ICache = { time: new Date(), asset: asset }
    localStorage.setItem(cacheKey, JSON.stringify(cacheValue))
    return asset
  }
  return undefined
}
export default getAsa
