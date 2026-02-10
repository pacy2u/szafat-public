import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const email = `auth-${Date.now()}@test.com`;
  const password = 'TestPass123!';

  test('registers a new user', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();

    await page.getByLabel('Name').fill('Auth Test');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in with registered user', async ({ page }) => {
    // Register first
    await page.goto('/register');
    const loginEmail = `login-${Date.now()}@test.com`;
    await page.getByLabel('Name').fill('Login Test');
    await page.getByLabel('Email').fill(loginEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.getByLabel('Email').fill(loginEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await page.waitForURL(/\/apartments/, { timeout: 10000 });
    await expect(page.getByText('My Apartments')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nonexistent@test.com');
    await page.getByLabel('Password').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/apartments');
    await expect(page).toHaveURL(/\/login/);
  });
});
