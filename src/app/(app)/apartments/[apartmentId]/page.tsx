'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { ApartmentWithHierarchy } from '@/types';
import Link from 'next/link';

export default function ApartmentDetailPage() {
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const t = useTranslations();
  const [apartment, setApartment] = useState<ApartmentWithHierarchy | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/apartments/${apartmentId}`)
      .then((r) => r.json())
      .then(setApartment);
  }, [apartmentId]);

  async function handleAddRoom() {
    if (!roomName.trim() || adding) return;
    setAdding(true);
    const res = await fetch(`/api/apartments/${apartmentId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName.trim() }),
    });
    if (res.ok) {
      const room = await res.json();
      setApartment((prev) =>
        prev ? { ...prev, rooms: [...prev.rooms, { ...room, storageUnits: [] }] } : prev,
      );
      setRoomName('');
      setShowAddRoom(false);
    }
    setAdding(false);
  }

  if (!apartment) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{apartment.name}</h1>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{t('rooms.title')}</h2>
          <Button size="sm" onClick={() => setShowAddRoom(true)}>
            {t('rooms.add')}
          </Button>
        </div>

        <Modal
          open={showAddRoom}
          onClose={() => setShowAddRoom(false)}
          title={t('rooms.add')}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddRoom();
            }}
            className="space-y-4"
          >
            <Input
              label={t('rooms.name')}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              autoFocus
              required
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddRoom(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={adding || !roomName.trim()}>
                {adding ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </Modal>

        {apartment.rooms.length === 0 && (
          <p className="text-gray-500 text-sm">{t('common.noResults')}</p>
        )}

        <div className="space-y-2">
          {apartment.rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card>
                <h3 className="font-medium">{room.name}</h3>
                <p className="text-sm text-gray-500">
                  {room.storageUnits.length} storage units
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => window.open(`/api/apartments/${apartmentId}/export`, '_blank')}
      >
        {t('apartments.export')}
      </Button>

      {apartment.orphanedUnits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">{t('sieroty.title')}</h2>
          <p className="text-sm text-gray-500 mb-2">{t('sieroty.description')}</p>
          <div className="space-y-2">
            {apartment.orphanedUnits.map((unit) => (
              <Card key={unit.id}>
                <h3 className="font-medium">{unit.name}</h3>
                <p className="text-sm text-gray-500">{unit.type}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
