import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

/** Shared mock user state — set mockUser.id to a user id to simulate auth */
export const mockUser = { id: '', email: 'test@example.com', name: 'Test User' };

export async function cleanDatabase() {
  await prisma.item.deleteMany();
  await prisma.shelf.deleteMany();
  await prisma.drawer.deleteMany();
  await prisma.storageUnit.deleteMany();
  await prisma.room.deleteMany();
  await prisma.inviteLink.deleteMany();
  await prisma.apartmentMember.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(overrides: { email?: string; name?: string } = {}) {
  const email = overrides.email ?? 'test@example.com';
  const name = overrides.name ?? 'Test User';
  const passwordHash = await bcrypt.hash('Password123!', 4); // low rounds for speed

  return prisma.user.create({
    data: { email, passwordHash, name },
  });
}

export async function createTestApartment(ownerId: string, name = 'Test Apartment') {
  return prisma.apartment.create({
    data: {
      name,
      ownerId,
      members: { create: { userId: ownerId } },
    },
  });
}

export async function createTestRoom(apartmentId: string, name = 'Test Room') {
  return prisma.room.create({
    data: { apartmentId, name },
  });
}

export async function createTestStorageUnit(
  apartmentId: string,
  roomId: string | null,
  overrides: { name?: string; type?: 'WARDROBE' | 'FRIDGE' } = {},
) {
  return prisma.storageUnit.create({
    data: {
      apartmentId,
      roomId,
      name: overrides.name ?? 'Test Unit',
      type: overrides.type ?? 'WARDROBE',
    },
  });
}

export async function createTestItem(
  storageUnitId: string,
  overrides: { name?: string; expirationDate?: Date | null; shelfId?: string; drawerId?: string; archived?: boolean } = {},
) {
  return prisma.item.create({
    data: {
      name: overrides.name ?? 'Test Item',
      storageUnitId,
      shelfId: overrides.shelfId ?? null,
      drawerId: overrides.drawerId ?? null,
      expirationDate: overrides.expirationDate ?? null,
      archived: overrides.archived ?? false,
      archivedAt: overrides.archived ? new Date() : null,
    },
  });
}

export function jsonRequest(url: string, body: unknown, method = 'POST') {
  return new Request(`http://localhost:3000${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function getRequest(url: string) {
  return new Request(`http://localhost:3000${url}`, { method: 'GET' });
}

export function deleteRequest(url: string) {
  return new Request(`http://localhost:3000${url}`, { method: 'DELETE' });
}

export function patchRequest(url: string, body: unknown) {
  return new Request(`http://localhost:3000${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
