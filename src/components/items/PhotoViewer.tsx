'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';

interface PhotoViewerProps {
  open: boolean;
  onClose: () => void;
  photoUrl: string;
  itemName: string;
}

export function PhotoViewer({ open, onClose, photoUrl, itemName }: PhotoViewerProps) {
  const t = useTranslations();

  return (
    <Modal open={open} onClose={onClose} title={itemName}>
      <div className="flex items-center justify-center">
        <img
          src={photoUrl}
          alt={itemName}
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
      </div>
    </Modal>
  );
}
