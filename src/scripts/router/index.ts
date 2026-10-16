import algosdk from 'algosdk'
import { biatecRouter } from 'biatec-router'
import { useAppStore } from '@/stores/app'
import { createBiatecAuth } from './biatecAuth'
import { createBiatecRouter } from './biatecRouter'
import type { IBiatecApi } from './biatecRouter'
import { createFolksRouter } from './folksRouter'
import { effectiveRouterKind, safeRouterHost } from './routerKinds'
import type { ISwapRouter } from './types'

export * from './types'

export * from './routerKinds'

let auth: ReturnType<typeof createBiatecAuth> | null = null

const getAuth = () => {
  if (!auth) {
    auth = createBiatecAuth({
      // a header is bound to the router host and to the node (network) whose rounds it was built from
      getScope: () => {
        const { routerHost, algodHost, algodPort, env } = useAppStore().state
        return `${safeRouterHost(routerHost)}|${env}|${algodHost}:${algodPort}`
      },
      getParams: () => {
        const { algodHost, algodPort, algodToken } = useAppStore().state
        return new algosdk.Algodv2(algodToken, algodHost, algodPort).getTransactionParams().do()
      }
    })
  }
  return auth
}

const biatecApi = (): IBiatecApi => {
  const store = useAppStore()
  const { OpenAPI, RouterService } = biatecRouter
  OpenAPI.BASE = safeRouterHost(store.state.routerHost)
  OpenAPI.HEADERS = async () => ({ Authorization: await getAuth().getHeader() })

  // an expired/rejected header is dropped and the call retried once with a new one
  const withReauth = async <T>(call: () => Promise<T>): Promise<T> => {
    const used = await getAuth().getHeader()
    try {
      return await call()
    } catch (e: any) {
      if (e?.status !== 401 && e?.status !== 403) throw e
      getAuth().invalidate(used)
      try {
        return await call()
      } catch (retryError: any) {
        // still rejected: forget whatever is cached so the next refresh starts clean
        if (retryError?.status === 401 || retryError?.status === 403) getAuth().invalidate()
        throw retryError
      }
    }
  }

  return {
    quote: (fromAsset, toAsset, amount) =>
      withReauth(() => RouterService.getApiV1RouterQuote(fromAsset, toAsset, amount)).then(Number),
    routeTxs: async (input) => {
      const response = await withReauth(() =>
        RouterService.postApiV1RouterRouteTxs({ ...input, routesCount: 1, maxHops: 3 })
      )
      return response.routes?.[0]?.txsToSign ?? []
    }
  }
}

/** Router currently selected in the settings (falls back to Folks on unsupported networks). */
export const getSwapRouter = (): ISwapRouter => {
  const store = useAppStore()
  const kind = effectiveRouterKind(store.state.router, store.state.env)
  return kind === 'biatec' ? createBiatecRouter(biatecApi()) : createFolksRouter(store.state.env)
}
