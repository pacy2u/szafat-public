import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound, verifyApartmentOwner } from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string; inviteId: string }>;
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId, inviteId } = await params;
  const isOwner = await verifyApartmentOwner(user.id, apartmentId);
  if (!isOwner) return forbidden();

  const invite = await prisma.inviteLink.findUnique({
    where: { id: inviteId },
  });

  if (!invite || invite.apartmentId !== apartmentId) {
    return notFound('Invite');
  }

  await prisma.inviteLink.update({
    where: { id: inviteId },
    data: { active: false },
  });

  return new NextResponse(null, { status: 204 });
}
