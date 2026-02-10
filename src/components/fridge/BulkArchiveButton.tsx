'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface BulkArchiveButtonProps {
  storageUnitId: string;
  hasExpired: boolean;
  onArchived: () => void;
}

export function BulkArchiveButton({ storageUnitId, hasExpired, onArchived }: BulkArchiveButtonProps) {
  const t = useTranslations('notifications');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!hasExpired) return null;

  async function handleBulkArchive() {
    setLoading(true);
    const res = await fetch('/api/items/bulk-archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storageUnitId }),
    });

    if (res.ok) {
      const { archivedCount } = await res.json();
      onArchived();
    }
    setLoading(false);
    setShowConfirm(false);
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        {t('clearExpired')}
      </Button>
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleBulkArchive}
        title={t('clearExpired')}
        message={t('clearExpiredConfirm')}
      />
    </>
  );
}
