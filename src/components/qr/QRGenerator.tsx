'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface QRGeneratorProps {
  itemId: string;
  itemName: string;
}

export function QRGenerator({ itemId, itemName }: QRGeneratorProps) {
  const t = useTranslations('qr');
  const qrUrl = `/api/items/${itemId}/qr?size=300`;

  async function handleDownload() {
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemName}-qr.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><body style="text-align:center;padding:20px">
        <h2>${itemName}</h2>
        <img src="${qrUrl}" />
        <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>
    `);
  }

  return (
    <div className="space-y-3">
      <img src={qrUrl} alt={`QR code for ${itemName}`} className="mx-auto" />
      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={handleDownload}>
          {t('download')}
        </Button>
        <Button size="sm" variant="secondary" onClick={handlePrint}>
          {t('print')}
        </Button>
      </div>
    </div>
  );
}
