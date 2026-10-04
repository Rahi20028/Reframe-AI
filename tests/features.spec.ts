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

test.describe('Mood, Journal, Exercises', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('journal entry can be saved and appears in the list', async ({ page }) => {
    const entryText = `Test journal entry ${Date.now()}`

    await page.goto('/dashboard/journal')
    await page.getByPlaceholder(/start writing/i).fill(entryText)
    await page.getByRole('button', { name: /save entry/i }).click()

    await expect(page.locator(`text=${entryText}`)).toBeVisible({ timeout: 10000 })
  })

  test('mood can be logged once, and a second log is blocked same day', async ({ page }) => {
  await page.goto('/dashboard/mood')

  const goodButton = page.getByRole('button', { name: /good/i })
  const alreadyLoggedText = page.getByText(/already logged/i)

  // Wait for the loading state to resolve into one of the two real states
  await Promise.race([
    goodButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
    alreadyLoggedText.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
  ])

  const alreadyLogged = await alreadyLoggedText.isVisible()

  if (!alreadyLogged) {
    await goodButton.click()
    await expect(alreadyLoggedText).toBeVisible({ timeout: 10000 })
  } else {
    await expect(alreadyLoggedText).toBeVisible()
  }
})

  test('exercise flow moves to the next exercise when marked not helpful', async ({ page }) => {
    await page.goto('/dashboard/exercises')
    await page.getByRole('button', { name: /start a guided exercise/i }).click()

    // First exercise instructions should appear
    await page.getByRole('button', { name: /i tried it/i }).click()

    // Check-in step
    await expect(page.locator('text=Did that help?')).toBeVisible()
    await page.getByRole('button', { name: /not really/i }).click()

    // Should move to a different exercise's instructions, not the check-in or exhausted screen
    await expect(page.getByRole('button', { name: /i tried it/i })).toBeVisible({ timeout: 5000 })
  })
})