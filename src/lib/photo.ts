import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const bucket = process.env.S3_BUCKET_NAME || 'szafat-photos';
const publicUrl = process.env.S3_PUBLIC_URL || '';

export async function getPresignedUploadUrls(itemId: string, contentType: string) {
  const fullKey = `photos/${itemId}/full.webp`;
  const thumbKey = `photos/${itemId}/thumb.webp`;

  const [uploadUrl, thumbnailUploadUrl] = await Promise.all([
    getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: fullKey,
        ContentType: contentType,
      }),
      { expiresIn: 3600 },
    ),
    getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        ContentType: contentType,
      }),
      { expiresIn: 3600 },
    ),
  ]);

  return {
    uploadUrl,
    photoUrl: `${publicUrl}/${fullKey}`,
    thumbnailUploadUrl,
    thumbnailUrl: `${publicUrl}/${thumbKey}`,
  };
}
