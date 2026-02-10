import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import {
  prisma, cleanDatabase, createTestUser, createTestApartment,
  createTestRoom, createTestStorageUnit, mockUser, jsonRequest, patchRequest,
} from './helpers';

import { POST as createUnit } from '@/app/api/apartments/[apartmentId]/storage-units/route';
import { PATCH as updateUnit } from '@/app/api/storage-units/[unitId]/route';

function aptParams(apartmentId: string) {
  return { params: Promise.resolve({ apartmentId }) };
}

function unitParams(unitId: string) {
  return { params: Promise.resolve({ unitId }) };
}

describe('Storage Units Integration', () => {
  let aptId: string;
  let roomId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    mockUser.id = user.id;
    const apt = await createTestApartment(user.id);
    aptId = apt.id;
    const room = await createTestRoom(apt.id);
    roomId = room.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/apartments/[apartmentId]/storage-units', () => {
    it('creates a wardrobe', async () => {
      const req = jsonRequest(`/api/apartments/${aptId}/storage-units`, {
        name: 'Bedroom Wardrobe',
        roomId,
        type: 'WARDROBE',
      });
      const res = await createUnit(req, aptParams(aptId));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.name).toBe('Bedroom Wardrobe');
      expect(body.type).toBe('WARDROBE');
      expect(body.roomId).toBe(roomId);
    });

    it('creates a fridge', async () => {
      const req = jsonRequest(`/api/apartments/${aptId}/storage-units`, {
        name: 'Kitchen Fridge',
        roomId,
        type: 'FRIDGE',
      });
      const res = await createUnit(req, aptParams(aptId));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.type).toBe('FRIDGE');
    });
  });

  describe('PATCH /api/storage-units/[unitId]', () => {
    it('renames a storage unit', async () => {
      const unit = await createTestStorageUnit(aptId, roomId, { name: 'Old' });
      const req = patchRequest(`/api/storage-units/${unit.id}`, { name: 'New' });
      const res = await updateUnit(req, unitParams(unit.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('New');
    });

    it('moves unit to a different room', async () => {
      const room2 = await createTestRoom(aptId, 'Room 2');
      const unit = await createTestStorageUnit(aptId, roomId);
      const req = patchRequest(`/api/storage-units/${unit.id}`, { roomId: room2.id });
      const res = await updateUnit(req, unitParams(unit.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.roomId).toBe(room2.id);
    });
  });
});
