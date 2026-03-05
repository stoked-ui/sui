import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createApiKey } from 'docs/src/modules/auth/apiKeyStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { port, state, name } = req.body || {};
  if (!port || !state) {
    return res.status(400).json({ message: 'port and state are required' });
  }

  try {
    const keyName = typeof name === 'string' && name.length > 0 ? name : 'bstoked CLI';
    const { key, info } = await createApiKey(req.user.sub, keyName);

    return res.status(200).json({
      key,
      info,
      port,
      state,
      user: {
        email: req.user.email,
        name: req.user.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create API key';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
