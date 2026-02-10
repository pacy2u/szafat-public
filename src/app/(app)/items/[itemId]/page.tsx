'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PhotoCapture } from '@/components/items/PhotoCapture';
import { PhotoViewer } from '@/components/items/PhotoViewer';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { resizePhoto } from '@/lib/photo-resize';
import type { Item } from '@/types';

interface ItemDetail extends Item {
  locationPath: string;
}

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const t = useTranslations();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${itemId}`)
      .then((r) => r.json())
      .then(setItem);
  }, [itemId]);

  async function handleArchive() {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    router.back();
  }

  async function handlePermanentDelete() {
    await fetch(`/api/items/${itemId}/permanent`, { method: 'DELETE' });
    router.back();
  }

  async function handlePhotoCapture(file: File) {
    setUploading(true);
    const { full, thumbnail } = await resizePhoto(file);

    const urlRes = await fetch(`/api/items/${itemId}/photo`, { method: 'POST' });
    if (urlRes.ok) {
      const urls = await urlRes.json();
      await Promise.all([
        fetch(urls.uploadUrl, { method: 'PUT', body: full, headers: { 'Content-Type': 'image/webp' } }),
        fetch(urls.thumbnailUploadUrl, { method: 'PUT', body: thumbnail, headers: { 'Content-Type': 'image/webp' } }),
      ]);
      setItem((prev) => prev ? { ...prev, photoUrl: urls.photoUrl, thumbnailUrl: urls.thumbnailUrl } : prev);
    }
    setUploading(false);
  }

  if (!item) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <div className="p-4 space-y-4">
      {item.photoUrl ? (
        <button type="button" onClick={() => setShowPhotoViewer(true)} className="w-full">
          <img src={item.photoUrl} alt={item.name} className="w-full rounded-lg cursor-pointer" />
        </button>
      ) : (
        <PhotoCapture onCapture={handlePhotoCapture} />
      )}
      {uploading && <p className="text-sm text-gray-500">{t('photos.uploading')}</p>}

      <h1 className="text-xl font-bold">{item.name}</h1>

      <div className="text-sm text-gray-500">
        <p>{t('items.location')}: {item.locationPath}</p>
        {item.expirationDate && (
          <p>{t('items.expirationDate')}: {new Date(item.expirationDate).toLocaleDateString()}</p>
        )}
        {item.archived && <p className="text-red-500 font-medium">{t('items.archived')}</p>}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="secondary" onClick={() => setShowQR(!showQR)}>
          {t('qr.generate')}
        </Button>
        {!item.archived && (
          <Button variant="danger" size="sm" onClick={() => setShowArchiveConfirm(true)}>
            {t('items.archive')}
          </Button>
        )}
        {item.archived && (
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            {t('items.permanentDelete')}
          </Button>
        )}
      </div>

      {showQR && <QRGenerator itemId={item.id} itemName={item.name} />}

      <ConfirmDialog
        open={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
        title={t('items.archive')}
        message="Archive this item?"
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handlePermanentDelete}
        title={t('items.permanentDelete')}
        message={t('items.permanentDeleteConfirm')}
      />

      {item.photoUrl && (
        <>
          <PhotoViewer
            open={showPhotoViewer}
            onClose={() => setShowPhotoViewer(false)}
            photoUrl={item.photoUrl}
            itemName={item.name}
          />
          <PhotoCapture
            onCapture={handlePhotoCapture}
            currentPhotoUrl={item.photoUrl}
          />
        </>
      )}
    </div>
  );
}
