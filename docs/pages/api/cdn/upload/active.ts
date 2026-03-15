import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { listActiveCdnUploads } from 'docs/src/modules/cdn/cdnUploadStore';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const uploads = await listActiveCdnUploads(req.user.sub);
  return res.status(200).json({ uploads });
}

export default withAuth(handler);
