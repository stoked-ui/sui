import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { writeLocalDeliverableFile } from 'docs/src/modules/deliverables/localFiles';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const REGION = process.env.AWS_REGION || 'us-east-1';
// This bucket should not be public.
const BUCKET = process.env.DELIVERABLES_PRIVATE_BUCKET || 'stoked-private-deliverables';
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_REQUEST_BYTES = 150 * 1024 * 1024;

class PayloadTooLargeError extends Error {}

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

async function readRequestBody(req: NextApiRequest, maxBytes: number) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on('data', (chunk) => {
      if (settled) {
        return;
      }

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;

      if (totalBytes > maxBytes) {
        settled = true;
        reject(new PayloadTooLargeError(`Payload too large. Maximum request size is ${Math.floor(maxBytes / (1024 * 1024))}MB.`));
        return;
      }

      chunks.push(buffer);
    });

    req.on('end', () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(Buffer.concat(chunks));
    });

    req.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(error);
    });
  });
}

async function parseUploadRequest(req: NextApiRequest) {
  const requestContentType = getSingleValue(req.headers['content-type']) || '';
  const normalizedRequestContentType = requestContentType.split(';')[0]?.trim().toLowerCase();
  const rawBody = await readRequestBody(req, MAX_REQUEST_BYTES);

  if (normalizedRequestContentType === 'application/json') {
    const body = JSON.parse(rawBody.toString('utf8')) as {
      clientId?: string;
      bundleId?: string;
      filePath?: string;
      contentType?: string;
      file?: string;
    };

    return {
      clientId: body.clientId,
      bundleId: body.bundleId,
      filePath: body.filePath,
      contentType: body.contentType,
      buffer: typeof body.file === 'string' ? Buffer.from(body.file, 'base64') : Buffer.alloc(0),
    };
  }

  return {
    clientId: getSingleValue(req.query.clientId),
    bundleId: getSingleValue(req.query.bundleId),
    filePath: getSingleValue(req.query.filePath),
    contentType: normalizedRequestContentType || 'application/octet-stream',
    buffer: rawBody,
  };
}

function sanitizePath(rawPath: string) {
  const normalized = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    throw new Error('Invalid filePath');
  }
  return normalized;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  try {
    const { clientId, bundleId, filePath, contentType, buffer } = await parseUploadRequest(req);

    if (!clientId || !ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Valid clientId is required' });
    }
    if (!bundleId || typeof bundleId !== 'string') {
      return res.status(400).json({ message: 'bundleId is required' });
    }
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ message: 'filePath is required' });
    }
    if (!contentType || typeof contentType !== 'string') {
      return res.status(400).json({ message: 'contentType is required' });
    }

    const safePath = sanitizePath(filePath);
    const safeBundleId = bundleId.replace(/[^a-zA-Z0-9/_-]/g, '-').replace(/^\/+/, '').slice(0, 120);
    if (!safeBundleId) {
      return res.status(400).json({ message: 'bundleId is invalid' });
    }

    if (!buffer.length) {
      return res.status(400).json({ message: 'file is empty' });
    }
    if (buffer.length > MAX_FILE_BYTES) {
      return res.status(413).json({ message: 'File too large. Maximum size is 100MB per file.' });
    }

    const key = `deliverables/${clientId}/${safeBundleId}/${safePath}`;

    // Handle local development by saving to a private local path (outside of public)
    if (process.env.NODE_ENV === 'development') {
      writeLocalDeliverableFile({
        clientId,
        bundleId: safeBundleId,
        filePath: safePath,
        content: buffer,
      });

      // Return the secure proxy URL
      const url = `/api/deliverables/proxy/${clientId}/${safeBundleId}/${safePath}`;
      return res.status(200).json({ key, url });
    }

    const cacheControl = contentType === 'text/html'
      ? 'no-cache'
      : 'private, max-age=31536000, immutable';

    const s3 = new S3Client({ region: REGION });
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl,
    }));

    // Secure proxy URL instead of public CDN
    const url = `/api/deliverables/proxy/${clientId}/${safeBundleId}/${safePath}`;
    return res.status(200).json({ key, url });
  } catch (err: unknown) {
    if (err instanceof PayloadTooLargeError) {
      return res.status(413).json({ message: err.message });
    }

    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    const message = err instanceof Error ? err.message : 'Upload failed';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
