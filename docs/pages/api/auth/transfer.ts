import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRequestOrigin,
  isAllowedTransferOrigin,
  readSessionTokenFromRequest,
  signAuthTransferToken,
} from 'docs/src/modules/auth/session';

function normalizeReturnTo(targetOrigin: string, rawValue: string | string[] | undefined) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (!value) {
    return `${targetOrigin}/`;
  }

  if (value.startsWith('/')) {
    return new URL(value, targetOrigin).toString();
  }

  const parsed = new URL(value);
  if (parsed.origin !== targetOrigin) {
    throw new Error('returnTo must stay on the target origin');
  }

  return parsed.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const targetOriginValue = Array.isArray(req.query.targetOrigin)
    ? req.query.targetOrigin[0]
    : req.query.targetOrigin;

  if (!targetOriginValue || !isAllowedTransferOrigin(targetOriginValue)) {
    return res.status(400).json({ message: 'A valid targetOrigin is required' });
  }

  const sessionToken = readSessionTokenFromRequest(req);
  if (!sessionToken) {
    const redirectBackTo = new URL(req.url || '/api/auth/transfer', getRequestOrigin(req)).toString();
    const loginUrl = new URL('/consulting/login', getRequestOrigin(req));
    loginUrl.searchParams.set('redirect', redirectBackTo);
    return res.redirect(302, loginUrl.toString());
  }

  try {
    const returnTo = normalizeReturnTo(targetOriginValue, req.query.returnTo);
    const transferToken = signAuthTransferToken(sessionToken, targetOriginValue);
    const exchangeUrl = new URL('/api/auth/exchange', targetOriginValue);
    exchangeUrl.searchParams.set('token', transferToken);
    exchangeUrl.searchParams.set('returnTo', returnTo);
    return res.redirect(302, exchangeUrl.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to transfer session';
    return res.status(400).json({ message });
  }
}
