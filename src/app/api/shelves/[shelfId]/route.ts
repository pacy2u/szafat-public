import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, badRequest, conflict, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ shelfId: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { shelfId } = await params;
  const shelf = await prisma.shelf.findUnique({
    where: { id: shelfId },
    include: { storageUnit: true },
  });
  if (!shelf) return notFound('Shelf');

  const hasAccess = await verifyApartmentAccess(user.id, shelf.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.storageUnitId !== undefined) updates.storageUnitId = body.storageUnitId;

  const updated = await prisma.shelf.update({
    where: { id: shelfId },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { shelfId } = await params;
  const shelf = await prisma.shelf.findUnique({
    where: { id: shelfId },
    include: { storageUnit: true, items: { where: { archived: false } } },
  });
  if (!shelf) return notFound('Shelf');

  const hasAccess = await verifyApartmentAccess(user.id, shelf.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const url = new URL(request.url);
  const confirmed = url.searchParams.get('confirm') === 'true';

  if (shelf.items.length > 0 && !confirmed) {
    return conflict('Shelf has items. Use ?confirm=true to proceed.');
  }

  await prisma.$transaction([
    prisma.item.updateMany({
      where: { shelfId, archived: false },
      data: { archived: true, archivedAt: new Date(), shelfId: null },
    }),
    prisma.shelf.delete({ where: { id: shelfId } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
