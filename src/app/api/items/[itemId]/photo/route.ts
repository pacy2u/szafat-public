import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, forbidden, notFound } from '@/lib/api-utils';
import { getPresignedUploadUrls } from '@/lib/photo';

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { storageUnit: true },
  });

  if (!item) return notFound('Item');

  const member = await prisma.apartmentMember.findFirst({
    where: { apartmentId: item.storageUnit.apartmentId, userId: user.id },
  });
  if (!member) return forbidden();

  const urls = await getPresignedUploadUrls(itemId, 'image/webp');

  // Update item with the final public URLs (client will upload to presigned URLs)
  await prisma.item.update({
    where: { id: itemId },
    data: {
      photoUrl: urls.photoUrl,
      thumbnailUrl: urls.thumbnailUrl,
    },
  });

  return NextResponse.json(urls);
}
