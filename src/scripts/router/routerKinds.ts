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
