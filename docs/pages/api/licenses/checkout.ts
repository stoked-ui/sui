import type { NextApiRequest, NextApiResponse } from 'next';
import { createCheckoutSession } from 'docs/src/modules/license/stripeClient';
import {
  getLicenseProductOrThrow,
} from 'docs/src/modules/license/licenseStore';
import {
  handleLicenseApiError,
  isValidEmail,
  isValidUrl,
} from 'docs/src/modules/license/licenseApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, email, successUrl, cancelUrl } = req.body || {};

  if (!productId || !email || !successUrl || !cancelUrl) {
    return res.status(400).json({ message: 'productId, email, successUrl, and cancelUrl are required' });
  }

  if (!isValidEmail(String(email))) {
    return res.status(400).json({ message: 'email must be a valid email address' });
  }

  if (!isValidUrl(String(successUrl)) || !isValidUrl(String(cancelUrl))) {
    return res.status(400).json({ message: 'successUrl and cancelUrl must be valid http(s) URLs' });
  }

  try {
    const product = await getLicenseProductOrThrow(String(productId));
    const checkoutUrl = await createCheckoutSession(
      {
        productId: String(productId),
        email: String(email),
        successUrl: String(successUrl),
        cancelUrl: String(cancelUrl),
      },
      product,
    );

    return res.status(200).json({ checkoutUrl });
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to create checkout session');
  }
}
