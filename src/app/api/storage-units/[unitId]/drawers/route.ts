import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, badRequest, verifyApartmentAccess } from '@/lib/api-utils';
import { validateName } from '@/lib/validation';

interface Params {
  params: Promise<{ unitId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { unitId } = await params;
  const unit = await prisma.storageUnit.findUnique({ where: { id: unitId } });
  if (!unit) return notFound('Storage unit');

  const hasAccess = await verifyApartmentAccess(user.id, unit.apartmentId);
  if (!hasAccess) return forbidden();

  const body = await request.json();
  const { name } = body;
  if (!name) return badRequest('Name is required');

  const nameResult = validateName(name);
  if (!nameResult.valid) return badRequest(nameResult.error!);

  const drawer = await prisma.drawer.create({
    data: { storageUnitId: unitId, name: name.trim() },
  });

  return NextResponse.json(drawer, { status: 201 });
}
