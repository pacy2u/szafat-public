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
  const { name, type, roomId } = body;

  if (!name || !type || !roomId) return badRequest('Name, type, and roomId are required');
  if (!['WARDROBE', 'FRIDGE'].includes(type)) return badRequest('Type must be WARDROBE or FRIDGE');

  const nameResult = validateName(name);
  if (!nameResult.valid) return badRequest(nameResult.error!);

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.apartmentId !== apartmentId) return badRequest('Invalid roomId');

  const unit = await prisma.storageUnit.create({
    data: {
      apartmentId,
      roomId,
      name: name.trim(),
      type,
    },
  });

  return NextResponse.json(unit, { status: 201 });
}
