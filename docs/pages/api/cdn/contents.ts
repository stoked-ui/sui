import type { NextApiRequest, NextApiResponse } from 'next';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { filterCdnContents, canSeeCdnEntry, type CdnViewer } from 'docs/src/modules/cdn/cdnAccess';
import {
  buildCdnObjectUrl,
  CDN_BUCKET as BUCKET,
  CDN_REGION as REGION,
  isDirectoryMarkerKey,
} from 'docs/src/modules/cdn/cdnMutations';
import { readOptionalAuthUser } from 'docs/src/modules/auth/withAuth';
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const prefix = sanitizePrefix(req.query.prefix);
    const maxKeys = parseMaxKeys(req.query.maxKeys);
    const user = await readOptionalAuthUser(req);
    const viewer: CdnViewer = user
      ? {
          sub: user.sub,
          role: user.role,
          clientSlug: user.clientSlug,
        }
      : {
          sub: 'anonymous',
          role: 'anonymous',
        };

    if (prefix && !(await canSeeCdnEntry(viewer, { path: prefix }))) {
      return res.status(403).json({ message: 'Access denied' });
    }

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
          url: buildCdnObjectUrl(Key || ''),
        })) || [];

    const visibleObjectsWithoutMarkers = objects.filter((object) => !isDirectoryMarkerKey(object.path));

    const visibleContents = await filterCdnContents(viewer, folders, visibleObjectsWithoutMarkers);

    res.setHeader('Cache-Control', 'private, no-store');

    return res.status(200).json({
      bucket: BUCKET,
      prefix,
      truncated: result.IsTruncated || false,
      nextContinuationToken: result.NextContinuationToken || null,
      folders: visibleContents.folders,
      objects: visibleContents.objects,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list CDN contents';
    console.error('CDN contents error:', error);
    return res.status(500).json({ message });
  }
}

export default handler;
