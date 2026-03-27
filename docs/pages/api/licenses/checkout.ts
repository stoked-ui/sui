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

  const {
    productId,
    email,
    successUrl,
    cancelUrl,
    returnUrl,
    stripePriceId,
    uiMode,
  } = req.body || {};

  if (!productId || !email) {
    return res.status(400).json({ message: 'productId and email are required' });
  }

  if (!isValidEmail(String(email))) {
    return res.status(400).json({ message: 'email must be a valid email address' });
  }

  const mode: 'hosted' | 'embedded' = uiMode === 'embedded' ? 'embedded' : 'hosted';

  if (mode === 'embedded') {
    if (!returnUrl) {
      return res.status(400).json({ message: 'returnUrl is required for embedded checkout' });
    }
    if (!isValidUrl(String(returnUrl))) {
      return res.status(400).json({ message: 'returnUrl must be a valid http(s) URL' });
    }
  } else {
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ message: 'successUrl and cancelUrl are required for hosted checkout' });
    }
    if (!isValidUrl(String(successUrl)) || !isValidUrl(String(cancelUrl))) {
      return res.status(400).json({ message: 'successUrl and cancelUrl must be valid http(s) URLs' });
    }
  }

  try {
    const product = await getLicenseProductOrThrow(String(productId));
    const result = await createCheckoutSession(
      {
        productId: String(productId),
        email: String(email),
        successUrl: typeof successUrl === 'string' ? successUrl : undefined,
        cancelUrl: typeof cancelUrl === 'string' ? cancelUrl : undefined,
        returnUrl: typeof returnUrl === 'string' ? returnUrl : undefined,
        stripePriceId: typeof stripePriceId === 'string' ? stripePriceId : undefined,
        uiMode: mode,
      },
      product,
    );

    if (result.mode === 'embedded') {
      return res.status(200).json({ clientSecret: result.clientSecret, sessionId: result.sessionId });
    }
    return res.status(200).json({ checkoutUrl: result.url });
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to create checkout session');
  }
}
