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
      getAccount: () => useAppStore().state.authState.account,
      getScope: () => safeRouterHost(useAppStore().state.routerHost),
      sign: async (encoded) => {
        const bridge = useAppStore().state.authComponent
        if (!bridge) throw new Error('Authentication component is not ready')
        return bridge.sign(encoded)
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
    try {
      return await call()
    } catch (e: any) {
      if (e?.status !== 401 && e?.status !== 403) throw e
      getAuth().invalidate()
      return await call()
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

export const resetRouterAuth = () => auth?.reset()

/** Router currently selected in the settings (falls back to Folks on unsupported networks). */
export const getSwapRouter = (): ISwapRouter => {
  const store = useAppStore()
  const kind = effectiveRouterKind(store.state.router, store.state.env)
  return kind === 'biatec' ? createBiatecRouter(biatecApi()) : createFolksRouter(store.state.env)
}
