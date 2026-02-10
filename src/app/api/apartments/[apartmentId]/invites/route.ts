import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, verifyApartmentOwner } from '@/lib/api-utils';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;
  const isOwner = await verifyApartmentOwner(user.id, apartmentId);
  if (!isOwner) return forbidden();

  const token = randomBytes(32).toString('base64url');

  const invite = await prisma.inviteLink.create({
    data: {
      apartmentId,
      createdById: user.id,
      token,
    },
  });

  const url = new URL(`/api/invites/${token}/accept`, request.url);

  return NextResponse.json(
    { id: invite.id, token: invite.token, url: url.toString() },
    { status: 201 },
  );
}
