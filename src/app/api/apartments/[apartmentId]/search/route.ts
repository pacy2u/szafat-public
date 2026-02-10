import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, badRequest } from '@/lib/api-utils';
import type { SearchResult } from '@/types';

interface Params {
  params: Promise<{ apartmentId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { apartmentId } = await params;

  const member = await prisma.apartmentMember.findFirst({
    where: { apartmentId, userId: user.id },
  });
  if (!member) return forbidden();

  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim();
  if (!query || query.length < 1) return badRequest('Query is required');

  const pattern = `%${query}%`;
  const limit = 20;

  const [items, rooms, storageUnits, shelves, drawers] = await Promise.all([
    prisma.item.findMany({
      where: {
        storageUnit: { apartmentId },
        name: { contains: query, mode: 'insensitive' },
      },
      include: {
        storageUnit: { include: { room: true } },
        shelf: true,
        drawer: true,
      },
      take: limit,
    }),
    prisma.room.findMany({
      where: { apartmentId, name: { contains: query, mode: 'insensitive' } },
      take: limit,
    }),
    prisma.storageUnit.findMany({
      where: { apartmentId, name: { contains: query, mode: 'insensitive' } },
      include: { room: true },
      take: limit,
    }),
    prisma.shelf.findMany({
      where: {
        storageUnit: { apartmentId },
        name: { contains: query, mode: 'insensitive' },
      },
      include: { storageUnit: { include: { room: true } } },
      take: limit,
    }),
    prisma.drawer.findMany({
      where: {
        storageUnit: { apartmentId },
        name: { contains: query, mode: 'insensitive' },
      },
      include: { storageUnit: { include: { room: true } } },
      take: limit,
    }),
  ]);

  const results: SearchResult[] = [];

  for (const item of items) {
    const parts: string[] = [];
    if (item.storageUnit.room) parts.push(item.storageUnit.room.name);
    parts.push(item.storageUnit.name);
    if (item.shelf) parts.push(item.shelf.name);
    if (item.drawer) parts.push(item.drawer.name);

    results.push({
      type: 'item',
      id: item.id,
      name: item.name,
      locationPath: parts.join(' > '),
      thumbnailUrl: item.thumbnailUrl,
    });
  }

  for (const room of rooms) {
    results.push({
      type: 'room',
      id: room.id,
      name: room.name,
      locationPath: room.name,
      thumbnailUrl: null,
    });
  }

  for (const unit of storageUnits) {
    const parts: string[] = [];
    if (unit.room) parts.push(unit.room.name);
    parts.push(unit.name);

    results.push({
      type: 'storage_unit',
      id: unit.id,
      name: unit.name,
      locationPath: parts.join(' > '),
      thumbnailUrl: null,
    });
  }

  for (const shelf of shelves) {
    const parts: string[] = [];
    if (shelf.storageUnit.room) parts.push(shelf.storageUnit.room.name);
    parts.push(shelf.storageUnit.name);
    parts.push(shelf.name);

    results.push({
      type: 'shelf',
      id: shelf.id,
      name: shelf.name,
      locationPath: parts.join(' > '),
      thumbnailUrl: null,
    });
  }

  for (const drawer of drawers) {
    const parts: string[] = [];
    if (drawer.storageUnit.room) parts.push(drawer.storageUnit.room.name);
    parts.push(drawer.storageUnit.name);
    parts.push(drawer.name);

    results.push({
      type: 'drawer',
      id: drawer.id,
      name: drawer.name,
      locationPath: parts.join(' > '),
      thumbnailUrl: null,
    });
  }

  return NextResponse.json(results.slice(0, limit));
}
