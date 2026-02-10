import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, badRequest, verifyApartmentAccess } from '@/lib/api-utils';
import { validateName } from '@/lib/validation';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { name, storageUnitId, shelfId, drawerId, expirationDate } = body;

  if (!name || !storageUnitId) return badRequest('Name and storageUnitId are required');

  const nameResult = validateName(name);
  if (!nameResult.valid) return badRequest(nameResult.error!);

  if (shelfId && drawerId) {
    return badRequest('Item cannot be on a shelf and in a drawer at the same time');
  }

  const unit = await prisma.storageUnit.findUnique({ where: { id: storageUnitId } });
  if (!unit) return badRequest('Invalid storageUnitId');

  const hasAccess = await verifyApartmentAccess(user.id, unit.apartmentId);
  if (!hasAccess) return forbidden();

  const item = await prisma.item.create({
    data: {
      name: name.trim(),
      storageUnitId,
      shelfId: shelfId || null,
      drawerId: drawerId || null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
