import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, badRequest } from '@/lib/api-utils';
import { validateName } from '@/lib/validation';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const memberships = await prisma.apartmentMember.findMany({
    where: { userId: user.id },
    include: { apartment: true },
  });

  return NextResponse.json(memberships.map((m) => m.apartment));
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { name } = body;

  if (!name) return badRequest('Name is required');
  const nameResult = validateName(name);
  if (!nameResult.valid) return badRequest(nameResult.error!);

  const apartment = await prisma.apartment.create({
    data: {
      name: name.trim(),
      ownerId: user.id,
      members: {
        create: { userId: user.id },
      },
    },
  });

  return NextResponse.json(apartment, { status: 201 });
}
