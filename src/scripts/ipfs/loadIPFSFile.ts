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
const retryDelayMs = 500

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

/** Network errors (no response), rate limiting and server errors can succeed on a second try */
const isTransient = (e: any) => {
  const status = e?.response?.status
  return status === undefined || status === 429 || status >= 500
}

const fetchFromGateway = async (gateway: string, hash: string, retry: boolean): Promise<any> => {
  try {
    const response = await axios.get(`https://${gateway}/ipfs/${hash}`, { timeout: 8000 })
    // an HTML error page or other non-JSON body from a gateway is not metadata
    return isMetadata(response?.data) ? response.data : null
  } catch (e) {
    console.log(`Unable to fetch ${hash} from ${gateway}`, e)
    if (!retry || !isTransient(e)) return null
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    return fetchFromGateway(gateway, hash, false)
  }
}

const fetchAndCache = async (hash: string, cacheKey: string) => {
  // try every gateway, some are often down; only the primary one is retried, because a
  // transient failure there (e.g. a mobile network hiccup) would otherwise drop the coin
  for (let i = 0; i < ipfsGateways.length; i++) {
    const data = await fetchFromGateway(ipfsGateways[i], hash, i === 0)
    if (data) {
      const cacheValue: ICache = { time: new Date().toISOString(), data }
      safeSetItem(cacheKey, JSON.stringify(cacheValue))
      return data
    }
  }
  return null
}

const inFlight = new Map<string, Promise<any>>()

const refresh = (hash: string, cacheKey: string) => {
  let request = inFlight.get(hash)
  if (!request) {
    request = fetchAndCache(hash, cacheKey)
      .catch(() => null)
      .finally(() => inFlight.delete(hash))
    inFlight.set(hash, request)
  }
  return request
}

export const loadIPFSFile = async (hash: string) => {
  const cacheKey = `ipfs-${hash}`
  const cached = readCache(cacheKey)
  if (cached) {
    const compareTime = new Date()
    compareTime.setDate(compareTime.getDate() - cacheDays)
    // IPFS content is immutable, so an expired (or undated) entry is still correct. Return it
    // right away instead of making the coin wait for slow or failing gateways, and refresh
    // it in the background.
    if (!(new Date(cached.time) > compareTime)) void refresh(hash, cacheKey)
    return cached.data
  }
  return refresh(hash, cacheKey)
}

export default loadIPFSFile
