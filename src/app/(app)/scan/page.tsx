'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { QRScanner } from '@/components/qr/QRScanner';
import { Button } from '@/components/ui/Button';

interface ScanResult {
  id: string;
  name: string;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  locationPath: string;
  archived: boolean;
  storageUnitId: string;
}

export default function ScanPage() {
  const t = useTranslations('qr');
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleScan(decodedText: string) {
    setScanning(false);

    // Extract item ID from URL (format: .../scan/{itemId})
    const match = decodedText.match(/\/scan\/([a-zA-Z0-9-]+)/);
    if (!match) {
      setError(t('unrecognised'));
      return;
    }

    const itemId = match[1];
    const res = await fetch(`/api/scan/${itemId}`);
    if (!res.ok) {
      setError(t('unrecognised'));
      return;
    }

    const data = await res.json();
    setResult(data);
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setScanning(true);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{t('scanTitle')}</h1>

      {scanning && <QRScanner onScan={handleScan} />}

      {error && (
        <div className="text-center space-y-2">
          <p className="text-red-500">{error}</p>
          <Button size="sm" onClick={handleReset}>{t('scanAgain')}</Button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            {result.thumbnailUrl && (
              <img src={result.thumbnailUrl} alt={result.name} className="w-16 h-16 rounded object-cover" />
            )}
            <div>
              <h2 className="font-bold">{result.name}</h2>
              <p className="text-sm text-gray-500">{result.locationPath}</p>
              {result.archived && (
                <p className="text-sm text-red-500 font-medium">{t('archivedItem')}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => router.push(`/items/${result.id}`)}>
              {t('viewItem')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => router.push(`/storage/${result.storageUnitId}`)}>
              {t('goToLocation')}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleReset}>
              {t('scanAgain')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
