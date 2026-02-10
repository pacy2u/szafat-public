import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, badRequest, conflict, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ unitId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { unitId } = await params;
  const unit = await prisma.storageUnit.findUnique({
    where: { id: unitId },
    include: {
      shelves: { orderBy: { sortOrder: 'asc' } },
      drawers: { orderBy: { sortOrder: 'asc' } },
      items: {
        where: { archived: false },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      },
    },
  });

  if (!unit) return notFound('Storage unit');

  const hasAccess = await verifyApartmentAccess(user.id, unit.apartmentId);
  if (!hasAccess) return forbidden();

  return NextResponse.json(unit);
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { unitId } = await params;
  const unit = await prisma.storageUnit.findUnique({ where: { id: unitId } });
  if (!unit) return notFound('Storage unit');

  const hasAccess = await verifyApartmentAccess(user.id, unit.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.roomId !== undefined) updates.roomId = body.roomId; // null = move to Sieroty

  const updated = await prisma.storageUnit.update({
    where: { id: unitId },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { unitId } = await params;
  const unit = await prisma.storageUnit.findUnique({
    where: { id: unitId },
    include: {
      shelves: true,
      drawers: true,
      items: { where: { archived: false } },
    },
  });

  if (!unit) return notFound('Storage unit');

  const hasAccess = await verifyApartmentAccess(user.id, unit.apartmentId);
  if (!hasAccess) return forbidden();

  const hasContents = unit.shelves.length > 0 || unit.drawers.length > 0 || unit.items.length > 0;
  const url = new URL(request.url);
  const confirmed = url.searchParams.get('confirm') === 'true';

  if (hasContents && !confirmed) {
    return conflict('Storage unit has contents. Use ?confirm=true to proceed.');
  }

  // Archive all items, then delete shelves, drawers, and the unit
  await prisma.$transaction([
    prisma.item.updateMany({
      where: { storageUnitId: unitId, archived: false },
      data: { archived: true, archivedAt: new Date() },
    }),
    prisma.shelf.deleteMany({ where: { storageUnitId: unitId } }),
    prisma.drawer.deleteMany({ where: { storageUnitId: unitId } }),
    prisma.storageUnit.delete({ where: { id: unitId } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
