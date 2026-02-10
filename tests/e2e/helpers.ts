import { Page, expect } from '@playwright/test';

const TEST_EMAIL = `e2e-${Date.now()}@test.com`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_NAME = 'E2E Test User';

export { TEST_EMAIL, TEST_PASSWORD, TEST_NAME };

export async function registerUser(page: Page, email = TEST_EMAIL) {
  await page.goto('/register');
  await page.getByLabel('Name').fill(TEST_NAME);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Register' }).click();
  // Should redirect to login
  await expect(page).toHaveURL(/\/login/);
}

export async function loginUser(page: Page, email = TEST_EMAIL) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  // Should redirect to apartments
  await page.waitForURL(/\/apartments/, { timeout: 10000 });
}

export async function registerAndLogin(page: Page) {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
  await registerUser(page, email);
  await loginUser(page, email);
  return email;
}
