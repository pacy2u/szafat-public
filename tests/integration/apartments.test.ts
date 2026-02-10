import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import './setup';
import { prisma, cleanDatabase, createTestUser, mockUser, jsonRequest } from './helpers';

import { POST as registerPost } from '@/app/api/auth/register/route';
import { GET as getApartments, POST as createApartment } from '@/app/api/apartments/route';

describe('Auth & Apartments Integration', () => {
  beforeEach(async () => {
    await cleanDatabase();
    mockUser.id = '';
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('creates a new user', async () => {
      const req = jsonRequest('/api/auth/register', {
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
      });

      const res = await registerPost(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.email).toBe('new@example.com');
      expect(body.name).toBe('New User');
      expect(body.id).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com' });

      const req = jsonRequest('/api/auth/register', {
        email: 'dup@example.com',
        password: 'Password123!',
        name: 'Dup',
      });

      const res = await registerPost(req);
      expect(res.status).toBe(409);
    });

    it('validates email format', async () => {
      const req = jsonRequest('/api/auth/register', {
        email: 'bad-email',
        password: 'Password123!',
        name: 'Test',
      });

      const res = await registerPost(req);
      expect(res.status).toBe(400);
    });

    it('validates password strength', async () => {
      const req = jsonRequest('/api/auth/register', {
        email: 'test@example.com',
        password: '123',
        name: 'Test',
      });

      const res = await registerPost(req);
      expect(res.status).toBe(400);
    });

    it('requires all fields', async () => {
      const req = jsonRequest('/api/auth/register', { email: 'test@example.com' });

      const res = await registerPost(req);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/apartments', () => {
    it('returns user apartments', async () => {
      const user = await createTestUser();
      mockUser.id = user.id;

      await prisma.apartment.create({
        data: {
          name: 'My Flat',
          ownerId: user.id,
          members: { create: { userId: user.id } },
        },
      });

      const res = await getApartments();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('My Flat');
    });

    it('returns 401 for unauthenticated', async () => {
      mockUser.id = '';
      const res = await getApartments();
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/apartments', () => {
    it('creates apartment and adds owner as member', async () => {
      const user = await createTestUser();
      mockUser.id = user.id;

      const req = jsonRequest('/api/apartments', { name: 'New Flat' });
      const res = await createApartment(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.name).toBe('New Flat');
      expect(body.ownerId).toBe(user.id);

      const member = await prisma.apartmentMember.findFirst({
        where: { apartmentId: body.id, userId: user.id },
      });
      expect(member).not.toBeNull();
    });

    it('rejects empty name', async () => {
      const user = await createTestUser();
      mockUser.id = user.id;

      const req = jsonRequest('/api/apartments', { name: '' });
      const res = await createApartment(req);
      expect(res.status).toBe(400);
    });
  });
});
