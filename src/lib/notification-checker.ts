import { prisma } from '@/lib/db';
import { sendNotification } from '@/lib/push';

export async function checkExpirations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find items expiring today or already expired, not archived
  const expiringItems = await prisma.item.findMany({
    where: {
      archived: false,
      expirationDate: { lte: tomorrow },
    },
    include: {
      storageUnit: {
        include: {
          apartment: {
            include: {
              members: {
                include: { user: true },
              },
            },
          },
          room: true,
        },
      },
    },
  });

  // Group by user
  const userItems = new Map<string, typeof expiringItems>();
  for (const item of expiringItems) {
    for (const member of item.storageUnit.apartment.members) {
      const userId = member.userId;
      const existing = userItems.get(userId) || [];
      existing.push(item);
      userItems.set(userId, existing);
    }
  }

  // Send notifications per user
  let sent = 0;
  for (const [userId, items] of userItems) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) continue;

    const payload = {
      title: `${items.length} item(s) expiring`,
      body: items
        .slice(0, 3)
        .map((i) => i.name)
        .join(', '),
      url: '/apartments',
    };

    for (const sub of subscriptions) {
      try {
        await sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        sent++;
      } catch {
        // Remove invalid subscription
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }

  return { checked: expiringItems.length, sent };
}
