'use client';

import { getExpirationStatus } from '@/lib/expiration';

interface ExpirationBadgeProps {
  expirationDate: Date | string | null;
}

const statusStyles = {
  expired: 'bg-red-100 text-red-700',
  'expiring-soon': 'bg-orange-100 text-orange-700',
  normal: 'bg-green-100 text-green-700',
  'no-date': 'bg-gray-100 text-gray-500',
};

export function ExpirationBadge({ expirationDate }: ExpirationBadgeProps) {
  const status = getExpirationStatus(expirationDate);

  if (status === 'no-date') return null;

  const dateStr = expirationDate
    ? new Date(expirationDate).toLocaleDateString()
    : '';

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusStyles[status]}`}>
      {dateStr}
    </span>
  );
}
