'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import type { StorageUnitWithChildren } from '@/types';

interface SierotyPanelProps {
  orphanedUnits: StorageUnitWithChildren[];
  onAssignToRoom: (unitId: string) => void;
}

export function SierotyPanel({ orphanedUnits, onAssignToRoom }: SierotyPanelProps) {
  const t = useTranslations('sieroty');

  if (orphanedUnits.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p className="text-sm text-gray-500 mb-2">{t('description')}</p>
      <div className="space-y-2">
        {orphanedUnits.map((unit) => (
          <Card key={unit.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">{unit.name}</h3>
                <span className="text-xs text-gray-500">{unit.type}</span>
              </div>
              <button
                onClick={() => onAssignToRoom(unit.id)}
                className="text-xs text-blue-600 hover:underline"
              >
                {t('assignToRoom')}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
