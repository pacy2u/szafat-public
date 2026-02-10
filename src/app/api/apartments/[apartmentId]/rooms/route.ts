import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, badRequest, verifyApartmentAccess } from '@/lib/api-utils';
import { validateName } from '@/lib/validation';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const hasAccess = await verifyApartmentAccess(user.id, apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const { name } = body;

  if (!name) return badRequest('Name is required');
  const nameResult = validateName(name);
  if (!nameResult.valid) return badRequest(nameResult.error!);

  const maxSort = await prisma.room.aggregate({
    where: { apartmentId },
    _max: { sortOrder: true },
  });

  const room = await prisma.room.create({
    data: {
      apartmentId,
      name: name.trim(),
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(room, { status: 201 });
}
