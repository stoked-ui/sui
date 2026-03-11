import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken, UserRole } from './authStore';
import { validateApiKey } from './apiKeyStore';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
    clientId?: string;
    clientSlug?: string;
  };
}

type AuthOptions = {
  roles?: UserRole[];
};

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void, options?: AuthOptions): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let token = '';
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    } else if (req.url?.includes('token=')) {
      // Fallback for when req.query might not be populated yet (e.g. in some middleware or direct calls)
      try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        token = url.searchParams.get('token') || '';
      } catch (e) {
        console.error('withAuth: Failed to parse URL for token:', e);
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid authorization' });
    }

    try {
      let user: AuthenticatedRequest['user'];

      if (token.startsWith('sk_')) {
        // API key authentication
        const apiKeyUser = await validateApiKey(token);
        if (!apiKeyUser) {
          console.error('withAuth: Invalid API key');
          return res.status(401).json({ message: 'Invalid or revoked API key' });
        }
        user = apiKeyUser;
      } else {
        // JWT authentication
        user = verifyToken(token);
      }

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
