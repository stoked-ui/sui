import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { listApiKeys } from 'docs/src/modules/auth/apiKeyStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const keys = await listApiKeys(req.user.sub);
    return res.status(200).json(keys);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list API keys';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
