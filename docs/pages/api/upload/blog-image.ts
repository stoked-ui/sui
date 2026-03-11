import type { NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '40mb',
    },
  },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const BUCKET = process.env.BLOG_IMAGE_S3_BUCKET || 'cdn.stokedconsulting.com';
const REGION = process.env.AWS_REGION || 'us-east-1';
const CDN_BASE = process.env.BLOG_IMAGE_CDN_URL || 'https://cdn.stokedconsulting.com';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { file, filename, contentType } = req.body as {
      file: string; // base64-encoded
      filename: string;
      contentType: string;
    };

    if (!file || !filename || !contentType) {
      return res.status(400).json({ message: 'Missing file, filename, or contentType' });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({
        message: `Unsupported image type: ${contentType}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
      });
    }

    const buffer = Buffer.from(file, 'base64');

    if (buffer.length > 40 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Maximum size is 40MB.' });
    }

    const ext = EXT_MAP[contentType] || 'jpg';
    const timestamp = Date.now();
    const safeName = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
      .slice(0, 60);
    const key = `blog/images/${timestamp}-${safeName}.${ext}`;

    const s3 = new S3Client({ region: REGION });
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const cdnUrl = `${CDN_BASE.replace(/\/$/, '')}/${key}`;
    return res.status(200).json({ url: cdnUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('Blog image upload error:', err);
    return res.status(500).json({ message });
  }
}

export default withAuth(handler, { roles: ['admin'] });
