import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getSessionUser,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  verifyApartmentAccess,
  verifyApartmentOwner,
} from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const hasAccess = await verifyApartmentAccess(user.id, apartmentId);
  if (!hasAccess) return forbidden();

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: {
      rooms: {
        orderBy: { sortOrder: 'asc' },
        include: {
          storageUnits: {
            orderBy: { sortOrder: 'asc' },
            include: {
              shelves: { orderBy: { sortOrder: 'asc' } },
              drawers: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!apartment) return notFound('Apartment');

  const orphanedUnits = await prisma.storageUnit.findMany({
    where: { apartmentId, roomId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      shelves: { orderBy: { sortOrder: 'asc' } },
      drawers: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json({ ...apartment, orphanedUnits });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const hasAccess = await verifyApartmentAccess(user.id, apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const { name } = body;

  if (!name) return badRequest('Name is required');

  const apartment = await prisma.apartment.update({
    where: { id: apartmentId },
    data: { name: name.trim() },
  });

  return NextResponse.json(apartment);
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const isOwner = await verifyApartmentOwner(user.id, apartmentId);
  if (!isOwner) return forbidden();

  await prisma.apartment.delete({ where: { id: apartmentId } });

  return new NextResponse(null, { status: 204 });
}
