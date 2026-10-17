// Network mocks shared by the Playwright specs: algod, Biatec Router and Folks Router.
import type { Page, Route, Request } from '@playwright/test'

export const GOLD = 1241944285
export const USDC = 31566704
export const EUR = 227855942
export const BTC = 1058926737

/** units of the other asset per 1 base unit of gold (gold has 6 decimals) */
const RATE: Record<number, number> = { [EUR]: 120, [USDC]: 140, 0: 1100, [BTC]: 0.158 }
const DECIMALS: Record<number, number> = { [GOLD]: 6, [USDC]: 6, [EUR]: 6, [BTC]: 8, 0: 6 }

export const mainnetConfig = {
  bff: 'https://bff.asa.gold',
  appId: 1241943872,
  env: 'mainnet-v1.0',
  algodHost: 'https://mainnet-api.algonode.cloud',
  algodPort: 443,
  algodToken: '',
  goldToken: GOLD,
  usdcToken: USDC,
  algoToken: 0,
  btcToken: BTC,
  eurToken: EUR,
  feeCollector: 'GOPQRISPHSWZBLHM2K67RJNSELDQEDNCL4DS3FTICW2Q2UM3KZWEME7BPE'
}
export const sandboxConfig = {
  ...mainnetConfig,
  env: 'sandnet-v1',
  algodHost: 'http://localhost',
  algodPort: 4001
}
export const testnetConfig = {
  ...mainnetConfig,
  env: 'testnet-v1.0',
  algodHost: 'https://testnet-api.algonode.cloud'
}

/** what the app itself persists to localStorage (it always contains the algod settings) */
export const persistedState = (extra: Record<string, unknown>) =>
  JSON.stringify({
    env: 'mainnet-v1.0',
    algodHost: 'https://mainnet-api.algonode.cloud',
    algodPort: 443,
    algodToken: '',
    ...extra
  })

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*'
}

export interface IMocks {
  biatec: Request[]
  folks: Request[]
  algodParams: Request[]
  /** make the next N biatec quote calls fail with this status */
  biatecFail: { status: number; times: number } | null
  /** requested asset logo urls */
  logos: string[]
  logosFail: boolean
  biatecRouteTxs: Request[]
}

/** constant rate router quote: base units of `to` received for `amount` base units of `from` */
const quoteAmount = (from: number, to: number, amount: number) =>
  from === GOLD ? Math.floor(amount * RATE[to]) : Math.floor(amount / RATE[from])

export async function mockApp(
  page: Page,
  options: { config?: Record<string, unknown>; storage?: Record<string, string> } = {}
): Promise<IMocks> {
  const mocks: IMocks = {
    biatec: [],
    folks: [],
    algodParams: [],
    biatecFail: null,
    logos: [],
    logosFail: false,
    biatecRouteTxs: []
  }

  // anything not mocked below (fonts, BFF, IPFS, explorers, ...) must not reach the network
  await page.route(
    (url) => !['localhost', '127.0.0.1'].includes(url.hostname),
    (route) => route.abort()
  )
  await page.route('**/config.json', (route) =>
    route.fulfill({ json: options.config ?? mainnetConfig })
  )
  if (options.storage) {
    await page.addInitScript((entries) => {
      if (sessionStorage.getItem('__seeded')) return
      sessionStorage.setItem('__seeded', '1')
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
    }, options.storage)
  }

  // algod (mainnet and testnet)
  await page.route(/\/\/(mainnet|testnet)-api\.algonode\.cloud\//, async (route) => {
    const url = new URL(route.request().url())
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (url.pathname.endsWith('/v2/transactions/params')) {
      mocks.algodParams.push(route.request())
      return route.fulfill({
        headers: cors,
        json: {
          fee: 0,
          'genesis-hash': Buffer.alloc(32, 7).toString('base64'),
          'genesis-id': 'mainnet-v1.0',
          'last-round': 50_000_000,
          'min-fee': 1000,
          'consensus-version': 'https://github.com/algorandfoundation/specs/tree/test'
        }
      })
    }
    const asset = url.pathname.match(/\/v2\/assets\/(\d+)/)
    if (asset) {
      const id = Number(asset[1])
      return route.fulfill({
        headers: cors,
        json: {
          index: id,
          params: {
            name: `Asset ${id}`,
            'unit-name': `A${id}`,
            decimals: DECIMALS[id] ?? 6,
            total: 1_000_000_000_000,
            creator: 'A'.repeat(58),
            'default-frozen': false
          }
        }
      })
    }
    return route.fulfill({ status: 404, headers: cors, json: { message: 'not mocked' } })
  })

  // asset logos (Biatec Scan): a 1x1 png, `logoFailures` can make them fail
  await page.route('https://api.algorand.scan.biatec.io/api/asset/image/*', (route) => {
    mocks.logos.push(route.request().url())
    if (mocks.logosFail) return route.fulfill({ status: 404, headers: cors, body: '' })
    return route.fulfill({
      headers: { ...cors, 'content-type': 'image/png' },
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      )
    })
  })

  // Biatec Router
  // mainnet router and the separate testnet router
  await page.route(/^https:\/\/(testnet\.)?router\.api\.biatec\.io\//, async (route: Route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    mocks.biatec.push(request)
    const url = new URL(request.url())
    if (url.pathname.endsWith('/routeTxs')) {
      mocks.biatecRouteTxs.push(request)
      return route.fulfill({ headers: cors, json: { routes: [{ txsToSign: ['dHg='] }] } })
    }
    if (mocks.biatecFail && mocks.biatecFail.times > 0) {
      mocks.biatecFail.times--
      return route.fulfill({ status: mocks.biatecFail.status, headers: cors, body: '' })
    }
    const q = url.searchParams
    const out = quoteAmount(
      Number(q.get('fromAsset')),
      Number(q.get('toAsset')),
      Number(q.get('amount'))
    )
    return route.fulfill({
      headers: { ...cors, 'content-type': 'application/json' },
      body: String(out)
    })
  })

  // Folks Router
  await page.route('https://api.folksrouter.io/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    mocks.folks.push(request)
    const q = new URL(request.url()).searchParams
    const from = Number(q.get('fromAsset'))
    const to = Number(q.get('toAsset'))
    const amount = Number(q.get('amount'))
    // Folks quotes 1% worse than Biatec so the tests can tell the routers apart
    const base = quoteAmount(from, to, amount)
    const out = q.get('type') === 'FIXED_OUTPUT' ? Math.ceil(base * 1.01) : Math.floor(base * 0.99)
    return route.fulfill({
      headers: cors,
      json: {
        success: true,
        result: { quoteAmount: String(out), priceImpact: 0, microalgoTxnsFee: 0, txnPayload: 'x' }
      }
    })
  })

  return mocks
}
