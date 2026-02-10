export type ExpirationStatus = 'expired' | 'expiring-soon' | 'normal' | 'no-date';

const EXPIRING_SOON_DAYS = 3;

export function getExpirationStatus(expirationDate: Date | string | null): ExpirationStatus {
  if (!expirationDate) return 'no-date';

  const expDate = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expDate);
  exp.setHours(0, 0, 0, 0);

  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= EXPIRING_SOON_DAYS) return 'expiring-soon';
  return 'normal';
}

export function groupByExpiration<T extends { expirationDate: Date | string | null }>(
  items: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  // Sort by expiration date (soonest first), no-date at end
  const sorted = [...items].sort((a, b) => {
    if (!a.expirationDate && !b.expirationDate) return 0;
    if (!a.expirationDate) return 1;
    if (!b.expirationDate) return -1;
    return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
  });

  for (const item of sorted) {
    const key = item.expirationDate
      ? new Date(item.expirationDate).toISOString().split('T')[0]
      : 'no-date';

    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
}
