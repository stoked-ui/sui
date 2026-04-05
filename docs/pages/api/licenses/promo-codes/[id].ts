import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { deleteStripePromotionCode } from 'docs/src/modules/license/stripeClient';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { id } = req.query;
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'id is required' });
  }

  try {
    const result = await deleteStripePromotionCode(id);
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to delete promo code');
  }
}

export default withAuth(handler);
