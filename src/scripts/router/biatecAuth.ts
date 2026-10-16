import algosdk from 'algosdk'
import { arc14, arc14Header } from 'algorand-authentication-component-vue'
import { RouterAuthRequiredError } from './types'

/** Realm expected by https://router.api.biatec.io (the ARC-14 note is `<realm>#ARC14`). */
export const BIATEC_ROUTER_REALM = 'BiatecRouter'

/** The auth transaction is valid for ~1000 rounds (~45 minutes); refresh well before that. */
const HEADER_TTL_MS = 30 * 60 * 1000
/** After a failed/declined signature we do not ask again for this long (unless reset() is called). */
const DECLINE_COOLDOWN_MS = 5 * 60 * 1000
/** A header younger than this cannot have expired, so a rejection of an older one must not drop it. */
const FRESH_MS = 10 * 1000

export interface IBiatecAuthDeps {
  /** Currently authenticated account, empty when not logged in */
  getAccount(): string
  /** Signs encoded unsigned transactions with the connected wallet / ARC-76 account */
  sign(encodedTxns: Uint8Array[]): Promise<Uint8Array[]>
  /** Suggested params of the Algorand mainnet node */
  getParams(): Promise<algosdk.SuggestedParams>
  /** Header scope, e.g. the router host: a header is not reused for another scope */
  getScope?(): string
  now?: () => number
}

/**
 * Provides the ARC-14 `Authorization` header for the Biatec Router. The header is a signed zero-fee self payment
 * (never sent to the network), so signing it costs nothing but needs the user's approval; it is cached per account.
 */
export const createBiatecAuth = (deps: IBiatecAuthDeps) => {
  const now = deps.now ?? Date.now
  let cached: { key: string; header: string; created: number; expires: number } | null = null
  let pending: { key: string; promise: Promise<string> } | null = null
  let declined: { key: string; until: number; message: string } | null = null

  /** the user (or wallet) refused / failed to sign, as opposed to e.g. a network error */
  class SignError extends Error {}

  const create = async (account: string): Promise<string> => {
    const params = await deps.getParams()
    const txn = arc14(BIATEC_ROUTER_REALM, account, params)
    let signed: Uint8Array | undefined
    try {
      ;[signed] = await deps.sign([txn.toByte()])
    } catch (e: any) {
      throw new SignError(e?.message ?? 'cancelled')
    }
    if (!signed) throw new Error('Wallet did not return the signed authentication transaction')
    return arc14Header(signed)
  }

  return {
    async getHeader(): Promise<string> {
      const account = deps.getAccount()
      if (!account) throw new RouterAuthRequiredError()
      const key = `${account}|${deps.getScope?.() ?? ''}`
      if (cached && cached.key === key && cached.expires > now()) return cached.header
      if (declined && declined.key === key && declined.until > now()) {
        throw new RouterAuthRequiredError(
          `Could not sign the router authentication (${declined.message}). Press "Refresh quotes" to try again.`
        )
      }
      // one wallet prompt even when several quotes are requested at once
      if (pending && pending.key === key) return pending.promise
      const promise = create(account)
        .then((header) => {
          cached = { key, header, created: now(), expires: now() + HEADER_TTL_MS }
          declined = null
          return header
        })
        .catch((e: any) => {
          if (!(e instanceof SignError)) throw e // e.g. network error: no cooldown, the next refresh retries
          declined = { key, until: now() + DECLINE_COOLDOWN_MS, message: e.message }
          throw new RouterAuthRequiredError(
            `Could not sign the router authentication (${e.message}). Press "Refresh quotes" to try again.`
          )
        })
        .finally(() => {
          if (pending?.promise === promise) pending = null
        })
      pending = { key, promise }
      return promise
    },
    /**
     * Drops the cached header after the router rejected it. A header created moments ago is kept: parallel
     * requests that were rejected with the old header must not throw away the fresh one.
     */
    invalidate() {
      if (cached && now() - cached.created < FRESH_MS) return
      cached = null
    },
    /** forget a previous decline, e.g. when the user explicitly asks for a refresh */
    reset() {
      declined = null
    }
  }
}
