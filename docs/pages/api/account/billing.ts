import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from 'docs/src/modules/auth/withAuth';
import { getAccountBillingSummary } from 'docs/src/modules/account/accountStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const billing = await getAccountBillingSummary(req.user.email);
    return res.status(200).json(billing);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load billing information';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
