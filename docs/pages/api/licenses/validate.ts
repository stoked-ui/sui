import type { NextApiRequest, NextApiResponse } from 'next';
import { validateLicense } from 'docs/src/modules/license/licenseStore';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { key, hardwareId } = req.body || {};
  if (
    typeof key !== 'string' ||
    !key.trim() ||
    typeof hardwareId !== 'string' ||
    !hardwareId.trim()
  ) {
    return res.status(422).json({ message: 'key and hardwareId are required' });
  }

  try {
    const result = await validateLicense({ key: key.trim(), hardwareId: hardwareId.trim() });
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to validate license');
  }
}
