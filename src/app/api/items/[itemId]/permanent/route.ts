import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, conflict, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ itemId: string }>;
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

  if (!item.archived) {
    return conflict('Item must be archived before permanent deletion');
  }

  // TODO: Delete photos from S3 when photo storage is implemented
  await prisma.item.delete({ where: { id: itemId } });

  return new NextResponse(null, { status: 204 });
}
