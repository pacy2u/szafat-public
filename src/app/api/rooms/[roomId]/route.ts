import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, badRequest, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ roomId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { roomId } = await params;
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      storageUnits: {
        orderBy: { sortOrder: 'asc' },
        include: {
          shelves: { orderBy: { sortOrder: 'asc' } },
          drawers: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });

  if (!room) return notFound('Room');

  const hasAccess = await verifyApartmentAccess(user.id, room.apartmentId);
  if (!hasAccess) return forbidden();

  return NextResponse.json(room);
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { roomId } = await params;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return notFound('Room');

  const hasAccess = await verifyApartmentAccess(user.id, room.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const { name } = body;

  if (!name) return badRequest('Name is required');

  const updated = await prisma.room.update({
    where: { id: roomId },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { roomId } = await params;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return notFound('Room');

  const hasAccess = await verifyApartmentAccess(user.id, room.apartmentId);
  if (!hasAccess) return forbidden();

  // Orphan storage units (set roomId to null) per FR-021
  await prisma.$transaction([
    prisma.storageUnit.updateMany({
      where: { roomId },
      data: { roomId: null },
    }),
    prisma.room.delete({ where: { id: roomId } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
