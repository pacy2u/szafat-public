import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import {
  prisma, cleanDatabase, createTestUser, createTestApartment,
  createTestRoom, createTestStorageUnit, createTestItem,
  mockUser, jsonRequest, patchRequest, deleteRequest, getRequest,
} from './helpers';

import { POST as createItem } from '@/app/api/items/route';
import { GET as getItem, PATCH as updateItem, DELETE as archiveItem } from '@/app/api/items/[itemId]/route';

function params(itemId: string) {
  return { params: Promise.resolve({ itemId }) };
}

describe('Items Integration', () => {
  let unitId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    mockUser.id = user.id;

    const apt = await createTestApartment(user.id);
    const room = await createTestRoom(apt.id);
    const unit = await createTestStorageUnit(apt.id, room.id);
    unitId = unit.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/items', () => {
    it('creates an item', async () => {
      const req = jsonRequest('/api/items', { name: 'Milk', storageUnitId: unitId });
      const res = await createItem(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.name).toBe('Milk');
      expect(body.storageUnitId).toBe(unitId);
    });

    it('creates item with expiration date', async () => {
      const req = jsonRequest('/api/items', {
        name: 'Yogurt',
        storageUnitId: unitId,
        expirationDate: '2025-12-31',
      });
      const res = await createItem(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.expirationDate).toContain('2025-12-31');
    });

    it('rejects missing name', async () => {
      const req = jsonRequest('/api/items', { storageUnitId: unitId });
      const res = await createItem(req);
      expect(res.status).toBe(400);
    });

    it('rejects shelf + drawer conflict', async () => {
      const shelf = await prisma.shelf.create({ data: { storageUnitId: unitId, name: 'S1' } });
      const drawer = await prisma.drawer.create({ data: { storageUnitId: unitId, name: 'D1' } });

      const req = jsonRequest('/api/items', {
        name: 'X', storageUnitId: unitId, shelfId: shelf.id, drawerId: drawer.id,
      });
      const res = await createItem(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/items/[itemId]', () => {
    it('returns item with location path', async () => {
      const item = await createTestItem(unitId, { name: 'Butter' });
      const req = getRequest(`/api/items/${item.id}`);
      const res = await getItem(req, params(item.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('Butter');
      expect(body.locationPath).toBeDefined();
    });

    it('returns 404 for nonexistent item', async () => {
      const req = getRequest('/api/items/nonexistent');
      const res = await getItem(req, params('nonexistent'));
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/items/[itemId]', () => {
    it('updates item name', async () => {
      const item = await createTestItem(unitId, { name: 'Old Name' });
      const req = patchRequest(`/api/items/${item.id}`, { name: 'New Name' });
      const res = await updateItem(req, params(item.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('New Name');
    });

    it('updates expiration date', async () => {
      const item = await createTestItem(unitId);
      const req = patchRequest(`/api/items/${item.id}`, { expirationDate: '2026-01-15' });
      const res = await updateItem(req, params(item.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.expirationDate).toContain('2026-01-15');
    });

    it('clears expiration date with null', async () => {
      const item = await createTestItem(unitId, { expirationDate: new Date('2025-12-31') });
      const req = patchRequest(`/api/items/${item.id}`, { expirationDate: null });
      const res = await updateItem(req, params(item.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.expirationDate).toBeNull();
    });
  });

  describe('DELETE /api/items/[itemId] (soft delete)', () => {
    it('archives item', async () => {
      const item = await createTestItem(unitId);
      const req = deleteRequest(`/api/items/${item.id}`);
      const res = await archiveItem(req, params(item.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.archived).toBe(true);
      expect(body.archivedAt).not.toBeNull();
    });
  });
});
