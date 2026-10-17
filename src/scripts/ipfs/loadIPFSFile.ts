import axios from 'axios'
import safeGetItem from '@/scripts/common/safeGetItem'
import safeSetItem from '@/scripts/common/safeSetItem'
interface ICache {
  time: string
  data: any
}

const isMetadata = (data: unknown) => !!data && typeof data === 'object' && !Array.isArray(data)

// The BFF is the primary source. The public gateways are best-effort fallbacks
// (cloudflare-ipfs.com no longer exists; gateway.ipfs.io is an alias of ipfs.io).
const ipfsGateways = ['bff.asa.gold', 'ipfs.io', 'dweb.link']
const cacheDays = 30

const readCache = (cacheKey: string): ICache | null => {
  const cache = safeGetItem(cacheKey)
  if (!cache) return null
  try {
    const cacheObj = JSON.parse(cache) as ICache
    // ignore entries cached by older versions that are not metadata objects
    return isMetadata(cacheObj?.data) ? cacheObj : null
  } catch (e: any) {
    console.log(`Error deserializing ipfs data ${cacheKey}: ${e.message}`, e)
    return null
  }
}

const fetchFromGateway = async (gateway: string, hash: string) => {
  try {
    const response = await axios.get(`https://${gateway}/ipfs/${hash}`, { timeout: 8000 })
    // an HTML error page or other non-JSON body from a gateway is not metadata
    return isMetadata(response?.data) ? response.data : null
  } catch (e) {
    console.log(`Unable to fetch ${hash} from ${gateway}`, e)
    return null
  }
}

export const loadIPFSFile = async (hash: string) => {
  const cacheKey = `ipfs-${hash}`
  const cached = readCache(cacheKey)
  if (cached) {
    const compareTime = new Date()
    compareTime.setDate(compareTime.getDate() - cacheDays)
    if (new Date(cached.time) > compareTime) return cached.data
  }

  // try every gateway, some are often down; the primary one gets a second chance because a
  // transient failure there (e.g. a mobile network hiccup) would otherwise drop the coin
  const attempts = [ipfsGateways[0], ...ipfsGateways]
  for (const gateway of attempts) {
    const data = await fetchFromGateway(gateway, hash)
    if (data) {
      const cacheValue: ICache = { time: new Date().toISOString(), data }
      safeSetItem(cacheKey, JSON.stringify(cacheValue))
      return data
    }
  }

  // IPFS content is immutable, so an expired cache entry is still better than no data
  return cached?.data ?? null
}

export default loadIPFSFile
