import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;

  const member = await prisma.apartmentMember.findFirst({
    where: { apartmentId, userId: user.id },
  });
  if (!member) return forbidden();

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    include: {
      rooms: {
        include: {
          storageUnits: {
            include: {
              shelves: { orderBy: { sortOrder: 'asc' } },
              drawers: { orderBy: { sortOrder: 'asc' } },
              items: { orderBy: { createdAt: 'desc' } },
            },
          },
        },
      },
    },
  });

  if (!apartment) return notFound('Apartment');

  // Also get orphaned units (roomId = null)
  const orphanedUnits = await prisma.storageUnit.findMany({
    where: { apartmentId, roomId: null },
    include: {
      shelves: { orderBy: { sortOrder: 'asc' } },
      drawers: { orderBy: { sortOrder: 'asc' } },
      items: { orderBy: { createdAt: 'desc' } },
    },
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    apartment: {
      ...apartment,
      orphanedUnits,
    },
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${apartment.name}-export.json"`,
    },
  });
}
