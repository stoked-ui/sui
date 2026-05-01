import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { filterCdnContents, canSeeCdnEntry, type CdnViewer } from './cdnAccess';
import {
  buildCdnObjectUrl,
  CDN_BUCKET as BUCKET,
  CDN_REGION as REGION,
  isDirectoryMarkerKey,
} from './cdnMutations';

export const DEFAULT_CDN_CONTENTS_MAX_KEYS = 1000;

const s3 = new S3Client({ region: REGION });

export type CdnContentsFormat = 'json' | 'yaml';

export type CdnContentsPayload = {
  bucket: string;
  prefix: string;
  truncated: boolean;
  nextContinuationToken: string | null;
  folders: Array<{
    name: string;
    path: string;
    url: string;
  }>;
  objects: Array<{
    name: string;
    path: string;
    size: number;
    lastModified: string | null;
    url: string;
  }>;
};

type AuthLikeUser = {
  sub: string;
  role: CdnViewer['role'];
  clientSlug?: string;
};

export function isCredentialFailure(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  return message.includes('aws sso login')
    || message.includes('token is expired')
    || message.includes('expired token')
    || message.includes('could not load credentials')
    || message.includes('credential provider')
    || message.includes('resolved credential object is not valid');
}

export function isCdnContentsFormat(value: string | null | undefined): value is CdnContentsFormat {
  return value === 'json' || value === 'yaml';
}

export function sanitizeCdnPrefix(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value || '';

  return raw
    .trim()
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/\.\.(\/|\\)/g, '')
    .replace(/(.+[^/])$/, '$1/');
}

export function normalizeCdnPrefixFromSegments(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join('/') : value || '';
  return sanitizeCdnPrefix(raw);
}

export function parseCdnContentsMaxKeys(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_CDN_CONTENTS_MAX_KEYS;
  }

  return Math.min(Math.floor(parsed), DEFAULT_CDN_CONTENTS_MAX_KEYS);
}

export function buildCdnViewer(user: AuthLikeUser | null | undefined): CdnViewer {
  if (!user) {
    return {
      sub: 'anonymous',
      role: 'anonymous',
    };
  }

  return {
    sub: user.sub,
    role: user.role,
    clientSlug: user.clientSlug,
  };
}

export async function getCdnContentsPayload(
  viewer: CdnViewer,
  options: {
    prefix: string;
    maxKeys: number;
  },
): Promise<CdnContentsPayload> {
  const { prefix, maxKeys } = options;

  if (prefix && !(await canSeeCdnEntry(viewer, { path: prefix }))) {
    const error = new Error('Access denied');
    (error as Error & { status?: number }).status = 403;
    throw error;
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

  return {
    bucket: BUCKET,
    prefix,
    truncated: result.IsTruncated || false,
    nextContinuationToken: result.NextContinuationToken || null,
    folders: visibleContents.folders,
    objects: visibleContents.objects,
  };
}
