import algosdk from 'algosdk'
import { arc14, arc14Header } from 'algorand-authentication-component-vue'

/** Realm expected by https://router.api.biatec.io (the ARC-14 note is `<realm>#ARC14`). */
export const BIATEC_ROUTER_REALM = 'BiatecRouter'

/** The auth transaction is valid for ~1000 rounds (~45 minutes); refresh well before that. */
const HEADER_TTL_MS = 30 * 60 * 1000
/** A header younger than this cannot have expired, so a late rejection of an older one must not drop it. */
const FRESH_MS = 10 * 1000

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
  let session: algosdk.Account | null = null
  let cached: { scope: string; header: string; created: number; expires: number } | null = null
  let pending: { scope: string; promise: Promise<string> } | null = null

  const create = async (): Promise<string> => {
    session ??= generate()
    const params = await deps.getParams()
    const txn = arc14(BIATEC_ROUTER_REALM, session.addr.toString(), params)
    return arc14Header(txn.signTxn(session.sk))
  }

  return {
    async getHeader(): Promise<string> {
      const scope = deps.getScope?.() ?? ''
      if (cached && cached.scope === scope && cached.expires > now()) return cached.header
      // parallel quote requests share one header creation
      if (pending && pending.scope === scope) return pending.promise
      const promise = create()
        .then((header) => {
          cached = { scope, header, created: now(), expires: now() + HEADER_TTL_MS }
          return header
        })
        .finally(() => {
          if (pending?.promise === promise) pending = null
        })
      pending = { scope, promise }
      return promise
    },
    /**
     * Drops the cached header after the router rejected it (e.g. it expired). A header created moments ago is kept:
     * parallel requests that were rejected with the old header must not throw away the fresh one.
     */
    invalidate() {
      if (cached && now() - cached.created < FRESH_MS) return
      cached = null
    },
    /** Address of the throwaway session account (for diagnostics and tests) */
    get sessionAddress(): string | null {
      return session?.addr.toString() ?? null
    }
  }
}
