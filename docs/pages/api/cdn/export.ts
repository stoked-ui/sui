import type { NextApiRequest, NextApiResponse } from 'next';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  canSeeCdnEntry,
  canViewCdnPath,
  normalizeCdnPath,
  type CdnViewer,
} from 'docs/src/modules/cdn/cdnAccess';
import {
  CDN_BUCKET,
  CDN_REGION,
  isDirectoryMarkerKey,
  listAllKeys,
} from 'docs/src/modules/cdn/cdnMutations';
import { readOptionalAuthUser } from 'docs/src/modules/auth/withAuth';

const archiver = require('archiver');

export const config = {
  api: {
    responseLimit: false,
  },
};

const s3 = new S3Client({ region: CDN_REGION });

function basenameForPath(path: string) {
  const normalized = path.replace(/\/$/, '');
  const segments = normalized.split('/').filter(Boolean);
  return segments[segments.length - 1] || 'download';
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const rawPath = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
  if (!rawPath || typeof rawPath !== 'string') {
    res.status(400).json({ message: 'path is required' });
    return;
  }

  const user = await readOptionalAuthUser(req);
  const isDirectory = rawPath.endsWith('/');
  const path = normalizeCdnPath(rawPath, { directory: isDirectory });
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

  const canAccess = isDirectory
    ? await canSeeCdnEntry(viewer, { path })
    : await canViewCdnPath(viewer, path);

  if (!canAccess) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  try {
    if (!isDirectory) {
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: CDN_BUCKET,
          Key: path,
        }),
      );

      res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${basenameForPath(path)}"`,
      );

      if (response.Body) {
        // @ts-ignore Node.js stream from AWS SDK
        response.Body.pipe(res);
        return;
      }

      res.status(404).json({ message: 'File not found' });
      return;
    }

    const keys = (await listAllKeys(path)).filter((key) => !isDirectoryMarkerKey(key));
    const visibleKeys: string[] = [];
    for (const key of keys) {
      if (await canViewCdnPath(viewer, key)) {
        visibleKeys.push(key);
      }
    }

    if (!visibleKeys.length) {
      res.status(404).json({ message: 'No exportable files found' });
      return;
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${basenameForPath(path)}.zip"`,
    );

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (error: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
        return;
      }

      res.destroy(error);
    });

    archive.pipe(res);

    for (const key of visibleKeys) {
      const object = await s3.send(
        new GetObjectCommand({
          Bucket: CDN_BUCKET,
          Key: key,
        }),
      );

      if (!object.Body) {
        continue;
      }

      archive.append(
        // @ts-ignore Node.js stream from AWS SDK
        object.Body,
        {
          name: key.slice(path.length),
        },
      );
    }

    await archive.finalize();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export path';
    if (!res.headersSent) {
      res.status(500).json({ message });
      return;
    }

    res.destroy(error as Error);
  }
}

export default handler;
