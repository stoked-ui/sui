import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { markCdnUploadPartComplete } from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const sessionId = Array.isArray(req.query.sessionId) ? req.query.sessionId[0] : req.query.sessionId;
  const rawPartNumber = Array.isArray(req.query.partNumber) ? req.query.partNumber[0] : req.query.partNumber;
  const partNumber = Number(rawPartNumber);
  const { etag } = req.body || {};

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }
  if (!Number.isInteger(partNumber) || partNumber <= 0) {
    return res.status(400).json({ message: 'partNumber must be a positive integer' });
  }
  if (!etag || typeof etag !== 'string') {
    return res.status(400).json({ message: 'etag is required' });
  }

  try {
    const result = await markCdnUploadPartComplete(req.user.sub, sessionId, partNumber, etag);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark upload part complete';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
