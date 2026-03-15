import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { normalizeCdnPath } from './cdnAccess';

export const CDN_BUCKET =
  process.env.CDN_S3_BUCKET || process.env.BLOG_IMAGE_S3_BUCKET || 'cdn.stokedconsulting.com';
export const CDN_REGION = process.env.AWS_REGION || 'us-east-1';
export const CDN_PUBLIC_BASE_URL =
  process.env.CDN_PUBLIC_BASE_URL || process.env.BLOG_IMAGE_CDN_URL || 'https://cdn.stokedconsulting.com';
export const DIRECTORY_MARKER_NAME = '.cdnkeep';

const s3 = new S3Client({ region: CDN_REGION });

export function buildCdnObjectUrl(key: string) {
  return new URL(key, `${CDN_PUBLIC_BASE_URL.replace(/\/$/, '')}/`).toString();
}

export function directoryMarkerKey(path: string) {
  return `${normalizeCdnPath(path, { directory: true })}${DIRECTORY_MARKER_NAME}`;
}

export function isDirectoryMarkerKey(path: string) {
  return path.endsWith(`/${DIRECTORY_MARKER_NAME}`);
}

export async function createFolder(path: string) {
  const key = directoryMarkerKey(path);
  await s3.send(
    new PutObjectCommand({
      Bucket: CDN_BUCKET,
      Key: key,
      Body: '',
      ContentType: 'application/x-directory',
      CacheControl: 'no-store',
    }),
  );

  return {
    key,
    path: normalizeCdnPath(path, { directory: true }),
  };
}

export async function listAllKeys(prefix: string) {
  const normalizedPrefix = normalizeCdnPath(prefix, { directory: true });
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: CDN_BUCKET,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const item of response.Contents || []) {
      if (item.Key) {
        keys.push(item.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

export async function deleteKeys(keys: string[]) {
  if (!keys.length) {
    return;
  }

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: CDN_BUCKET,
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
        },
      }),
    );
  }
}

export async function deletePath(path: string) {
  const normalizedPath = normalizeCdnPath(path, { directory: path.endsWith('/') });

  if (normalizedPath.endsWith('/')) {
    const keys = await listAllKeys(normalizedPath);
    await deleteKeys(keys);
    return {
      deleted: keys.length,
      path: normalizedPath,
    };
  }

  await deleteKeys([normalizedPath]);
  return {
    deleted: 1,
    path: normalizedPath,
  };
}

export async function movePath(sourcePath: string, destinationPath: string) {
  const source = normalizeCdnPath(sourcePath, { directory: sourcePath.endsWith('/') });
  const destination = normalizeCdnPath(destinationPath, { directory: destinationPath.endsWith('/') });

  if (source === destination) {
    throw new Error('Source and destination are the same');
  }

  if (source.endsWith('/') && destination.startsWith(source)) {
    throw new Error('Cannot move a folder into itself');
  }

  if (source.endsWith('/')) {
    const sourceKeys = await listAllKeys(source);

    for (const key of sourceKeys) {
      const relativeKey = key.slice(source.length);
      const targetKey = `${destination}${relativeKey}`;
      await s3.send(
        new CopyObjectCommand({
          Bucket: CDN_BUCKET,
          CopySource: `${CDN_BUCKET}/${encodeURIComponent(key).replace(/%2F/g, '/')}`,
          Key: targetKey,
        }),
      );
    }

    await deleteKeys(sourceKeys);

    return {
      moved: sourceKeys.length,
      source,
      destination,
    };
  }

  await s3.send(
    new CopyObjectCommand({
      Bucket: CDN_BUCKET,
      CopySource: `${CDN_BUCKET}/${encodeURIComponent(source).replace(/%2F/g, '/')}`,
      Key: destination,
    }),
  );
  await deleteKeys([source]);

  return {
    moved: 1,
    source,
    destination,
    url: buildCdnObjectUrl(destination),
  };
}
