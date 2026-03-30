import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRequestOrigin,
  isAllowedTransferOrigin,
  setAuthSession,
  verifyAuthTransferToken,
} from 'docs/src/modules/auth/session';

function resolveExchangeOrigin(req: NextApiRequest) {
  const returnTo = Array.isArray(req.query.returnTo) ? req.query.returnTo[0] : req.query.returnTo;

  if (typeof returnTo === 'string' && /^https?:\/\//i.test(returnTo)) {
    try {
      const parsed = new URL(returnTo);
      if (isAllowedTransferOrigin(parsed.origin)) {
        return parsed.origin;
      }
    } catch {
      // Fall back to the request-derived origin below.
    }
  }

  return getRequestOrigin(req);
}

function normalizeReturnTo(currentOrigin: string, rawValue: string | string[] | undefined) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (!value) {
    return `${currentOrigin}/`;
  }

  if (value.startsWith('/')) {
    return new URL(value, currentOrigin).toString();
  }

  const parsed = new URL(value);
  if (parsed.origin !== currentOrigin) {
    throw new Error('returnTo must stay on the current origin');
  }

  return parsed.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const tokenValue = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  if (!tokenValue) {
    return res.status(400).json({ message: 'token is required' });
  }

  try {
    const currentOrigin = resolveExchangeOrigin(req);
    const sessionToken = verifyAuthTransferToken(tokenValue, currentOrigin);
    setAuthSession(res, sessionToken);

    const returnTo = normalizeReturnTo(currentOrigin, req.query.returnTo);
    return res.redirect(302, returnTo);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to exchange session';
    return res.status(400).json({ message });
  }
}
