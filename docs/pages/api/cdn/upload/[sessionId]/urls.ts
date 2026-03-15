import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { getMoreCdnUploadUrls } from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const sessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  const { partNumbers } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }
  if (!Array.isArray(partNumbers)) {
    return res.status(400).json({ message: 'partNumbers must be an array' });
  }

  try {
    const presignedUrls = await getMoreCdnUploadUrls(
      req.user.sub,
      sessionId,
      partNumbers.filter((value): value is number => Number.isInteger(value)),
    );
    return res.status(200).json({ presignedUrls });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get upload URLs';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
