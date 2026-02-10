import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'forbidden', message: 'Access denied' }, { status: 403 });
}

export function notFound(entity: string) {
  return NextResponse.json({ error: 'not_found', message: `${entity} not found` }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: 'bad_request', message }, { status: 400 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: 'conflict', message }, { status: 409 });
}

export async function verifyApartmentAccess(userId: string, apartmentId: string) {
  const membership = await prisma.apartmentMember.findUnique({
    where: { apartmentId_userId: { apartmentId, userId } },
  });
  return !!membership;
}

export async function verifyApartmentOwner(userId: string, apartmentId: string) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });
  return apartment?.ownerId === userId;
}
