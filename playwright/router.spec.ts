import { test, expect } from '@playwright/test'
import type { Page, Request } from '@playwright/test'
import {
  GOLD,
  USDC,
  EUR,
  BTC,
  mainnetConfig,
  testnetConfig,
  sandboxConfig,
  persistedState,
  mockApp
} from './support/router-mocks'
import algosdk from 'algosdk'

// End-to-end tests for the swap router selection on the trading page:
// - Biatec Router (default on mainnet) authenticates with a random throwaway session account, so quotes load
//   without the user logging in or signing anything
// - the user can choose Folks Router instead, and the choice is persisted
// - Biatec Router has a mainnet and a testnet endpoint; where it has none (sandbox) Folks Router is used
// All network access (algod, both routers, BFF) is mocked, so the tests are deterministic and offline.

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

  test('Settings warns about an endpoint that cannot be used', async ({ page }) => {
    await mockApp(page)
    await page.goto('/settings')
    const field = page.getByLabel('Biatec Router endpoint')
    await field.fill('http://evil.example.com')
    await expect(page.getByText(/This endpoint is not valid/)).toBeVisible()
    await field.fill('https://router.example.com')
    await expect(page.getByText(/This endpoint is not valid/)).toHaveCount(0)
  })

  test('uses the Biatec testnet router on testnet', async ({ page }) => {
    const mocks = await mockApp(page, { config: testnetConfig })
    await page.goto('/trade-gold')
    await expect(routerChoice(page, 'Biatec Router')).toBeChecked()
    await expect(
      page.getByText('Facilitated by Algorand blockchain and the Biatec Router')
    ).toBeVisible()
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell/ })).toBeVisible()
    expect(mocks.biatec.length).toBeGreaterThan(8)
    // testnet has its own router host, the mainnet router is never used there
    for (const request of mocks.biatec) {
      expect(new URL(request.url()).hostname).toBe('testnet.router.api.biatec.io')
      decodeAuth(request)
    }
    expect(mocks.folks).toHaveLength(0)
  })

  test('falls back to Folks Router with a notice where Biatec has no router (sandbox)', async ({
    page
  }) => {
    const mocks = await mockApp(page, { config: sandboxConfig })
    await page.goto('/trade-gold')
    await expect(page.getByText('Biatec Router is not available on this network')).toBeVisible()
    await expect(
      page.getByText('Facilitated by Algorand blockchain and the Folks Router')
    ).toBeVisible()
    await expect(routerChoice(page, 'Folks Router')).toBeChecked()
    await expect(routerChoice(page, 'Biatec Router')).toBeDisabled()
    expect(mocks.biatec).toHaveLength(0)
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
