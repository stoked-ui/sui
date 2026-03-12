import type { NextApiRequest, NextApiResponse } from 'next';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const BUCKET = process.env.CDN_S3_BUCKET || process.env.BLOG_IMAGE_S3_BUCKET || 'cdn.stokedconsulting.com';
const REGION = process.env.AWS_REGION || 'us-east-1';
const CDN_BASE = process.env.CDN_PUBLIC_BASE_URL || process.env.BLOG_IMAGE_CDN_URL || 'https://cdn.stokedconsulting.com';
const DEFAULT_MAX_KEYS = 1000;

const s3 = new S3Client({ region: REGION });

function sanitizePrefix(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value || '';

  return raw
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/\.\.(\/|\\)/g, '')
    .replace(/(.+[^/])$/, '$1/');
}

function parseMaxKeys(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_KEYS;
  }

  return Math.min(Math.floor(parsed), DEFAULT_MAX_KEYS);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const prefix = sanitizePrefix(req.query.prefix);
    const maxKeys = parseMaxKeys(req.query.maxKeys);

    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        Delimiter: '/',
        MaxKeys: maxKeys,
      }),
    );

    const folders =
      result.CommonPrefixes?.map(({ Prefix }) => ({
        name: Prefix?.slice(prefix.length) || '',
        path: Prefix || '',
        url: `/?prefix=${encodeURIComponent(Prefix || '')}`,
      })) || [];

    const objects =
      result.Contents?.filter(({ Key }) => Boolean(Key && Key !== prefix))
        .map(({ Key, LastModified, Size }) => ({
          name: (Key || '').slice(prefix.length),
          path: Key || '',
          size: Size || 0,
          lastModified: LastModified?.toISOString() || null,
          url: new URL(Key || '', `${CDN_BASE.replace(/\/$/, '')}/`).toString(),
        })) || [];

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return res.status(200).json({
      bucket: BUCKET,
      prefix,
      truncated: result.IsTruncated || false,
      nextContinuationToken: result.NextContinuationToken || null,
      folders,
      objects,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list CDN contents';
    console.error('CDN contents error:', error);
    return res.status(500).json({ message });
  }
}
