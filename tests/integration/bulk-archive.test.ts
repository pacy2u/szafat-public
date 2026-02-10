import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import {
  prisma, cleanDatabase, createTestUser, createTestApartment,
  createTestRoom, createTestStorageUnit, createTestItem, mockUser, jsonRequest,
} from './helpers';

import { POST as bulkArchive } from '@/app/api/items/bulk-archive/route';

describe('Bulk Archive Integration', () => {
  let fridgeId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    mockUser.id = user.id;

    const apt = await createTestApartment(user.id);
    const room = await createTestRoom(apt.id);
    const fridge = await createTestStorageUnit(apt.id, room.id, { name: 'Fridge', type: 'FRIDGE' });
    fridgeId = fridge.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('archives all expired items in a fridge', async () => {
    const pastDate = new Date('2020-01-01');
    const futureDate = new Date('2030-01-01');

    await createTestItem(fridgeId, { name: 'Expired 1', expirationDate: pastDate });
    await createTestItem(fridgeId, { name: 'Expired 2', expirationDate: pastDate });
    await createTestItem(fridgeId, { name: 'Fresh', expirationDate: futureDate });

    const req = jsonRequest('/api/items/bulk-archive', { storageUnitId: fridgeId });
    const res = await bulkArchive(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.archivedCount).toBe(2);

    const remaining = await prisma.item.findMany({
      where: { storageUnitId: fridgeId, archived: false },
    });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Fresh');
  });

  it('returns 0 when no expired items', async () => {
    await createTestItem(fridgeId, { name: 'Fresh', expirationDate: new Date('2030-01-01') });

    const req = jsonRequest('/api/items/bulk-archive', { storageUnitId: fridgeId });
    const res = await bulkArchive(req);
    const body = await res.json();

    expect(body.archivedCount).toBe(0);
  });
});
