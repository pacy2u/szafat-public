import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import {
  prisma, cleanDatabase, createTestUser, createTestApartment,
  createTestRoom, createTestStorageUnit, mockUser, jsonRequest, patchRequest, deleteRequest,
} from './helpers';

import { POST as createRoom } from '@/app/api/apartments/[apartmentId]/rooms/route';
import { PATCH as updateRoom, DELETE as deleteRoom } from '@/app/api/rooms/[roomId]/route';

function aptParams(apartmentId: string) {
  return { params: Promise.resolve({ apartmentId }) };
}

function roomParams(roomId: string) {
  return { params: Promise.resolve({ roomId }) };
}

describe('Rooms Integration', () => {
  let aptId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createTestUser();
    mockUser.id = user.id;
    const apt = await createTestApartment(user.id);
    aptId = apt.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/apartments/[apartmentId]/rooms', () => {
    it('creates a room', async () => {
      const req = jsonRequest(`/api/apartments/${aptId}/rooms`, { name: 'Kitchen' });
      const res = await createRoom(req, aptParams(aptId));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.name).toBe('Kitchen');
      expect(body.apartmentId).toBe(aptId);
    });

    it('auto-increments sort order', async () => {
      await createTestRoom(aptId, 'Room 1');

      const req = jsonRequest(`/api/apartments/${aptId}/rooms`, { name: 'Room 2' });
      const res = await createRoom(req, aptParams(aptId));
      const body = await res.json();

      expect(body.sortOrder).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/rooms/[roomId]', () => {
    it('renames a room', async () => {
      const room = await createTestRoom(aptId, 'Old Name');
      const req = patchRequest(`/api/rooms/${room.id}`, { name: 'New Name' });
      const res = await updateRoom(req, roomParams(room.id));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe('New Name');
    });
  });

  describe('DELETE /api/rooms/[roomId]', () => {
    it('deletes room and orphans its storage units', async () => {
      const room = await createTestRoom(aptId, 'To Delete');
      const unit = await createTestStorageUnit(aptId, room.id, { name: 'Orphan Unit' });

      const req = deleteRequest(`/api/rooms/${room.id}`);
      const res = await deleteRoom(req, roomParams(room.id));

      expect([200, 204]).toContain(res.status);

      const deletedRoom = await prisma.room.findUnique({ where: { id: room.id } });
      expect(deletedRoom).toBeNull();

      const orphanedUnit = await prisma.storageUnit.findUnique({ where: { id: unit.id } });
      expect(orphanedUnit).not.toBeNull();
      expect(orphanedUnit!.roomId).toBeNull();
    });
  });
});
