import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { movePath } from 'docs/src/modules/cdn/cdnMutations';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { sourcePath, destinationPath } = req.body || {};
  if (!sourcePath || typeof sourcePath !== 'string') {
    return res.status(400).json({ message: 'sourcePath is required' });
  }
  if (!destinationPath || typeof destinationPath !== 'string') {
    return res.status(400).json({ message: 'destinationPath is required' });
  }

  try {
    const result = await movePath(sourcePath, destinationPath);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move path';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
