'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  currentPhotoUrl?: string | null;
}

export function PhotoCapture({ onCapture, currentPhotoUrl }: PhotoCaptureProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl ?? null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onCapture(file);
  }

  return (
    <div className="space-y-3">
      {preview && (
        <img
          src={preview}
          alt=""
          className="w-full max-h-48 object-cover rounded-lg"
        />
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
        >
          {t('photos.takePhoto')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {t('photos.uploadPhoto')}
        </Button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
