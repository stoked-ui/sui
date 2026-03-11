import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from 'docs/src/modules/auth/withAuth';
import { createAccountBillingPortalUrl } from 'docs/src/modules/account/accountStore';

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const returnUrl = typeof req.body?.returnUrl === 'string' ? req.body.returnUrl : '';
  if (!returnUrl || !isValidHttpUrl(returnUrl)) {
    return res.status(400).json({ message: 'A valid returnUrl is required' });
  }

  try {
    const url = await createAccountBillingPortalUrl(req.user.email, returnUrl);
    return res.status(200).json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create billing portal session';
    return res.status(400).json({ message });
  }
}

export default withAuth(handler);
