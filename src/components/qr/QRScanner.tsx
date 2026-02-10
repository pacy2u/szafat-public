'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const t = useTranslations('qr');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode('qr-scanner');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          onScan(decodedText);
        },
        () => {},
      )
      .catch(() => {
        setError(t('cameraError'));
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan, t]);

  return (
    <div className="space-y-2">
      <div id="qr-scanner" ref={containerRef} className="w-full rounded-lg overflow-hidden" />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
