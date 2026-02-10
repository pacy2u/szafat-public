import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Search', () => {
  test('searches for items across the apartment', async ({ page }) => {
    await registerAndLogin(page);

    // Create apartment with data via API
    const aptRes = await page.request.post('/api/apartments', {
      data: { name: 'Search Test Flat' },
    });
    const apt = await aptRes.json();

    const roomRes = await page.request.post(`/api/apartments/${apt.id}/rooms`, {
      data: { name: 'Living Room' },
    });
    const room = await roomRes.json();

    const unitRes = await page.request.post(`/api/apartments/${apt.id}/storage-units`, {
      data: { name: 'Bookshelf', roomId: room.id, type: 'WARDROBE' },
    });
    const unit = await unitRes.json();

    await page.request.post('/api/items', {
      data: { name: 'Harry Potter Book', storageUnitId: unit.id },
    });

    // Navigate to search
    await page.goto('/search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Search for the item
    await page.getByPlaceholder(/search/i).fill('Harry');

    // Wait for results
    await expect(page.getByText('Harry Potter Book')).toBeVisible({ timeout: 5000 });
  });
});
