'use client';

import { useTranslations } from 'next-intl';
import { ItemTile } from '@/components/items/ItemTile';
import { getExpirationStatus } from '@/lib/expiration';
import type { Item } from '@/types';

interface ExpirationGroupProps {
  dateKey: string; // ISO date string or 'no-date'
  items: Item[];
}

const headerStyles = {
  expired: 'text-red-600',
  'expiring-soon': 'text-orange-600',
  normal: 'text-gray-700',
  'no-date': 'text-gray-500',
};

export function ExpirationGroup({ dateKey, items }: ExpirationGroupProps) {
  const t = useTranslations('expiration');

  const isNoDate = dateKey === 'no-date';
  const status = isNoDate ? 'no-date' as const : getExpirationStatus(dateKey);

  const header = isNoDate
    ? t('noDate')
    : new Date(dateKey).toLocaleDateString();

  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${headerStyles[status]}`}>
        {header}
        {status === 'expired' && ` - ${t('expired')}`}
        {status === 'expiring-soon' && ` - ${t('expiringSoon')}`}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <ItemTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
