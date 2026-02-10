import { vi } from 'vitest';
import { prisma, mockUser } from './helpers';

// Mock @/lib/auth to prevent next-auth from loading (it requires next/server internals)
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock @/lib/db to use our test prisma instance
vi.mock('@/lib/db', () => ({ prisma }));

// Mock @/lib/api-utils to use controllable session
vi.mock('@/lib/api-utils', async (importOriginal) => {
  const { NextResponse } = await import('next/server');

  return {
    getSessionUser: vi.fn(() => Promise.resolve(mockUser.id ? mockUser : null)),
    unauthorized: () => NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    forbidden: () => NextResponse.json({ error: 'forbidden' }, { status: 403 }),
    notFound: (entity: string) => NextResponse.json({ error: 'not_found', message: `${entity} not found` }, { status: 404 }),
    badRequest: (message: string) => NextResponse.json({ error: 'bad_request', message }, { status: 400 }),
    conflict: (message: string) => NextResponse.json({ error: 'conflict', message }, { status: 409 }),
    verifyApartmentAccess: vi.fn(async (userId: string, apartmentId: string) => {
      const member = await prisma.apartmentMember.findFirst({
        where: { apartmentId, userId },
      });
      return !!member;
    }),
    verifyApartmentOwner: vi.fn(async (userId: string, apartmentId: string) => {
      const apartment = await prisma.apartment.findUnique({
        where: { id: apartmentId },
      });
      return apartment?.ownerId === userId;
    }),
  };
});
