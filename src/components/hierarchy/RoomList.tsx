'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StorageUnitCard } from './StorageUnitCard';
import type { RoomWithUnits } from '@/types';
import Link from 'next/link';

interface RoomListProps {
  rooms: RoomWithUnits[];
  apartmentId: string;
  onAddRoom: () => void;
  onRefresh: () => void;
}

export function RoomList({ rooms, apartmentId, onAddRoom, onRefresh }: RoomListProps) {
  const t = useTranslations('rooms');

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button size="sm" onClick={onAddRoom}>
          {t('add')}
        </Button>
      </div>

      {rooms.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🏠</span>
          <p className="empty-state-text">{t('empty')}</p>
        </div>
      )}

      <div className="space-y-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <div className="flex items-center justify-between mb-2">
              <Link href={`/rooms/${room.id}`} className="font-medium hover:text-blue-600">
                {room.name}
              </Link>
            </div>
            {room.storageUnits.length > 0 && (
              <div className="space-y-2 ml-3">
                {room.storageUnits.map((unit) => (
                  <StorageUnitCard key={unit.id} unit={unit} onRefresh={onRefresh} />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
