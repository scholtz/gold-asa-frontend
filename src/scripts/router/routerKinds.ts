import type { RouterKind } from './types'

export const DEFAULT_ROUTER: RouterKind = 'biatec'

/** Biatec Router endpoint per Algorand network. Networks that are not listed have no Biatec Router. */
const ROUTER_HOSTS: Record<string, string> = {
  'mainnet-v1.0': 'https://router.api.biatec.io',
  'testnet-v1.0': 'https://testnet.router.api.biatec.io'
}
export const DEFAULT_ROUTER_HOST = ROUTER_HOSTS['mainnet-v1.0']
export const TESTNET_ROUTER_HOST = ROUTER_HOSTS['testnet-v1.0']

/** Networks Biatec Router serves; other networks (e.g. a local sandbox) always use Folks Router. */
export const biatecSupportsEnv = (env: string): boolean =>
  Object.prototype.hasOwnProperty.call(ROUTER_HOSTS, env)

export const effectiveRouterKind = (selected: RouterKind, env: string): RouterKind =>
  selected === 'biatec' && biatecSupportsEnv(env) ? 'biatec' : 'folks'

export const routerLabel = (kind: RouterKind) =>
  kind === 'biatec' ? 'Biatec Router' : 'Folks Router'
export const routerUrl = (kind: RouterKind) =>
  kind === 'biatec' ? 'https://biatec.io' : 'https://www.folksrouter.io'

/** Endpoint of the network's Biatec Router. */
export const defaultRouterHost = (env: string): string =>
  Object.prototype.hasOwnProperty.call(ROUTER_HOSTS, env) ? ROUTER_HOSTS[env] : DEFAULT_ROUTER_HOST

/**
 * The ARC-14 header is sent to this host, so only https (or localhost for development) is accepted.
 * An empty or invalid setting means "the network's own router".
 */
export const safeRouterHost = (host: string | undefined, env: string): string => {
  try {
    const url = new URL((host ?? '').trim())
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) {
      // keep a plain path prefix (proxy), drop anything unusual
      const path = url.pathname.replace(/\/+$/, '')
      return url.origin + (/^(\/[\w.-]+)*$/.test(path) && !path.includes('..') ? path : '')
    }
  } catch {
    // not a URL
  }
  return defaultRouterHost(env)
}
