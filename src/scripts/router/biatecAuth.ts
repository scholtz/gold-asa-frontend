import algosdk from 'algosdk'
import { arc14, arc14Header } from 'algorand-authentication-component-vue'

/** Realm expected by https://router.api.biatec.io (the ARC-14 note is `<realm>#ARC14`). */
export const BIATEC_ROUTER_REALM = 'BiatecRouter'

/** The auth transaction is valid for ~1000 rounds (~45 minutes); refresh well before that. */
const HEADER_TTL_MS = 30 * 60 * 1000

export interface IBiatecAuthDeps {
  /** Suggested params of the Algorand mainnet node */
  getParams(): Promise<algosdk.SuggestedParams>
  /** Header scope, e.g. the router host: a header is not reused for another scope */
  getScope?(): string
  /** Creates the session account; defaults to a random account */
  generateAccount?(): algosdk.Account
  now?: () => number
}

/**
 * Provides the ARC-14 `Authorization` header for the Biatec Router.
 *
 * The router only needs *some* account to sign the (never submitted, zero fee) authentication transaction, it does not
 * need the user's identity for quotes or for building swap transactions. So the app generates a random throwaway
 * account in memory (lost on page reload, never stored, never holds funds) and signs the header locally: the user
 * neither has to log in nor to approve a wallet prompt to see prices. Swaps are still signed by the user's wallet.
 */
export const createBiatecAuth = (deps: IBiatecAuthDeps) => {
  const now = deps.now ?? Date.now
  const generate = deps.generateAccount ?? (() => algosdk.generateAccount())
  // one throwaway account per scope (router host), so a host cannot correlate sessions of another host.
  // Only the current scope's account is kept; switching scope drops (and so forgets) the previous key.
  let session: { scope: string; account: algosdk.Account } | null = null
  let cached: { scope: string; header: string; expires: number } | null = null
  let pending: { scope: string; promise: Promise<string> } | null = null

  const create = async (scope: string): Promise<string> => {
    if (session?.scope !== scope) session = { scope, account: generate() }
    const { account } = session
    const params = await deps.getParams()
    const txn = arc14(BIATEC_ROUTER_REALM, account.addr.toString(), params)
    return arc14Header(txn.signTxn(account.sk))
  }

  return {
    async getHeader(): Promise<string> {
      const scope = deps.getScope?.() ?? ''
      if (cached && cached.scope === scope && cached.expires > now()) return cached.header
      // parallel quote requests share one header creation
      if (pending && pending.scope === scope) return pending.promise
      const promise = create(scope)
        .then((header) => {
          // a creation that was overtaken by a scope change must not overwrite the newer scope's header
          if (session?.scope === scope) cached = { scope, header, expires: now() + HEADER_TTL_MS }
          return header
        })
        .finally(() => {
          if (pending?.promise === promise) pending = null
        })
      pending = { scope, promise }
      return promise
    },
    /**
     * Drops the cached header after the router rejected it (e.g. it expired). Pass the header that was rejected:
     * when parallel requests were rejected with the same old header only the first one drops it, the others find
     * a fresh header already in place and must not throw it away.
     */
    invalidate(rejected?: string) {
      if (rejected !== undefined && cached?.header !== rejected) return
      cached = null
      // the router may reject the account itself (rate limit): the next header comes from a new throwaway account
      session = null
    },
    /** Address of the throwaway session account of the current scope (for diagnostics and tests) */
    get sessionAddress(): string | null {
      return session?.scope === (deps.getScope?.() ?? '') ? session.account.addr.toString() : null
    }
  }
}
