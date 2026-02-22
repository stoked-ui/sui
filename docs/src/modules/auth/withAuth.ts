import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken, UserRole } from './authStore';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
    clientId?: string;
  };
}

type AuthOptions = {
  roles?: UserRole[];
};

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void, options?: AuthOptions): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);
    try {
      const decoded = verifyToken(token);
      if (options?.roles && !options.roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      (req as AuthenticatedRequest).user = decoded;
      return handler(req as AuthenticatedRequest, res);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
