import algosdk from 'algosdk'
import { arc14, arc14Header } from 'algorand-authentication-component-vue'
import { RouterAuthRequiredError } from './types'

/** Realm expected by https://router.api.biatec.io (the ARC-14 note is `<realm>#ARC14`). */
export const BIATEC_ROUTER_REALM = 'BiatecRouter'

/** The auth transaction is valid for ~1000 rounds (~45 minutes); refresh well before that. */
const HEADER_TTL_MS = 30 * 60 * 1000
/** After a failed/declined signature we do not ask again for this long (unless reset() is called). */
const DECLINE_COOLDOWN_MS = 5 * 60 * 1000

export interface IBiatecAuthDeps {
  /** Currently authenticated account, empty when not logged in */
  getAccount(): string
  /** Signs encoded unsigned transactions with the connected wallet / ARC-76 account */
  sign(encodedTxns: Uint8Array[]): Promise<Uint8Array[]>
  /** Suggested params of the Algorand mainnet node */
  getParams(): Promise<algosdk.SuggestedParams>
  now?: () => number
}

/**
 * Provides the ARC-14 `Authorization` header for the Biatec Router. The header is a signed zero-fee self payment
 * (never sent to the network), so signing it costs nothing but needs the user's approval; it is cached per account.
 */
export const createBiatecAuth = (deps: IBiatecAuthDeps) => {
  const now = deps.now ?? Date.now
  let cached: { account: string; header: string; expires: number } | null = null
  let pending: { account: string; promise: Promise<string> } | null = null
  let declined: { until: number; message: string } | null = null

  const create = async (account: string): Promise<string> => {
    const params = await deps.getParams()
    const txn = arc14(BIATEC_ROUTER_REALM, account, params)
    const [signed] = await deps.sign([txn.toByte()])
    if (!signed) throw new Error('Wallet did not return the signed authentication transaction')
    return arc14Header(signed)
  }

  return {
    async getHeader(): Promise<string> {
      const account = deps.getAccount()
      if (!account) throw new RouterAuthRequiredError()
      if (cached && cached.account === account && cached.expires > now()) return cached.header
      if (declined && declined.until > now()) {
        throw new RouterAuthRequiredError(
          `Could not sign the router authentication (${declined.message}). Press "Refresh quotes" to try again.`
        )
      }
      // one wallet prompt even when several quotes are requested at once
      if (pending && pending.account === account) return pending.promise
      const promise = create(account)
        .then((header) => {
          cached = { account, header, expires: now() + HEADER_TTL_MS }
          declined = null
          return header
        })
        .catch((e: any) => {
          declined = { until: now() + DECLINE_COOLDOWN_MS, message: e?.message ?? 'cancelled' }
          throw e
        })
        .finally(() => {
          if (pending?.promise === promise) pending = null
        })
      pending = { account, promise }
      return promise
    },
    invalidate() {
      cached = null
    },
    /** forget a previous decline, e.g. when the user explicitly asks for a refresh */
    reset() {
      declined = null
    }
  }
}
