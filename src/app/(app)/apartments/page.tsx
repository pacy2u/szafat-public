'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApartment } from '@/hooks/use-apartment';
import { ApartmentSelector } from '@/components/layout/ApartmentSelector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ApartmentsPage() {
  const t = useTranslations('apartments');
  const { apartments, currentApartmentId, hierarchy, loading, switchApartment, refresh } =
    useApartment();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    const res = await fetch('/api/apartments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName('');
      setShowCreate(false);
      refresh();
    }
  }

  if (loading) return <div className="p-4">{t('title')}...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <ApartmentSelector
          apartments={apartments}
          currentId={currentApartmentId}
          onSwitch={switchApartment}
          onCreate={() => setShowCreate(true)}
        />
      </div>

      {hierarchy && (
        <div className="space-y-3">
          <Link href={`/apartments/${hierarchy.id}`}>
            <Card>
              <h2 className="font-semibold">{hierarchy.name}</h2>
              <p className="text-sm text-gray-500">
                {hierarchy.rooms.length} rooms
              </p>
            </Card>
          </Link>
        </div>
      )}

      {apartments.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🏠</span>
          <p className="empty-state-text">{t('title')}</p>
          <Button onClick={() => setShowCreate(true)}>
            {t('create')}
          </Button>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('create')}>
        <div className="space-y-4">
          <Input
            label={t('name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>{t('create')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
