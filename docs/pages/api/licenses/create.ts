import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createLicense, LicenseStoreError } from 'docs/src/modules/license/licenseStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { email, productId, maxActivations } = req.body || {};

  if (!email || !productId) {
    return res.status(400).json({ message: 'email and productId are required' });
  }

  try {
    const license = await createLicense({
      email,
      productId,
      maxActivations,
    });

    return res.status(201).json(license);
  } catch (error: any) {
    if (error instanceof LicenseStoreError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Failed to create manual license:', error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
}

export default withAuth(handler);
