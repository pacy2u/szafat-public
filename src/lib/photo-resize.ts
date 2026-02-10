'use client';

const FULL_MAX_SIZE = 1200;
const THUMB_MAX_SIZE = 300;

function resizeImage(
  img: HTMLImageElement,
  maxSize: number,
): HTMLCanvasElement {
  let { width, height } = img;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = Math.round((height * maxSize) / width);
      width = maxSize;
    } else {
      width = Math.round((width * maxSize) / height);
      height = maxSize;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      type,
      quality,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export interface ResizedPhotos {
  full: Blob;
  thumbnail: Blob;
}

export async function resizePhoto(file: File): Promise<ResizedPhotos> {
  const img = await loadImage(file);

  const fullCanvas = resizeImage(img, FULL_MAX_SIZE);
  const thumbCanvas = resizeImage(img, THUMB_MAX_SIZE);

  const [full, thumbnail] = await Promise.all([
    canvasToBlob(fullCanvas, 'image/webp', 0.85),
    canvasToBlob(thumbCanvas, 'image/webp', 0.8),
  ]);

  return { full, thumbnail };
}
