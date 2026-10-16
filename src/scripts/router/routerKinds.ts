import type { RouterKind } from './types'

export const DEFAULT_ROUTER: RouterKind = 'biatec'
export const DEFAULT_ROUTER_HOST = 'https://router.api.biatec.io'

/** Biatec Router serves Algorand mainnet only; other networks always use Folks Router. */
export const effectiveRouterKind = (selected: RouterKind, env: string): RouterKind =>
  selected === 'biatec' && env === 'mainnet-v1.0' ? 'biatec' : 'folks'

export const routerLabel = (kind: RouterKind) =>
  kind === 'biatec' ? 'Biatec Router' : 'Folks Router'
export const routerUrl = (kind: RouterKind) =>
  kind === 'biatec' ? 'https://biatec.io' : 'https://www.folksrouter.io'

/**
 * The ARC-14 header is sent to this host, so only https (or localhost for development) is accepted;
 * anything else falls back to the default endpoint.
 */
export const safeRouterHost = (host: string | undefined): string => {
  try {
    const url = new URL((host ?? '').trim())
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) {
      return url.origin
    }
  } catch {
    // not a URL
  }
  return DEFAULT_ROUTER_HOST
}
