import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import {
  getCdnUploadStatus,
  syncCdnUploadPartsFromS3,
} from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const sessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }

  try {
    await syncCdnUploadPartsFromS3(req.user.sub, sessionId);
    const status = await getCdnUploadStatus(req.user.sub, sessionId);
    return res.status(200).json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get upload status';
    const statusCode = message === 'Upload session not found' ? 404 : 500;
    return res.status(statusCode).json({ message });
  }
}

export default withAuth(handler);
