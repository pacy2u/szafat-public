import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, badRequest } from '@/lib/api-utils';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { storageUnitId } = body as { storageUnitId?: string };

  if (!storageUnitId) return badRequest('storageUnitId is required');

  const unit = await prisma.storageUnit.findUnique({ where: { id: storageUnitId } });
  if (!unit) return badRequest('Storage unit not found');

  const member = await prisma.apartmentMember.findFirst({
    where: { apartmentId: unit.apartmentId, userId: user.id },
  });
  if (!member) return forbidden();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const result = await prisma.item.updateMany({
    where: {
      storageUnitId,
      archived: false,
      expirationDate: { lt: now },
    },
    data: {
      archived: true,
      archivedAt: new Date(),
    },
  });

  return NextResponse.json({ archivedCount: result.count });
}
