import type { NextApiRequest, NextApiResponse } from 'next';
import { retrieveStripeCheckoutSession } from 'docs/src/modules/license/stripeClient';
import { findLicenseBySubscriptionId } from 'docs/src/modules/license/licenseStore';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { session_id: sessionId } = req.query;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'session_id is required' });
  }

  try {
    const session = await retrieveStripeCheckoutSession(sessionId);

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : '';

    if (!subscriptionId) {
      return res.status(404).json({ message: 'No subscription found for this session' });
    }

    const license = await findLicenseBySubscriptionId(subscriptionId);
    if (!license) {
      return res.status(404).json({ message: 'License not yet created' });
    }

    return res.status(200).json({
      key: license.key,
      productId: license.productId,
    });
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to look up checkout session');
  }
}
