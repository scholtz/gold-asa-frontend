import type { RouterKind } from './types'

export const DEFAULT_ROUTER: RouterKind = 'biatec'

/** Biatec Router endpoints per Algorand network. */
export const DEFAULT_ROUTER_HOST = 'https://router.api.biatec.io'
export const TESTNET_ROUTER_HOST = 'https://testnet.router.api.biatec.io'

/** Networks Biatec Router serves; other networks (e.g. a local sandbox) always use Folks Router. */
export const biatecSupportsEnv = (env: string): boolean =>
  env === 'mainnet-v1.0' || env === 'testnet-v1.0'

export const effectiveRouterKind = (selected: RouterKind, env: string): RouterKind =>
  selected === 'biatec' && biatecSupportsEnv(env) ? 'biatec' : 'folks'

export const routerLabel = (kind: RouterKind) =>
  kind === 'biatec' ? 'Biatec Router' : 'Folks Router'
export const routerUrl = (kind: RouterKind) =>
  kind === 'biatec' ? 'https://biatec.io' : 'https://www.folksrouter.io'

/** Endpoint of the network's Biatec Router. */
export const defaultRouterHost = (env: string): string =>
  env === 'testnet-v1.0' ? TESTNET_ROUTER_HOST : DEFAULT_ROUTER_HOST

/**
 * The ARC-14 header is sent to this host, so only https (or localhost for development) is accepted.
 * An empty or invalid setting (and the former mainnet default that older versions stored) means "the
 * network's own router".
 */
export const safeRouterHost = (host: string | undefined, env = 'mainnet-v1.0'): string => {
  try {
    const url = new URL((host ?? '').trim())
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    const origin = url.origin
    if (origin === DEFAULT_ROUTER_HOST) return defaultRouterHost(env)
    if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) return origin
  } catch {
    // not a URL
  }
  return defaultRouterHost(env)
}
