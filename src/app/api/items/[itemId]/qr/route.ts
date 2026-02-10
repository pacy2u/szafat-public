import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, notFound } from '@/lib/api-utils';
import { generateQRCodePNG, generateQRCodeSVG } from '@/lib/qr';

interface Params {
  params: Promise<{ itemId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { itemId } = await params;
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return notFound('Item');

  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'png';
  const size = parseInt(url.searchParams.get('size') || '300', 10);

  if (format === 'svg') {
    const svg = await generateQRCodeSVG(itemId);
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  const png = await generateQRCodePNG(itemId, size);
  return new NextResponse(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
