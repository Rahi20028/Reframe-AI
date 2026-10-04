import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_USER_EMAIL!
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button:has-text("Log In")')
  await expect(page).toHaveURL('/dashboard')
}
test.describe.configure({ mode: 'serial' })

test.describe('Chat + Safety Layer', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('sending a normal message returns an AI reply', async ({ page }) => {
    const testMessage = `Test message ${Date.now()}`

    await page.getByPlaceholder(/feeling/i).fill(testMessage)
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.locator(`text=${testMessage}`)).toBeVisible()
    await expect(page.locator('.bg-white.border').last()).not.toHaveText('', { timeout: 15000 })
  })

  test('crisis keyword message shows the support message, not a generated reply', async ({ page }) => {
    await page.getByPlaceholder(/feeling/i).fill('sometimes I think about suicide')
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.locator('text=not alone')).toBeVisible({ timeout: 20000 })
  })

  test('stress keyword message shows the exercise suggestion button', async ({ page }) => {
    await page.getByPlaceholder(/feeling/i).fill('I feel so overwhelmed and stressed right now')
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.locator('text=not alone')).toBeVisible({ timeout: 20000 })
  })
})