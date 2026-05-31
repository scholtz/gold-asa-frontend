import { test, expect } from '@playwright/test'

// Basic end-to-end coverage for the core public functionality of the site.
// These tests run on both desktop and mobile viewports (see playwright.config.ts)
// to make sure the responsive design works across screen sizes.

test('home page loads with hero content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/ASA\.Gold/)
  await expect(page.getByRole('heading', { level: 1, name: 'Aurum Standard Asset' })).toBeVisible()
})

test('language switcher lives in the footer, not the navbar', async ({ page }) => {
  await page.goto('/')

  // The navbar (banner) must no longer contain the language switcher.
  const navbar = page.getByRole('banner')
  await expect(navbar.locator('.language-switcher')).toHaveCount(0)

  // The footer now hosts the language switcher.
  const footerSwitcher = page.getByTestId('footer-language-switcher')
  await expect(footerSwitcher).toBeVisible()
})

test('changing the language updates the displayed content', async ({ page }) => {
  await page.goto('/')

  const footerSwitcher = page.getByTestId('footer-language-switcher')
  await footerSwitcher.scrollIntoViewIfNeeded()
  await footerSwitcher.click()

  // Pick Slovak from the dropdown overlay.
  await page.getByRole('option', { name: 'Slovenčina' }).click()

  // Footer links section should now be translated to Slovak.
  await expect(page.getByText('Naše odkazy')).toBeVisible()

  // The selection is persisted to localStorage.
  const stored = await page.evaluate(() => localStorage.getItem('locale'))
  expect(stored).toBe('sk')
})

test('footer navigation links route within the app', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'About ASA.Gold project' }).click()
  await expect(page).toHaveURL(/\/about-asa-gold$/)
})
