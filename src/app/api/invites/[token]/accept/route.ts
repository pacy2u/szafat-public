import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, notFound } from '@/lib/api-utils';

interface Params {
  params: Promise<{ token: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { token } = await params;

  const invite = await prisma.inviteLink.findUnique({
    where: { token },
    include: { apartment: true },
  });

  if (!invite || !invite.active) {
    return notFound('Invite');
  }

  const existingMembership = await prisma.apartmentMember.findUnique({
    where: { apartmentId_userId: { apartmentId: invite.apartmentId, userId: user.id } },
  });

  if (existingMembership) {
    return NextResponse.json(invite.apartment);
  }

  await prisma.apartmentMember.create({
    data: {
      apartmentId: invite.apartmentId,
      userId: user.id,
    },
  });

  return NextResponse.json(invite.apartment);
}
