import { test, expect } from '@playwright/test'
import type { Page, Route, Request } from '@playwright/test'
import algosdk from 'algosdk'

// End-to-end tests for the swap router selection on the trading page:
// - Biatec Router (default on mainnet) authenticates with a random throwaway session account, so quotes load
//   without the user logging in or signing anything
// - the user can choose Folks Router instead, and the choice is persisted
// - on networks Biatec Router does not serve (testnet) Folks Router is used automatically
// All network access (algod, both routers, BFF) is mocked, so the tests are deterministic and offline.

const GOLD = 1241944285
const USDC = 31566704
const EUR = 227855942
const BTC = 1058926737

/** units of the other asset per 1 base unit of gold (gold has 6 decimals) */
const RATE: Record<number, number> = { [EUR]: 120, [USDC]: 140, 0: 1100, [BTC]: 0.158 }
const DECIMALS: Record<number, number> = { [GOLD]: 6, [USDC]: 6, [EUR]: 6, [BTC]: 8, 0: 6 }

const mainnetConfig = {
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
const testnetConfig = {
  ...mainnetConfig,
  env: 'testnet-v1.0',
  algodHost: 'https://testnet-api.algonode.cloud'
}

/** what the app itself persists to localStorage (it always contains the algod settings) */
const persistedState = (extra: Record<string, unknown>) =>
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

interface IMocks {
  biatec: Request[]
  folks: Request[]
  algodParams: Request[]
  /** make the next N biatec quote calls fail with this status */
  biatecFail: { status: number; times: number } | null
  biatecRouteTxs: Request[]
}

/** constant rate router quote: base units of `to` received for `amount` base units of `from` */
const quoteAmount = (from: number, to: number, amount: number) =>
  from === GOLD ? Math.floor(amount * RATE[to]) : Math.floor(amount / RATE[from])

async function mockApp(
  page: Page,
  options: { config?: Record<string, unknown>; storage?: Record<string, string> } = {}
): Promise<IMocks> {
  const mocks: IMocks = {
    biatec: [],
    folks: [],
    algodParams: [],
    biatecFail: null,
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

  // Biatec Router
  await page.route('https://router.api.biatec.io/**', async (route: Route) => {
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

const row = (page: Page, unit: string) => page.locator('#tradingtable tbody tr', { hasText: unit })
const routerChoice = (page: Page, name: 'Biatec Router' | 'Folks Router') =>
  page.getByTestId('router-select').getByRole('radio', { name })

/** decodes the `Authorization: SigTx ...` header and checks it is a valid, signed BiatecRouter ARC-14 transaction */
function decodeAuth(request: Request) {
  const header = request.headers()['authorization']
  expect(header, 'authorization header').toMatch(/^SigTx [A-Za-z0-9+/=]+$/)
  const signed = algosdk.decodeSignedTransaction(Buffer.from(header.slice(6), 'base64'))
  expect(new TextDecoder().decode(signed.txn.note)).toBe('BiatecRouter#ARC14')
  expect(signed.txn.payment?.amount).toBe(0n)
  expect(signed.txn.fee).toBe(0n)
  expect(signed.txn.sender.toString()).toBe(signed.txn.payment!.receiver.toString())
  expect(signed.sig).toBeDefined()
  return { header, sender: signed.txn.sender.toString() }
}

test.describe('swap router on the trading page', () => {
  test('loads Biatec Router quotes on mainnet without logging in', async ({ page }) => {
    const mocks = await mockApp(page)
    await page.goto('/trade-gold')

    await expect(routerChoice(page, 'Biatec Router')).toBeChecked()
    await expect(
      page.getByText('Facilitated by Algorand blockchain and the Biatec Router')
    ).toBeVisible()

    // 0.1 g: sell = 14 USDC, buy costs ~14 USDC (derived from fixed input quotes)
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*14(\.0+)? USDC/s })
    ).toBeVisible()
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Buy 0\.1 grams.*14(\.\d+)? USDC/s })
    ).toBeVisible()
    await expect(
      row(page, 'Algo').getByRole('button', { name: /Sell 0\.1 grams.*110(\.0+)? Algo/s })
    ).toBeVisible()
    await expect(
      row(page, 'EURs').getByRole('button', { name: /Sell 0\.1 grams.*12(\.0+)? EURs/s })
    ).toBeVisible()

    // the user is NOT logged in and nothing asks for it
    await expect(page.getByRole('button', { name: /Log in/ }).first()).toBeVisible()
    await expect(page.getByText(/needs you to log in/)).toHaveCount(0)
    await expect(page.getByText('No quotes were returned')).toHaveCount(0)
    await expect(page.locator('.aa-root')).toHaveCount(0) // no login dialog was opened

    expect(mocks.biatec.length).toBeGreaterThan(8)
    expect(mocks.folks).toHaveLength(0)
    // every router request is authenticated with the same valid ARC-14 header
    const senders = new Set(mocks.biatec.map((request) => decodeAuth(request).sender))
    const headers = new Set(mocks.biatec.map((request) => request.headers()['authorization']))
    expect(senders.size).toBe(1)
    expect(headers.size).toBe(1)
    // and the header was created once, from a single algod params request
    expect(mocks.algodParams).toHaveLength(1)
    expect(mocks.biatecRouteTxs).toHaveLength(0)
  })

  test('uses a new random session account on every page load', async ({ page }) => {
    const mocks = await mockApp(page)
    await page.goto('/trade-gold')
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    const first = decodeAuth(mocks.biatec[0]).sender

    mocks.biatec.length = 0
    await page.reload()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    const second = decodeAuth(mocks.biatec[0]).sender

    expect(algosdk.isValidAddress(first)).toBe(true)
    expect(algosdk.isValidAddress(second)).toBe(true)
    expect(second).not.toBe(first)
    // the throwaway key is never persisted
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))
    expect(stored).not.toContain(first)
    expect(stored).not.toContain(second)
  })

  test('the user can switch to Folks Router and the choice is remembered', async ({ page }) => {
    const mocks = await mockApp(page)
    await page.goto('/trade-gold')
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*14(\.0+)? USDC/s })
    ).toBeVisible()

    mocks.biatec.length = 0
    await routerChoice(page, 'Folks Router').click()

    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(
      page.getByText('Facilitated by Algorand blockchain and the Folks Router')
    ).toBeVisible()
    // Folks quotes are 1% lower for selling: 13.86 USDC
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*13\.86(0+)? USDC/s })
    ).toBeVisible()
    expect(mocks.folks.length).toBeGreaterThan(0)
    expect(mocks.biatec).toHaveLength(0)
    for (const request of mocks.folks) expect(request.headers()['authorization']).toBeUndefined()

    // persisted
    const saved = await page.evaluate(
      () => JSON.parse(localStorage.getItem('state') ?? '{}').router
    )
    expect(saved).toBe('folks')
    mocks.folks.length = 0
    await page.reload()
    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*13\.86(0+)? USDC/s })
    ).toBeVisible()
    expect(mocks.biatec).toHaveLength(0)
  })

  test('the user can switch back to Biatec Router', async ({ page }) => {
    const mocks = await mockApp(page, {
      storage: { state: persistedState({ router: 'folks' }) }
    })
    await page.goto('/trade-gold')
    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(mocks.biatec).toHaveLength(0)

    await routerChoice(page, 'Biatec Router').click()
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*14(\.0+)? USDC/s })
    ).toBeVisible()
    expect(mocks.biatec.length).toBeGreaterThan(0)
    expect(
      JSON.parse((await page.evaluate(() => localStorage.getItem('state'))) ?? '{}').router
    ).toBe('biatec')
  })

  test('config.json can set the default router; the user preference wins', async ({ page }) => {
    const mocks = await mockApp(page, { config: { ...mainnetConfig, router: 'folks' } })
    await page.goto('/trade-gold')
    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(mocks.biatec).toHaveLength(0)

    await routerChoice(page, 'Biatec Router').click()
    await page.reload()
    await expect(routerChoice(page, 'Biatec Router')).toBeChecked()
  })

  test('the router can be chosen in Settings too', async ({ page }) => {
    const mocks = await mockApp(page)
    await page.goto('/settings')
    await page.getByRole('radio', { name: 'Folks Router' }).click()
    await expect(page.getByRole('radio', { name: 'Folks Router' })).toBeChecked()

    await page.goto('/trade-gold')
    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(mocks.biatec).toHaveLength(0)
  })

  test('uses Folks Router with a notice on testnet and never calls Biatec', async ({ page }) => {
    const mocks = await mockApp(page, { config: testnetConfig })
    await page.goto('/trade-gold')
    await expect(
      page.getByText('Biatec Router is available on Algorand mainnet only')
    ).toBeVisible()
    await expect(
      page.getByText('Facilitated by Algorand blockchain and the Folks Router')
    ).toBeVisible()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(mocks.folks.length).toBeGreaterThan(0)
    expect(mocks.biatec).toHaveLength(0)
    expect(mocks.algodParams).toHaveLength(0)
  })

  test('a rejected (expired) header is replaced and the request retried', async ({ page }) => {
    const mocks = await mockApp(page)
    mocks.biatecFail = { status: 401, times: 1 }
    await page.goto('/trade-gold')
    await expect(
      row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams.*14(\.0+)? USDC/s })
    ).toBeVisible()
    await expect(page.getByText('No quotes were returned')).toHaveCount(0)
    expect(mocks.biatec.length).toBeGreaterThan(8)
  })

  test('explains when the router cannot return quotes', async ({ page }) => {
    const mocks = await mockApp(page)
    mocks.biatecFail = { status: 500, times: 1000 }
    await page.goto('/trade-gold')
    await expect(page.getByText('No quotes were returned by Biatec Router')).toBeVisible()
    await expect(row(page, 'USDC').getByText('No quote').first()).toBeVisible()

    // the user can fall back to Folks Router
    await routerChoice(page, 'Folks Router').click()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    await expect(page.getByText('No quotes were returned')).toHaveCount(0)
  })

  test('buying without being logged in asks the user to log in and builds no swap', async ({
    page
  }) => {
    const mocks = await mockApp(page)
    await page.goto('/trade-gold')
    const buy = row(page, 'USDC').getByRole('button', { name: /Buy 0\.1 grams/ })
    await expect(buy).toBeVisible()
    await buy.click()
    await expect(page.getByText('Please authenticate first')).toBeVisible()
    expect(mocks.biatecRouteTxs).toHaveLength(0)
  })

  test('a custom (non https) router endpoint is ignored and the default endpoint is used', async ({
    page
  }) => {
    const mocks = await mockApp(page, {
      storage: {
        state: persistedState({ routerHost: 'http://evil.example.com' })
      }
    })
    const evil: string[] = []
    await page.route('http://evil.example.com/**', (route) => {
      evil.push(route.request().url())
      return route.abort()
    })
    await page.goto('/trade-gold')
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(evil).toHaveLength(0)
    expect(mocks.biatec.length).toBeGreaterThan(0)
  })
})
