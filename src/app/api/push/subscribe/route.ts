import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, unauthorized, badRequest } from '@/lib/api-utils';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { endpoint, keys } = body as {
    endpoint?: string;
    keys?: { p256dh: string; auth: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return badRequest('Invalid subscription data');
  }

  // Upsert by userId + endpoint
  await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: { userId: user.id, endpoint },
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    create: {
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true });
}
