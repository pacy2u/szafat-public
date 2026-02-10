import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound } from '@/lib/api-utils';

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { itemId } = await params;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      storageUnit: {
        include: {
          room: true,
        },
      },
      shelf: true,
      drawer: true,
    },
  });

  if (!item) return notFound('Item');

  // Build location path
  const parts: string[] = [];
  if (item.storageUnit.room) parts.push(item.storageUnit.room.name);
  parts.push(item.storageUnit.name);
  if (item.shelf) parts.push(item.shelf.name);
  if (item.drawer) parts.push(item.drawer.name);
  const locationPath = parts.join(' > ');

  return NextResponse.json({
    id: item.id,
    name: item.name,
    photoUrl: item.photoUrl,
    thumbnailUrl: item.thumbnailUrl,
    locationPath,
    archived: item.archived,
    storageUnitId: item.storageUnitId,
  });
}
