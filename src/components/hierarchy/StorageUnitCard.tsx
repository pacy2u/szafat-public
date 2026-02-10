'use client';

import { useTranslations } from 'next-intl';
import type { StorageUnitWithChildren } from '@/types';
import { ShelfDrawerList } from './ShelfDrawerList';
import Link from 'next/link';

interface StorageUnitCardProps {
  unit: StorageUnitWithChildren;
  onRefresh: () => void;
}

export function StorageUnitCard({ unit, onRefresh }: StorageUnitCardProps) {
  const t = useTranslations('storage');

  const typeLabel = unit.type === 'FRIDGE' ? t('fridge') : t('wardrobe');

  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <Link href={`/storage/${unit.id}`} className="font-medium text-sm hover:text-blue-600">
          {unit.name}
        </Link>
        <span className="text-xs text-gray-500">{typeLabel}</span>
      </div>
      <ShelfDrawerList shelves={unit.shelves} drawers={unit.drawers} onRefresh={onRefresh} />
    </div>
  );
}
