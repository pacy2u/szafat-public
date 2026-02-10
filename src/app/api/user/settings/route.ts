import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/api-utils';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { locale: true, dateFormat: true },
  });

  return NextResponse.json(dbUser);
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const updates: Record<string, string> = {};

  if (body.locale && ['PL', 'EN'].includes(body.locale)) {
    updates.locale = body.locale;
  }
  if (body.dateFormat && ['DD_MM_YYYY', 'MM_DD_YYYY'].includes(body.dateFormat)) {
    updates.dateFormat = body.dateFormat;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
    select: { locale: true, dateFormat: true },
  });

  return NextResponse.json(updated);
}
