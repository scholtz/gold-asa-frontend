import axios from 'axios'
import safeGetItem from '@/scripts/common/safeGetItem'
import safeSetItem from '@/scripts/common/safeSetItem'
interface ICache {
  data: any
}

/**
 * ARC-3 metadata is a JSON object with a name and/or properties. Anything else (an HTML page,
 * a JSON error body such as {"error":"..."}) must never be returned or cached, because cached
 * entries do not expire.
 */
const isMetadata = (data: unknown): boolean => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const { name, properties } = data as Record<string, unknown>
  return typeof name === 'string' || (!!properties && typeof properties === 'object')
}

// The BFF is the primary source. The public gateways are best-effort fallbacks
// (cloudflare-ipfs.com no longer exists; gateway.ipfs.io is an alias of ipfs.io).
const primaryGateway = 'bff.asa.gold'
const ipfsGateways = [primaryGateway, 'ipfs.io', 'dweb.link']
const requestTimeoutMs = 5000
const retryDelayMs = 500

class BadBodyError extends Error {}

/**
 * IPFS content is addressed by its hash and therefore immutable, so a cached entry never
 * expires. Entries cached by older versions that are not metadata objects are ignored.
 */
const readCache = (cacheKey: string): any | null => {
  const cache = safeGetItem(cacheKey)
  if (!cache) return null
  try {
    const cacheObj = JSON.parse(cache) as ICache
    return isMetadata(cacheObj?.data) ? cacheObj.data : null
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
      const cacheValue: ICache = { data }
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
  if (cached) return cached

  let request = inFlight.get(hash)
  if (!request) {
    request = fetchAndCache(hash, cacheKey).finally(() => inFlight.delete(hash))
    inFlight.set(hash, request)
  }
  // every caller gets its own copy, like a cache hit does
  const data = await request
  return data ? JSON.parse(JSON.stringify(data)) : null
}

export default loadIPFSFile
