import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { revokeApiKey } from 'docs/src/modules/auth/apiKeyStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'API key id is required' });
  }

  try {
    const revoked = await revokeApiKey(id, req.user.sub);
    if (!revoked) {
      return res.status(404).json({ message: 'API key not found or already revoked' });
    }
    return res.status(200).json({ message: 'API key revoked' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to revoke API key';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
