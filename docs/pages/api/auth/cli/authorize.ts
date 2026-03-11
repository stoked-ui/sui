import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from 'docs/src/modules/auth/withAuth';
import { createApiKey } from 'docs/src/modules/auth/apiKeyStore';
import { findUserByEmail, impersonateUser } from 'docs/src/modules/auth/authStore';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { port, state, name, impersonateEmail } = req.body || {};
  if (!port || !state) {
    return res.status(400).json({ message: 'port and state are required' });
  }

  try {
    const keyName = typeof name === 'string' && name.length > 0 ? name : 'stoked CLI';
    let authorizedUser = {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      clientId: req.user.clientId,
    };

    if (typeof impersonateEmail === 'string' && impersonateEmail.trim().length > 0) {
      const targetUser = await findUserByEmail(impersonateEmail.trim());
      if (!targetUser) {
        return res.status(404).json({ message: `User not found for ${impersonateEmail}` });
      }

      const impersonated = await impersonateUser(req.user.sub, targetUser._id.toString());
      authorizedUser = {
        id: impersonated.user.id,
        email: impersonated.user.email,
        name: impersonated.user.name,
        role: impersonated.user.role,
        clientId: impersonated.user.clientId,
      };
    }

    const { key, info } = await createApiKey(authorizedUser.id, keyName);

    return res.status(200).json({
      key,
      info,
      port,
      state,
      user: {
        email: authorizedUser.email,
        name: authorizedUser.name,
        role: authorizedUser.role,
        clientId: authorizedUser.clientId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create API key';
    return res.status(500).json({ message });
  }
}

export default withAuth(handler);
