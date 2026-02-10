'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhotoCapture } from '@/components/items/PhotoCapture';
import { resizePhoto } from '@/lib/photo-resize';

interface ItemFormProps {
  storageUnitId: string;
  shelfId?: string | null;
  drawerId?: string | null;
  onCreated: () => void;
  onCancel: () => void;
}

export function ItemForm({ storageUnitId, shelfId, drawerId, onCreated, onCancel }: ItemFormProps) {
  const t = useTranslations('items');
  const [name, setName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadPhoto(itemId: string) {
    if (!photoFile) return;

    const { full, thumbnail } = await resizePhoto(photoFile);

    const urlRes = await fetch(`/api/items/${itemId}/photo`, { method: 'POST' });
    if (!urlRes.ok) return;

    const urls = await urlRes.json();

    await Promise.all([
      fetch(urls.uploadUrl, {
        method: 'PUT',
        body: full,
        headers: { 'Content-Type': 'image/webp' },
      }),
      fetch(urls.thumbnailUploadUrl, {
        method: 'PUT',
        body: thumbnail,
        headers: { 'Content-Type': 'image/webp' },
      }),
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        storageUnitId,
        shelfId: shelfId || null,
        drawerId: drawerId || null,
        expirationDate: expirationDate || null,
      }),
    });

    if (res.ok) {
      const item = await res.json();
      await uploadPhoto(item.id);
      onCreated();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        label={t('name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
      <Input
        label={t('expirationDate')}
        type="date"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
      />
      <PhotoCapture onCapture={setPhotoFile} />
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {t('add')}
        </Button>
      </div>
    </form>
  );
}
