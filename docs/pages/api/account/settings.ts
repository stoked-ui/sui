import type { NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from 'docs/src/modules/auth/withAuth';
import {
  getAccountSettings,
  updateAccountSettings,
} from 'docs/src/modules/account/accountStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await getAccountSettings(req.user.sub);
      return res.status(200).json(settings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load account settings';
      return res.status(500).json({ message });
    }
  }

  if (req.method === 'PATCH') {
    const notificationPreferences = req.body?.notificationPreferences;

    if (!notificationPreferences || typeof notificationPreferences !== 'object') {
      return res.status(400).json({ message: 'notificationPreferences is required' });
    }

    try {
      const settings = await updateAccountSettings(req.user.sub, {
        ownedProductUpdates: Boolean(notificationPreferences.ownedProductUpdates),
        otherProductUpdates: Boolean(notificationPreferences.otherProductUpdates),
      });
      return res.status(200).json(settings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update account settings';
      return res.status(500).json({ message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default withAuth(handler);
