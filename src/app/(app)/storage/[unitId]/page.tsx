'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ItemGrid } from '@/components/items/ItemGrid';
import { ItemForm } from '@/components/items/ItemForm';
import { DraggableFridgeGrid } from '@/components/fridge/DraggableFridgeGrid';
import { ExpirationGroup } from '@/components/fridge/ExpirationGroup';
import { BulkArchiveButton } from '@/components/fridge/BulkArchiveButton';
import { Button } from '@/components/ui/Button';
import { groupByExpiration, getExpirationStatus } from '@/lib/expiration';
import type { StorageUnitWithChildren } from '@/types';
import type { Item } from '@/types';

interface UnitWithItems extends StorageUnitWithChildren {
  items: Item[];
}

export default function StorageUnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const t = useTranslations();
  const [unit, setUnit] = useState<UnitWithItems | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function fetchUnit() {
    fetch(`/api/storage-units/${unitId}`)
      .then((r) => r.json())
      .then(setUnit);
  }

  useEffect(() => {
    fetchUnit();
  }, [unitId]);

  if (!unit) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{unit.name}</h1>
          <span className="text-sm text-gray-500">{unit.type}</span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          {t('items.add')}
        </Button>
      </div>

      {showAddForm && (
        <ItemForm
          storageUnitId={unitId}
          onCreated={() => {
            setShowAddForm(false);
            fetchUnit();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {unit.type === 'FRIDGE' ? (
        <div className="space-y-4">
          <BulkArchiveButton
            storageUnitId={unitId}
            hasExpired={(unit.items || []).some((i) => getExpirationStatus(i.expirationDate) === 'expired')}
            onArchived={fetchUnit}
          />
          {Array.from(groupByExpiration(unit.items || [])).map(([dateKey, groupItems]) => (
            <ExpirationGroup key={dateKey} dateKey={dateKey} items={groupItems} />
          ))}
          <DraggableFridgeGrid initialItems={unit.items || []} />
        </div>
      ) : (
        <ItemGrid items={unit.items || []} />
      )}
    </div>
  );
}
