import type { NextApiResponse } from 'next';
import { withAuth, type AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
}

export default withAuth(handler);
