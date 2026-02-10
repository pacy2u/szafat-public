import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, badRequest } from '@/lib/api-utils';

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { items } = body as { items?: Array<{ id: string; sortOrder: number }> };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return badRequest('items array is required');
  }

  await prisma.$transaction(
    items.map((item) =>
      prisma.item.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
