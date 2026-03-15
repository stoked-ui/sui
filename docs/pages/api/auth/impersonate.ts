import type { NextApiResponse } from 'next';
import { impersonateUser } from 'docs/src/modules/auth/authStore';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { setAuthSession } from 'docs/src/modules/auth/session';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { targetId } = req.body || {};
  if (!targetId) {
    return res.status(400).json({ message: 'targetId is required' });
  }

  try {
    const result = await impersonateUser(req.user.sub, targetId);
    setAuthSession(res, result);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Impersonation failed';
    return res.status(403).json({ message });
  }
}

export default withAuth(handler);
