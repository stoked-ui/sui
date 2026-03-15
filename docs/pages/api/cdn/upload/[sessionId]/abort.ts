import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { abortCdnUpload } from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  if (!canManageCdnPath(req.user)) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  const sessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  if (!sessionId) {
    res.status(400).json({ message: 'sessionId is required' });
    return;
  }

  try {
    await abortCdnUpload(req.user.sub, sessionId);
    res.status(204).end();
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to abort upload';
    res.status(500).json({ message });
    return;
  }
}

export default withAuth(handler);
