import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, verifyApartmentOwner } from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string; memberId: string }>;
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId, memberId } = await params;
  const isOwner = await verifyApartmentOwner(user.id, apartmentId);
  if (!isOwner) return forbidden();

  const member = await prisma.apartmentMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.apartmentId !== apartmentId) {
    return notFound('Member');
  }

  if (member.userId === user.id) {
    return NextResponse.json(
      { error: 'bad_request', message: 'Cannot remove yourself as owner' },
      { status: 400 },
    );
  }

  await prisma.apartmentMember.delete({ where: { id: memberId } });

  return new NextResponse(null, { status: 204 });
}
