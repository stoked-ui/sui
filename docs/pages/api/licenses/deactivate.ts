import type { NextApiRequest, NextApiResponse } from 'next';
import { deactivateLicense } from 'docs/src/modules/license/licenseStore';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';
import { getDb } from 'docs/src/modules/db/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { key, hardwareId, email } = req.body || {};
  if (!key || !hardwareId || !email) {
    return res.status(400).json({ message: 'key, hardwareId, and email are required' });
  }

  try {
    // Verify the license belongs to the email before allowing deactivation
    const db = await getDb();
    const license = await db.collection('licenses').findOne({ key: String(key) });
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    if (license.email?.toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ message: 'Email does not match the license owner' });
    }

    const result = await deactivateLicense({ key: String(key), hardwareId: String(hardwareId) });
    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to deactivate license');
  }
}
