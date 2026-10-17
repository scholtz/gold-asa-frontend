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
const primaryGateway = 'bff.asa.gold'
const ipfsGateways = [primaryGateway, 'ipfs.io', 'dweb.link']
const requestTimeoutMs = 8000
const cacheDays = 30
const retryDelayMs = 500

class BadBodyError extends Error {}

/** Entries cached by older versions that are not metadata objects are ignored */
const readCache = (cacheKey: string): ICache | null => {
  const cache = safeGetItem(cacheKey)
  if (!cache) return null
  try {
    const cacheObj = JSON.parse(cache) as ICache
    return isMetadata(cacheObj?.data) ? cacheObj : null
  } catch (e: any) {
    console.log(`Error deserializing ipfs data ${cacheKey}: ${e.message}`)
    return null
  }
}

/**
 * A dropped connection, rate limiting, a server error or a garbage body can succeed on a
 * second try. Timeouts and 4xx cannot.
 */
const isTransient = (e: any) => {
  if (e instanceof BadBodyError) return true
  const status = e?.response?.status
  if (status !== undefined) return status === 429 || status >= 500
  return e?.code === 'ERR_NETWORK'
}

const fetchFromGateway = async (gateway: string, hash: string, retry: boolean): Promise<any> => {
  try {
    const response = await axios.get(`https://${gateway}/ipfs/${hash}`, {
      timeout: requestTimeoutMs
    })
    // an HTML error page or other non-JSON body from a gateway is not metadata
    if (!isMetadata(response?.data)) throw new BadBodyError('Response is not metadata')
    return response.data
  } catch (e: any) {
    console.log(`Unable to fetch ${hash} from ${gateway}: ${e?.message ?? e}`)
    if (!retry || !isTransient(e)) return null
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    return fetchFromGateway(gateway, hash, false)
  }
}

const fetchAndCache = async (hash: string, cacheKey: string) => {
  // try every gateway, some are often down; only the primary one is retried, because a
  // transient failure there (e.g. a mobile network hiccup) would otherwise drop the coin
  for (let i = 0; i < ipfsGateways.length; i++) {
    const data = await fetchFromGateway(ipfsGateways[i], hash, ipfsGateways[i] === primaryGateway)
    if (data) {
      const cacheValue: ICache = { time: new Date().toISOString(), data }
      safeSetItem(cacheKey, JSON.stringify(cacheValue))
      return data
    }
  }
  return null
}

const inFlight = new Map<string, Promise<any>>()

export const loadIPFSFile = async (hash: string) => {
  const cacheKey = `ipfs-${hash}`
  const cached = readCache(cacheKey)
  if (cached) {
    const compareTime = new Date()
    compareTime.setDate(compareTime.getDate() - cacheDays)
    if (new Date(cached.time) > compareTime) return cached.data
  }

  let request = inFlight.get(hash)
  if (!request) {
    request = fetchAndCache(hash, cacheKey).finally(() => inFlight.delete(hash))
    inFlight.set(hash, request)
  }
  // every caller gets its own copy, like a cache hit does
  const data = await request
  if (data) return JSON.parse(JSON.stringify(data))
  // IPFS content is immutable, so an expired entry is still better than losing the coin
  return cached?.data ?? null
}

export default loadIPFSFile
