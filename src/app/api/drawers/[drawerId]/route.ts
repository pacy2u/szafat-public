import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, conflict, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ drawerId: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { drawerId } = await params;
  const drawer = await prisma.drawer.findUnique({
    where: { id: drawerId },
    include: { storageUnit: true },
  });
  if (!drawer) return notFound('Drawer');

  const hasAccess = await verifyApartmentAccess(user.id, drawer.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.storageUnitId !== undefined) updates.storageUnitId = body.storageUnitId;

  const updated = await prisma.drawer.update({
    where: { id: drawerId },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { drawerId } = await params;
  const drawer = await prisma.drawer.findUnique({
    where: { id: drawerId },
    include: { storageUnit: true, items: { where: { archived: false } } },
  });
  if (!drawer) return notFound('Drawer');

  const hasAccess = await verifyApartmentAccess(user.id, drawer.storageUnit.apartmentId);
  if (!hasAccess) return forbidden();

  const url = new URL(request.url);
  const confirmed = url.searchParams.get('confirm') === 'true';

  if (drawer.items.length > 0 && !confirmed) {
    return conflict('Drawer has items. Use ?confirm=true to proceed.');
  }

  await prisma.$transaction([
    prisma.item.updateMany({
      where: { drawerId, archived: false },
      data: { archived: true, archivedAt: new Date(), drawerId: null },
    }),
    prisma.drawer.delete({ where: { id: drawerId } }),
  ]);

  return new NextResponse(null, { status: 204 });
}
