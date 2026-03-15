import type { NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import {
  getLocalDeliverablePath,
  getLocalDeliverablesRoot,
} from 'docs/src/modules/deliverables/localFiles';
import {
  isSavedNextSnapshotHtml,
  sanitizeSavedNextSnapshotHtml,
} from 'docs/src/modules/deliverables/htmlSnapshot';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    responseLimit: false,
  },
};

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.DELIVERABLES_PRIVATE_BUCKET || 'stoked-private-deliverables';

async function readBodyAsUtf8(
  body:
    | AsyncIterable<Uint8Array | string>
    | { transformToString?: (encoding?: string) => Promise<string> },
) {
  const transformableBody = body as { transformToString?: (encoding?: string) => Promise<string> };

  if (typeof transformableBody.transformToString === 'function') {
    return transformableBody.transformToString('utf8');
  }

  const chunks: Buffer[] = [];

  for await (const chunk of body as AsyncIterable<Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { path: pathArray } = req.query;
  if (!pathArray || !Array.isArray(pathArray) || pathArray.length < 3) {
    return res.status(400).json({ message: 'Invalid path' });
  }

  const clientId = pathArray[0];
  const bundleId = pathArray[1];
  const filePath = pathArray.slice(2).join('/');

  // Authorization check: Admins can see all, clients can only see their own
  if (req.user.role === 'client' && req.user.clientId !== clientId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Handle local development mode (reading from .local_deliverables)
  if (process.env.NODE_ENV === 'development') {
    try {
      const localPath = getLocalDeliverablePath({ clientId, bundleId, filePath });

      // Basic security check to prevent directory traversal
      const normalizedLocalPath = path.normalize(localPath);
      const expectedBasePath = getLocalDeliverablesRoot();
      if (!normalizedLocalPath.startsWith(expectedBasePath)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ message: 'File not found locally' });
      }

      const ext = path.extname(localPath).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.zip': 'application/zip',
        '.pdf': 'application/pdf',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      if (ext === '.html') {
        const html = fs.readFileSync(localPath, 'utf8');

        if (isSavedNextSnapshotHtml(html)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(sanitizeSavedNextSnapshotHtml(html));
        }
      }

      res.setHeader('Content-Type', contentType);

      const stream = fs.createReadStream(localPath);
      stream.pipe(res);
      return;
    } catch (err) {
      console.error('Error reading local file:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Production S3 flow
  const key = `deliverables/${clientId}/${bundleId}/${filePath}`;

  try {
    const s3 = new S3Client({ region: REGION });
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const response = await s3.send(command);
    const isHtml =
      response.ContentType?.includes('text/html') ||
      path.extname(filePath).toLowerCase() === '.html';

    if (isHtml && response.Body) {
      const html = await readBodyAsUtf8(response.Body as AsyncIterable<Uint8Array | string>);
      const output = isSavedNextSnapshotHtml(html) ? sanitizeSavedNextSnapshotHtml(html) : html;

      res.setHeader('Content-Type', response.ContentType || 'text/html; charset=utf-8');
      return res.status(200).send(output);
    }

    if (response.ContentType) {
      res.setHeader('Content-Type', response.ContentType);
    }
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength);
    }

    // Convert Node.js readable stream to Next.js response stream
    if (response.Body) {
      // @ts-ignore - response.Body is a Readable in Node.js
      response.Body.pipe(res);
    } else {
      res.status(404).json({ message: 'File body empty' });
    }
  } catch (err: any) {
    console.error('S3 GetObject Error:', err);
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.status(500).json({ message: 'Failed to fetch file' });
  }
}

export default withAuth(handler);
