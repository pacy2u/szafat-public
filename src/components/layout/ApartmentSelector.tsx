'use client';

import { useTranslations } from 'next-intl';
import type { Apartment } from '@/types';

interface ApartmentSelectorProps {
  apartments: Apartment[];
  currentId: string | null;
  onSwitch: (id: string) => void;
  onCreate: () => void;
}

export function ApartmentSelector({
  apartments,
  currentId,
  onSwitch,
  onCreate,
}: ApartmentSelectorProps) {
  const t = useTranslations('apartments');

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentId || ''}
        onChange={(e) => onSwitch(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
      >
        {apartments.map((apt) => (
          <option key={apt.id} value={apt.id}>
            {apt.name}
          </option>
        ))}
      </select>
      <button
        onClick={onCreate}
        className="text-blue-600 text-sm hover:underline"
        title={t('create')}
      >
        +
      </button>
    </div>
  );
}
