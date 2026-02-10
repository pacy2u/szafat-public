'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { StorageUnitCard } from '@/components/hierarchy/StorageUnitCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Room, StorageUnitWithChildren, StorageUnitType } from '@/types';

interface RoomDetail extends Room {
  storageUnits: StorageUnitWithChildren[];
}

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const t = useTranslations();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState<StorageUnitType>('WARDROBE');
  const [adding, setAdding] = useState(false);

  function refresh() {
    fetchRoom();
  }

  function fetchRoom() {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => r.json())
      .then(setRoom);
  }

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  async function handleAddUnit() {
    if (!unitName.trim() || adding || !room) return;
    setAdding(true);
    const res = await fetch(`/api/apartments/${room.apartmentId}/storage-units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: unitName.trim(), type: unitType, roomId }),
    });
    if (res.ok) {
      const unit = await res.json();
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              storageUnits: [...prev.storageUnits, { ...unit, shelves: [], drawers: [] }],
            }
          : prev,
      );
      setUnitName('');
      setUnitType('WARDROBE');
      setShowAddUnit(false);
    }
    setAdding(false);
  }

  if (!room) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{room.name}</h1>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('storage.name')}</h2>
        <Button size="sm" onClick={() => setShowAddUnit(true)}>
          {t('storage.add')}
        </Button>
      </div>

      <Modal
        open={showAddUnit}
        onClose={() => setShowAddUnit(false)}
        title={t('storage.add')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddUnit();
          }}
          className="space-y-4"
        >
          <Input
            label={t('storage.name')}
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            autoFocus
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('storage.type')}</label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as StorageUnitType)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <option value="WARDROBE">{t('storage.wardrobe')}</option>
              <option value="FRIDGE">{t('storage.fridge')}</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddUnit(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={adding || !unitName.trim()}>
              {adding ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="space-y-2">
        {room.storageUnits.map((unit) => (
          <StorageUnitCard key={unit.id} unit={unit} onRefresh={refresh} />
        ))}
      </div>
    </div>
  );
}
