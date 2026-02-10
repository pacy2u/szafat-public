import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, badRequest, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ itemId: string }>;
}

async function buildLocationPath(item: {
  storageUnitId: string;
  shelfId: string | null;
  drawerId: string | null;
}): Promise<string> {
  const unit = await prisma.storageUnit.findUnique({
    where: { id: item.storageUnitId },
    include: { room: true },
  });
  if (!unit) return '';

  const parts: string[] = [];
  if (unit.room) parts.push(unit.room.name);
  parts.push(unit.name);

  if (item.shelfId) {
    const shelf = await prisma.shelf.findUnique({ where: { id: item.shelfId } });
    if (shelf) parts.push(shelf.name);
  } else if (item.drawerId) {
    const drawer = await prisma.drawer.findUnique({ where: { id: item.drawerId } });
    if (drawer) parts.push(drawer.name);
  }

  return parts.join(' > ');
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { storageUnit: true },
  });
  if (!item) return notFound('Item');

  const hasAccess = await verifyApartmentAccess(user.id, item.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const locationPath = await buildLocationPath(item);

  return NextResponse.json({ ...item, locationPath });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { storageUnit: true },
  });
  if (!item) return notFound('Item');

  const hasAccess = await verifyApartmentAccess(user.id, item.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.expirationDate !== undefined) {
    updates.expirationDate = body.expirationDate ? new Date(body.expirationDate) : null;
  }
  if (body.storageUnitId !== undefined) updates.storageUnitId = body.storageUnitId;
  if (body.shelfId !== undefined) updates.shelfId = body.shelfId;
  if (body.drawerId !== undefined) updates.drawerId = body.drawerId;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

  if (updates.shelfId && updates.drawerId) {
    return badRequest('Item cannot be on a shelf and in a drawer at the same time');
  }

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { storageUnit: true },
  });
  if (!item) return notFound('Item');

  const hasAccess = await verifyApartmentAccess(user.id, item.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const archived = await prisma.item.update({
    where: { id: itemId },
    data: { archived: true, archivedAt: new Date() },
  });

  return NextResponse.json(archived);
}
