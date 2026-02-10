import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Inventory Flow', () => {
  test('navigates through apartment → room → storage unit hierarchy', async ({ page }) => {
    await registerAndLogin(page);

    // Create test data via API
    const aptRes = await page.request.post('/api/apartments', {
      data: { name: 'Navigation Test' },
    });
    const apt = await aptRes.json();

    const roomRes = await page.request.post(`/api/apartments/${apt.id}/rooms`, {
      data: { name: 'Kitchen' },
    });
    const room = await roomRes.json();

    const unitRes = await page.request.post(`/api/apartments/${apt.id}/storage-units`, {
      data: { name: 'Big Fridge', roomId: room.id, type: 'FRIDGE' },
    });
    const unit = await unitRes.json();

    await page.request.post('/api/items', {
      data: { name: 'Milk', storageUnitId: unit.id },
    });
    await page.request.post('/api/items', {
      data: { name: 'Butter', storageUnitId: unit.id, expirationDate: '2026-03-01' },
    });

    // Navigate to apartments page
    await page.goto('/apartments');
    await expect(page.getByText('My Apartments')).toBeVisible();

    // Navigate to apartment detail
    await page.getByRole('link', { name: /Navigation Test/ }).click();
    await expect(page.getByRole('heading', { name: 'Navigation Test' })).toBeVisible();
    await expect(page.getByText('Kitchen')).toBeVisible();

    // Navigate to room
    await page.getByText('Kitchen').click();
    await expect(page.getByRole('heading', { name: 'Kitchen' })).toBeVisible();
    await expect(page.getByText('Big Fridge')).toBeVisible();

    // Navigate to storage unit
    await page.getByRole('link', { name: /Big Fridge/ }).click();
    await expect(page.getByText('Milk').first()).toBeVisible();
    await expect(page.getByText('Butter').first()).toBeVisible();
  });

  test('apartment page shows export button', async ({ page }) => {
    await registerAndLogin(page);

    const aptRes = await page.request.post('/api/apartments', {
      data: { name: 'Export Test' },
    });
    const apt = await aptRes.json();

    await page.goto(`/apartments/${apt.id}`);
    await expect(page.getByText('Export data (JSON)')).toBeVisible();
  });
});
