import type { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { loginWithGooglePayload } from 'docs/src/modules/auth/authStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: 'Google login is not configured' });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: token, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Google token missing email' });
    }

    const name = payload.name || payload.email.split('@')[0];
    const result = await loginWithGooglePayload(payload.email, name, payload.picture);
    return res.status(200).json(result);
  } catch {
    return res.status(401).json({ message: 'Invalid Google token' });
  }
}
