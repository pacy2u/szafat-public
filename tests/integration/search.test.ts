import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import {
  prisma, cleanDatabase, createTestUser, createTestApartment,
  createTestRoom, createTestStorageUnit, createTestItem, mockUser,
} from './helpers';

import { GET as searchEndpoint } from '@/app/api/apartments/[apartmentId]/search/route';

interface SearchResult {
  type: string;
  id: string;
  name: string;
  locationPath: string;
}

describe('Search Integration', () => {
  let aptId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    mockUser.id = user.id;

    const apt = await createTestApartment(user.id);
    aptId = apt.id;

    const room = await createTestRoom(apt.id, 'Kitchen');
    const unit = await createTestStorageUnit(apt.id, room.id, { name: 'Main Fridge' });
    await createTestItem(unit.id, { name: 'Milk' });
    await createTestItem(unit.id, { name: 'Butter' });
    await createTestItem(unit.id, { name: 'Cheese' });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('finds items by partial name match', async () => {
    const req = new Request(`http://localhost:3000/api/apartments/${aptId}/search?q=mil`);
    const res = await searchEndpoint(req, { params: Promise.resolve({ apartmentId: aptId }) });
    const body: SearchResult[] = await res.json();

    expect(res.status).toBe(200);
    const itemResults = body.filter((r) => r.type === 'item');
    expect(itemResults.map((r) => r.name)).toContain('Milk');
  });

  it('finds rooms by name', async () => {
    const req = new Request(`http://localhost:3000/api/apartments/${aptId}/search?q=kitchen`);
    const res = await searchEndpoint(req, { params: Promise.resolve({ apartmentId: aptId }) });
    const body: SearchResult[] = await res.json();

    expect(res.status).toBe(200);
    const roomResults = body.filter((r) => r.type === 'room');
    expect(roomResults.map((r) => r.name)).toContain('Kitchen');
  });

  it('returns empty results for no match', async () => {
    const req = new Request(`http://localhost:3000/api/apartments/${aptId}/search?q=zzzzz`);
    const res = await searchEndpoint(req, { params: Promise.resolve({ apartmentId: aptId }) });
    const body: SearchResult[] = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(0);
  });
});
