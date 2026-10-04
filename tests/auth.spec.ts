import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_USER_EMAIL!
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!

test.describe('Authentication', () => {
  test('logged-out user visiting /dashboard is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('login fails with incorrect credentials and shows an error', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', 'wrong-password-123')
    await page.click('button:has-text("Log In")')

    // Error banner should appear, and we should NOT have navigated away from /login
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })

  test('login succeeds with correct credentials and reaches the dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Log In")')

    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    // Confirm the sidebar actually rendered — not just the right URL
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible()
  })

  test('signed-in user can sign out and gets redirected to /login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button:has-text("Log In")')
    await expect(page).toHaveURL('/dashboard')

    await page.click('text=Sign out')
    await expect(page).toHaveURL('/login')

    // And confirm dashboard is now blocked again
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})