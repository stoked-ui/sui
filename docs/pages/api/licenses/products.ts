import type { NextApiRequest, NextApiResponse } from 'next';
import { listLicenseProducts } from 'docs/src/modules/license/licenseStore';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const products = await listLicenseProducts();
    return res.status(200).json(products);
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to fetch license products');
  }
}
