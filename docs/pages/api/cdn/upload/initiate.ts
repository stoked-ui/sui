import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { initiateCdnUpload } from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { path, filename, mimeType, totalSize, hash, chunkSize } = req.body || {};
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ message: 'path is required' });
  }
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ message: 'filename is required' });
  }
  if (!mimeType || typeof mimeType !== 'string') {
    return res.status(400).json({ message: 'mimeType is required' });
  }
  if (!Number.isFinite(totalSize) || totalSize <= 0) {
    return res.status(400).json({ message: 'totalSize must be a positive number' });
  }

  try {
    const result = await initiateCdnUpload(req.user.sub, {
      path,
      filename,
      mimeType,
      totalSize,
      hash: typeof hash === 'string' ? hash : undefined,
      chunkSize: Number.isFinite(chunkSize) ? chunkSize : undefined,
    });
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initiate upload';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
