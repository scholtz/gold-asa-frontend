import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockApp } from './support/router-mocks'

// The trading screen: price ticker, market table, order ticket. Network is mocked (see support/router-mocks.ts).

const row = (page: Page, unit: string) => page.locator('#tradingtable tbody tr', { hasText: unit })

test.describe('trading screen', () => {
  test('shows reference prices, bid/ask and spread per pair', async ({ page }) => {
    await mockApp(page)
    await page.goto('/trade-gold')

    // ticker in the header: mid price of 1 gram
    const ticker = page.getByRole('list', { name: 'Gold reference prices' })
    await expect(ticker).toContainText('Gold (g) / USDC')
    await expect(ticker).toContainText('140.00')
    await expect(ticker).toContainText('1,100.00')

    // market row: sell price, buy price and spread
    const usdc = row(page, 'USDC')
    await expect(usdc).toContainText('140.00')
    await expect(usdc).toContainText('%')
    await expect(
      usdc.getByRole('button', { name: /^Buy 0\.1 grams of gold for 14\.00 USDC$/ })
    ).toBeVisible()
    await expect(
      usdc.getByRole('button', { name: /^Sell 0\.1 grams of gold for 14\.00 USDC$/ })
    ).toBeVisible()

    // small prices keep their precision
    await expect(row(page, 'BTC')).toContainText('0.00158000')
    await expect(page.getByText(/Updated \d/)).toBeVisible()
  })

  test('quick amount buttons reprice the whole table', async ({ page }) => {
    await mockApp(page)
    await page.goto('/trade-gold')
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams/ })).toBeVisible()

    await page
      .getByRole('group', { name: 'Quick amounts' })
      .getByRole('button', { name: '1 g', exact: true })
      .click()

    await expect(
      row(page, 'USDC').getByRole('button', { name: /^Sell 1 grams of gold for 140\.00 USDC$/ })
    ).toBeVisible()
    await expect(
      row(page, 'Algo').getByRole('button', { name: /^Sell 1 grams of gold for 1100\.00 Algo$/ })
    ).toBeVisible()
    await expect(page.getByText('for 1 g')).toBeVisible()
    // price per gram does not depend on the amount
    await expect(row(page, 'USDC')).toContainText('140.00')
  })

  test('typing a new amount reprices automatically and cannot trade stale prices', async ({
    page
  }) => {
    await mockApp(page)
    await page.goto('/trade-gold')
    await expect(row(page, 'USDC').getByRole('button', { name: /Sell 0\.1 grams/ })).toBeVisible()

    const amount = page.getByLabel('Amount of gold')
    await amount.fill('2')
    await amount.blur()

    await expect(
      row(page, 'USDC').getByRole('button', { name: /^Sell 2 grams of gold for 280\.00 USDC$/ })
    ).toBeEnabled()
    await expect(page.getByText('for 2 g')).toBeVisible()
  })

  test('can be used on a phone: every pair has prices and both trade buttons in view', async ({
    page
  }) => {
    await mockApp(page)
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/trade-gold')

    const usdc = row(page, 'USDC')
    await expect(usdc.getByRole('button', { name: /Buy 0\.1 grams/ })).toBeVisible()
    await expect(usdc.getByRole('button', { name: /Sell 0\.1 grams/ })).toBeVisible()
    // prices are labelled with the column name on small screens (shown via CSS from data-label)
    await expect(usdc.locator('td[data-label="Sell price"]')).toBeVisible()
    await expect(usdc.locator('td[data-label="Buy price"]')).toBeVisible()

    // nothing makes the page scroll sideways
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('shows the asset logos from Biatec Scan and falls back to the letter', async ({ page }) => {
    const mocks = await mockApp(page)
    await page.goto('/trade-gold')
    const logo = (unit: string) => row(page, unit).locator('.coin img')
    for (const unit of ['EURs', 'USDC', 'Algo', 'BTC']) {
      await expect(logo(unit)).toHaveAttribute(
        'src',
        /^https:\/\/api\.algorand\.scan\.biatec\.io\/api\/asset\/image\/\d+$/
      )
    }
    await expect(logo('USDC')).toHaveAttribute('src', /\/image\/31566704$/)
    await expect(logo('Algo')).toHaveAttribute('src', /\/image\/0$/)
    await expect.poll(() => mocks.logos.length).toBeGreaterThanOrEqual(4)
  })

  test('falls back to a letter badge when a logo cannot be loaded', async ({ page }) => {
    const mocks = await mockApp(page)
    mocks.logosFail = true
    await page.goto('/trade-gold')
    await expect(row(page, 'USDC').locator('.coin')).toHaveText('U')
    await expect(row(page, 'USDC').locator('.coin img')).toHaveCount(0)
  })

  test('shows an empty state instead of prices when the router has none', async ({ page }) => {
    const mocks = await mockApp(page)
    mocks.biatecFail = { status: 500, times: 1000 }
    await page.goto('/trade-gold')
    await expect(page.getByText('No quotes were returned by Biatec Router')).toBeVisible()
    await expect(row(page, 'USDC').getByText('No quote').first()).toBeVisible()
    await expect(row(page, 'USDC').getByRole('button')).toHaveCount(0)
    await expect(page.getByRole('list', { name: 'Gold reference prices' })).toContainText('-')
  })
})
