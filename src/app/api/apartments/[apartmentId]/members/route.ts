import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, verifyApartmentAccess } from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const hasAccess = await verifyApartmentAccess(user.id, apartmentId);
  if (!hasAccess) return forbidden();

  const members = await prisma.apartmentMember.findMany({
    where: { apartmentId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      joinedAt: m.joinedAt,
    })),
  );
}
