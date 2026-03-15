import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken, UserRole } from './authStore';
import { validateApiKey } from './apiKeyStore';
import { readSessionTokenFromRequest } from './session';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
    clientId?: string;
    clientSlug?: string;
    avatarUrl?: string;
    impersonatedId?: string;
  };
}

type AuthOptions = {
  roles?: UserRole[];
};

export function readAuthTokenFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  if (req.url?.includes('token=')) {
    // Fallback for when req.query might not be populated yet (e.g. in some middleware or direct calls)
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      return url.searchParams.get('token') || '';
    } catch (error) {
      console.error('withAuth: Failed to parse URL for token:', error);
    }
  }

  return readSessionTokenFromRequest(req) || '';
}

export async function authenticateToken(token: string): Promise<AuthenticatedRequest['user']> {
  if (token.startsWith('sk_')) {
    const apiKeyUser = await validateApiKey(token);
    if (!apiKeyUser) {
      throw new Error('Invalid or revoked API key');
    }

    return apiKeyUser;
  }

  return verifyToken(token);
}

export async function readOptionalAuthUser(req: NextApiRequest) {
  const token = readAuthTokenFromRequest(req);
  if (!token) {
    return null;
  }

  try {
    return await authenticateToken(token);
  } catch (error) {
    console.warn('Optional auth failed:', error);
    return null;
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void, options?: AuthOptions): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = readAuthTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid authorization' });
    }

    try {
      const user = await authenticateToken(token);

      if (options?.roles && !options.roles.includes(user.role)) {
        console.error(`withAuth: Insufficient permissions. User role: ${user.role}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      (req as AuthenticatedRequest).user = user;
      return handler(req as AuthenticatedRequest, res);
    } catch (err) {
      console.error('withAuth: Token verification failed:', err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
