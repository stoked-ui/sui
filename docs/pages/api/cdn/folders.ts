import type { NextApiResponse } from 'next';
import { canManageCdnPath } from 'docs/src/modules/cdn/cdnAccess';
import { createFolder } from 'docs/src/modules/cdn/cdnMutations';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!canManageCdnPath(req.user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { path } = req.body || {};
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ message: 'path is required' });
  }

  try {
    const folder = await createFolder(path);
    return res.status(201).json(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
