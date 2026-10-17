import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mockApp } from './support/router-mocks'

// The trading screen is translated into every supported language, numbers are formatted for the language.

const LOCALES = ['en', 'sk', 'cs', 'de', 'es', 'hu', 'pl', 'zh'] as const
const messages = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(readFileSync(join(process.cwd(), 'src', 'locales', `${locale}.json`), 'utf-8'))
      .trading as Record<string, string>
  ])
)
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key) => String(values[key]))

const row = (page: Page, unit: string) => page.locator('#tradingtable tbody tr', { hasText: unit })

for (const locale of LOCALES) {
  test(`trading screen is localized: ${locale}`, async ({ page }) => {
    const t = messages[locale]
    await mockApp(page, { storage: { locale } })
    await page.goto('/trade-gold')

    // labels of the order ticket and the market table
    await expect(page.getByText(t.order, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(t.amountOfGold, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: t.refreshQuotes })).toBeVisible()
    await expect(page.getByText(t.loginToTrade)).toBeVisible()
    await expect(page.getByText(fill(t.facilitatedBy, { router: 'Biatec Router' }))).toBeVisible()
    await expect(page.locator('#tradingtable').getByText(t.sellPrice).first()).toBeAttached()
    await expect(page.getByRole('group', { name: t.quickAmounts })).toBeVisible()

    // trade buttons: translated accessible name with a number formatted for the language
    const total = (14).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
    })
    const usdc = row(page, 'USDC')
    await expect(
      usdc.getByRole('button', {
        name: fill(t.sellLabel, { amount: (0.1).toLocaleString(locale), total, unit: 'USDC' }),
        exact: true
      })
    ).toBeVisible()
    await expect(usdc.getByRole('button', { name: t.buy }).first()).toBeVisible()

    // updated time and the footer note use the language too
    await expect(
      page.getByText(fill(t.updated, { time: '' }).trim().split(' ')[0]).first()
    ).toBeVisible()
    await expect(
      page.getByText(fill(t.forAmount, { amount: (0.1).toLocaleString(locale) }))
    ).toBeVisible()
    await expect(page.getByText(t.pair, { exact: true }).first()).toBeAttached()

    // no raw message keys leak into the page
    const body = await page.locator('body').innerText()
    expect(body).not.toMatch(/\btrading\.[a-zA-Z]+/)
  })
}

test('error and notice messages are localized (sk)', async ({ page }) => {
  const t = messages.sk
  const mocks = await mockApp(page, { storage: { locale: 'sk' } })
  mocks.biatecFail = { status: 500, times: 1000 }
  await page.goto('/trade-gold')
  await expect(page.getByText(fill(t.noQuotesReturned, { router: 'Biatec Router' }))).toBeVisible()
  await expect(row(page, 'USDC').getByText(t.noQuote).first()).toBeVisible()
})

test('clicking buy while logged out shows the localized message (de)', async ({ page }) => {
  const t = messages.de
  await mockApp(page, { storage: { locale: 'de' } })
  await page.goto('/trade-gold')
  await row(page, 'USDC').getByRole('button', { name: t.buy }).first().click()
  await expect(page.getByText(t.authenticateFirst)).toBeVisible()
})
