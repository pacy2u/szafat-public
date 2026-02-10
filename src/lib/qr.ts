import QRCode from 'qrcode';

export function getItemUrl(itemId: string): string {
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/scan/${itemId}`;
}

export async function generateQRCodePNG(itemId: string, size = 300): Promise<Buffer> {
  const url = getItemUrl(itemId);
  return QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRCodeSVG(itemId: string): Promise<string> {
  const url = getItemUrl(itemId);
  return QRCode.toString(url, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}
